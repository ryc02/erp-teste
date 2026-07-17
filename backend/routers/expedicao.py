from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from fastapi.responses import HTMLResponse

from database import get_db
from services.auth import get_current_user
from models.vendas import PedidoVenda, PedidoVendaItem
from models.produtos import Produto
from models.configuracoes_expedicao import ConfiguracoesExpedicao
from routers.configuracoes_expedicao import get_or_create_config

router = APIRouter(prefix="/expedicao", tags=["Expedição"])

class ExpedicaoStatusUpdate(BaseModel):
    status: str
    codigo_rastreio: Optional[str] = None
    observacoes_envio: Optional[str] = None
    transportadora: Optional[str] = None

class ExpedicaoAcaoMassa(BaseModel):
    pedido_ids: List[int]

class ExpedicaoEnvioMassa(BaseModel):
    pedido_ids: List[int]
    transportadora: Optional[str] = None

@router.get("/pendentes")
def get_pedidos_pendentes(
    db: Session = Depends(get_db), 
    current_user = Depends(get_current_user)
):
    pedidos = db.query(PedidoVenda).filter(
        PedidoVenda.status.in_(["PREPARANDO_ENVIO", "SEPARADO", "FATURADO", "PRONTO_ENVIO"])
    ).order_by(PedidoVenda.data_pedido.desc()).all()
    
    res = []
    for p in pedidos:
        qtd_itens = sum(item.quantidade for item in p.itens)
        res.append({
            "id": p.id,
            "cliente_nome": p.cliente_nome,
            "data_pedido": p.data_pedido.isoformat() if p.data_pedido else None,
            "status": p.status,
            "valor_total": p.valor_total,
            "qtd_itens": qtd_itens
        })
    return res

@router.post("/acao-massa/enviar")
def marcar_enviados_massa(
    data: ExpedicaoEnvioMassa, 
    db: Session = Depends(get_db), 
    current_user = Depends(get_current_user)
):
    pedidos = db.query(PedidoVenda).filter(PedidoVenda.id.in_(data.pedido_ids)).all()
    count = 0
    for p in pedidos:
        if p.status in ["FATURADO", "PRONTO_ENVIO", "PREPARANDO_ENVIO", "SEPARADO"]:
            p.status = "ENVIADO"
            if data.transportadora:
                p.transportadora = data.transportadora
            count += 1
    db.commit()
    return {"message": f"{count} pedidos marcados como ENVIADO"}

@router.post("/acao-massa/separar")
def marcar_separados_massa(
    data: ExpedicaoAcaoMassa, 
    db: Session = Depends(get_db), 
    current_user = Depends(get_current_user)
):
    pedidos = db.query(PedidoVenda).filter(PedidoVenda.id.in_(data.pedido_ids)).all()
    count = 0
    for p in pedidos:
        if p.status in ["PREPARANDO_ENVIO", "FATURADO"]:
            p.status = "SEPARADO"
            count += 1
    db.commit()
    return {"message": f"{count} pedidos marcados como SEPARADO"}

@router.post("/acao-massa/embalar")
def marcar_embalados_massa(
    data: ExpedicaoAcaoMassa, 
    db: Session = Depends(get_db), 
    current_user = Depends(get_current_user)
):
    pedidos = db.query(PedidoVenda).filter(PedidoVenda.id.in_(data.pedido_ids)).all()
    count = 0
    for p in pedidos:
        if p.status in ["PREPARANDO_ENVIO", "SEPARADO", "FATURADO"]:
            p.status = "PRONTO_ENVIO"
            count += 1
    db.commit()
    return {"message": f"{count} pedidos marcados como PRONTO PARA ENVIO"}

@router.post("/picking")
def gerar_picking_list(
    data: ExpedicaoAcaoMassa, 
    db: Session = Depends(get_db), 
    current_user = Depends(get_current_user)
):
    pedidos = db.query(PedidoVenda).filter(PedidoVenda.id.in_(data.pedido_ids)).all()
    picking_dict = {}
    
    for p in pedidos:
        for item in p.itens:
            prod_id = item.produto_id
            if prod_id not in picking_dict:
                produto = db.query(Produto).filter(Produto.id == prod_id).first()
                picking_dict[prod_id] = {
                    "produto_id": prod_id,
                    "codigo_sku": produto.codigo_sku if (produto and produto.codigo_sku) else "N/A",
                    "nome": produto.nome if produto else f"Produto ID {prod_id}",
                    "localizacao": f"{produto.corredor or ''}/{produto.prateleira or ''}" if produto else "",
                    "quantidade_total": 0,
                    "pedidos": []
                }
            picking_dict[prod_id]["quantidade_total"] += item.quantidade
            if p.id not in picking_dict[prod_id]["pedidos"]:
                picking_dict[prod_id]["pedidos"].append(p.id)
                
    picking_list = list(picking_dict.values())
    picking_list.sort(key=lambda x: x["localizacao"])
    
    return {
        "pedidos_selecionados": data.pedido_ids,
        "itens": picking_list
    }

@router.post("/gerar-etiquetas")
def gerar_etiquetas(
    data: ExpedicaoAcaoMassa,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    config = get_or_create_config(db)
    pedidos = db.query(PedidoVenda).filter(PedidoVenda.id.in_(data.pedido_ids)).all()
    
    # Validação baseada na regra da Olist: não é possível gerar etiqueta se já estiver ENVIADO ou ENTREGUE
    pedidos_validos = [p for p in pedidos if p.status not in ["ENVIADO", "ENTREGUE", "CANCELADO"]]
    
    if not pedidos_validos:
        raise HTTPException(
            status_code=400, 
            detail="Não foi possível obter as etiquetas em sua plataforma e-commerce. Problema nos parâmetros enviados. Wrong parameters, detail: order_list must contain at least 1 item."
        )
    
    html = f"""
    <html>
    <head>
        <meta charset="utf-8">
        <title>Impressão de Etiquetas</title>
        <style>
            body {{ font-family: Arial, sans-serif; padding: 20px; }}
            .etiqueta {{
                border: 2px dashed #000;
                width: 10cm; height: 15cm;
                padding: 20px;
                margin-bottom: 20px;
                page-break-after: always;
                box-sizing: border-box;
            }}
            .barcode {{ background: #000; height: 50px; width: 80%; margin: 20px auto; }}
        </style>
    </head>
    <body onload="window.print()">
    """
    for p in pedidos:
        html += f"""
        <div class="etiqueta">
            <h3>DESTINATÁRIO</h3>
            <p><strong>{p.cliente_nome}</strong></p>
            <p>Pedido #{p.id}</p>
            <div class="barcode"></div>
            <hr>
            <h4>REMETENTE</h4>
            <p>{config.remetente_nome or 'ERP Venner'}</p>
            <p>{config.remetente_documento or ''}</p>
            <p>{config.remetente_endereco or ''}, {config.remetente_cidade or ''}-{config.remetente_estado or ''}</p>
        </div>
        """
    html += "</body></html>"
    return HTMLResponse(content=html)

@router.post("/gerar-dce")
def gerar_dce(
    data: ExpedicaoAcaoMassa,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    config = get_or_create_config(db)
    pedidos = db.query(PedidoVenda).filter(PedidoVenda.id.in_(data.pedido_ids)).all()
    
    html = f"""
    <html>
    <head>
        <meta charset="utf-8">
        <title>Declaração de Conteúdo</title>
        <style>
            body {{ font-family: Arial, sans-serif; padding: 20px; font-size: 12px; }}
            .dce {{ border: 1px solid #000; padding: 20px; margin-bottom: 20px; page-break-after: always; }}
            table {{ width: 100%; border-collapse: collapse; margin-top: 10px; }}
            th, td {{ border: 1px solid #000; padding: 5px; text-align: left; }}
        </style>
    </head>
    <body onload="window.print()">
    """
    for p in pedidos:
        itens_html = ""
        for i in p.itens:
            prod_nome = i.produto.nome if i.produto else f"ID {i.produto_id}"
            itens_html += f"<tr><td>{prod_nome}</td><td>{i.quantidade}</td><td>R$ {i.preco_unitario:.2f}</td></tr>"
            
        html += f"""
        <div class="dce">
            <h2 style="text-align: center;">DECLARAÇÃO DE CONTEÚDO</h2>
            <div>
                <h4>REMETENTE</h4>
                <p>{config.remetente_nome or ''} - CPF/CNPJ: {config.remetente_documento or ''}</p>
                <p>{config.remetente_endereco or ''} - {config.remetente_cidade or ''}/{config.remetente_estado or ''} - CEP: {config.remetente_cep or ''}</p>
            </div>
            <div>
                <h4>DESTINATÁRIO</h4>
                <p>{p.cliente_nome}</p>
                <p>Pedido #{p.id}</p>
            </div>
            <table>
                <tr><th>Descrição do Conteúdo</th><th>Quantidade</th><th>Valor Unit.</th></tr>
                {itens_html}
            </table>
            <div style="margin-top: 40px; text-align: center;">
                <p>Declaro que não me enquadro no conceito de contribuinte e que os produtos não estão sujeitos a tributação.</p>
                <br><br>___________________________________________________<br>Assinatura do Declarante
            </div>
        </div>
        """
    html += "</body></html>"
    return HTMLResponse(content=html)
