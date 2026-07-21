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
                    "codigo_sku": produto.sku if (produto and produto.sku) else "N/A",
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
    
    if config.template_etiqueta:
        html = f"""
        <html>
        <head>
            <meta charset="utf-8">
            <title>Impressão de Etiquetas</title>
            <style>
                body {{ font-family: Arial, sans-serif; padding: 20px; }}
                .etiqueta {{
                    page-break-after: always;
                    box-sizing: border-box;
                }}
            </style>
        </head>
        <body onload="window.print()">
        """
        for p in pedidos:
            tpl = config.template_etiqueta
            tpl = tpl.replace("[[pedido_id]]", str(p.id))
            tpl = tpl.replace("[[cliente_nome]]", p.cliente_nome or "")
            tpl = tpl.replace("[[remetente_nome]]", config.remetente_nome or "")
            tpl = tpl.replace("[[remetente_documento]]", config.remetente_documento or "")
            tpl = tpl.replace("[[remetente_endereco]]", config.remetente_endereco or "")
            tpl = tpl.replace("[[remetente_cidade]]", config.remetente_cidade or "")
            tpl = tpl.replace("[[remetente_estado]]", config.remetente_estado or "")
            tpl = tpl.replace("[[remetente_cep]]", config.remetente_cep or "")
            html += f"<div class='etiqueta'>{tpl}</div>"
        html += "</body></html>"
    else:
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

class RomaneioRequest(BaseModel):
    pedido_ids: List[int]
    motorista: Optional[str] = "Motorista Próprio"
    placa: Optional[str] = None
    transportadora: Optional[str] = None

@router.get("/rotas-regioes")
def get_rotas_por_regiao(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Agrupa todos os pedidos pendentes de expedição por Região (Cidade/UF/Bairro).
    """
    pedidos = db.query(PedidoVenda).filter(
        PedidoVenda.status.in_(["PREPARANDO_ENVIO", "SEPARADO", "FATURADO", "PRONTO_ENVIO"])
    ).all()

    regioes_map = {}

    for p in pedidos:
        cliente = p.cliente
        cidade = cliente.cidade_entrega or cliente.cidade or "Não Informada" if cliente else "Não Informada"
        uf = cliente.uf_entrega or cliente.uf or "UF" if cliente else "UF"
        bairro = cliente.bairro_entrega or cliente.bairro or "" if cliente else ""

        chave_regiao = f"{cidade} - {uf}".strip()

        if chave_regiao not in regioes_map:
            regioes_map[chave_regiao] = {
                "regiao": chave_regiao,
                "cidade": cidade,
                "uf": uf,
                "total_pedidos": 0,
                "valor_total": 0.0,
                "qtd_itens": 0,
                "bairros": set(),
                "pedidos": []
            }

        qtd_itens = sum(item.quantidade for item in p.itens)
        if bairro:
            regioes_map[chave_regiao]["bairros"].add(bairro)

        regioes_map[chave_regiao]["total_pedidos"] += 1
        regioes_map[chave_regiao]["valor_total"] += p.valor_total
        regioes_map[chave_regiao]["qtd_itens"] += qtd_itens

        regioes_map[chave_regiao]["pedidos"].append({
            "id": p.id,
            "cliente_nome": p.cliente_nome,
            "bairro": bairro,
            "cidade": cidade,
            "uf": uf,
            "endereco": f"{cliente.endereco_entrega or cliente.endereco or ''}, {cliente.numero_entrega or cliente.numero or ''}" if cliente else "-",
            "cep": cliente.cep_entrega or cliente.cep if cliente else "-",
            "whatsapp": cliente.whatsapp or cliente.telefone if cliente else "-",
            "valor_total": p.valor_total,
            "qtd_itens": qtd_itens,
            "status": p.status
        })

    resultado = []
    for r in regioes_map.values():
        r["bairros"] = list(r["bairros"])
        resultado.append(r)

    resultado.sort(key=lambda x: x["total_pedidos"], reverse=True)
    return resultado


@router.post("/romaneio-pdf")
def gerar_romaneio_pdf(
    dados: RomaneioRequest,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Gera a Folha de Rota / Romaneio de Carga para impressão.
    """
    config = get_or_create_config(db)
    pedidos = db.query(PedidoVenda).filter(PedidoVenda.id.in_(dados.pedido_ids)).all()

    if not pedidos:
        raise HTTPException(status_code=404, detail="Nenhum pedido encontrado para a rota")

    linhas_html = ""
    total_geral = 0
    total_volumes = 0

    for idx, p in enumerate(pedidos, 1):
        c = p.cliente
        end = f"{c.endereco_entrega or c.endereco or ''}, {c.numero_entrega or c.numero or ''} - {c.bairro_entrega or c.bairro or ''}" if c else "-"
        cid_uf = f"{c.cidade_entrega or c.cidade or ''}/{c.uf_entrega or c.uf or ''}" if c else "-"
        fone = c.whatsapp or c.telefone if c else "-"
        qtd_itens = sum(i.quantidade for i in p.itens)

        total_geral += p.valor_total
        total_volumes += qtd_itens

        linhas_html += f"""
        <tr>
            <td style="text-align: center; font-weight: bold;">{idx}</td>
            <td><strong>#{p.id}</strong></td>
            <td><strong>{p.cliente_nome}</strong><br/><small>Fone: {fone}</small></td>
            <td>{end}<br/><small>{cid_uf} - CEP: {c.cep if c else '-'}</small></td>
            <td style="text-align: center;">{qtd_itens} vol</td>
            <td style="text-align: right;">R$ {p.valor_total:,.2f}</td>
            <td style="height: 40px;"></td>
        </tr>
        """

    data_emissao = datetime.now().strftime("%d/%m/%Y %H:%M")

    html = f"""
    <html>
    <head>
        <meta charset="utf-8">
        <title>Romaneio de Carga - ERP Venner</title>
        <style>
            body {{ font-family: Arial, sans-serif; padding: 20px; font-size: 11px; color: #111; }}
            .header {{ border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 15px; }}
            .title {{ font-size: 18px; font-weight: bold; text-transform: uppercase; }}
            .info-grid {{ display: flex; justify-content: space-between; margin-bottom: 15px; font-size: 12px; border: 1px solid #ccc; padding: 10px; background: #f9f9f9; }}
            table {{ width: 100%; border-collapse: collapse; margin-top: 10px; }}
            th, td {{ border: 1px solid #888; padding: 6px; text-align: left; }}
            th {{ background-color: #eee; font-weight: bold; font-size: 11px; }}
            .summary {{ margin-top: 15px; text-align: right; font-size: 13px; font-weight: bold; }}
            .signatures {{ margin-top: 50px; display: flex; justify-content: space-around; text-align: center; }}
            .sig-line {{ border-top: 1px solid #000; width: 40%; padding-top: 5px; font-size: 11px; }}
        </style>
    </head>
    <body onload="window.print()">
        <div class="header">
            <div class="title">ROMANEIO DE CARGA & MANIFESTO DE ENTREGA</div>
            <div><strong>{config.remetente_nome or 'VENNER INDUSTRIAL'}</strong> - Emissão: {data_emissao}</div>
        </div>

        <div class="info-grid">
            <div><strong>Motorista / Entregador:</strong> {dados.motorista or 'Próprio'}</div>
            <div><strong>Veículo / Placa:</strong> {dados.placa or 'N/A'}</div>
            <div><strong>Transportadora:</strong> {dados.transportadora or 'Frota Própria'}</div>
            <div><strong>Total Entregas:</strong> {len(pedidos)}</div>
        </div>

        <table>
            <thead>
                <tr>
                    <th style="width: 30px;">Parada</th>
                    <th style="width: 60px;">Pedido</th>
                    <th>Destinatário</th>
                    <th>Endereço Completo de Entrega</th>
                    <th style="width: 60px; text-align: center;">Volumes</th>
                    <th style="width: 90px; text-align: right;">Valor Pedido</th>
                    <th style="width: 140px; text-align: center;">Assinatura / Canhoto</th>
                </tr>
            </thead>
            <tbody>
                {linhas_html}
            </tbody>
        </table>

        <div class="summary">
            TOTAL DE VOLUMES: {total_volumes} | VALOR TOTAL DA CARGA: R$ {total_geral:,.2f}
        </div>

        <div class="signatures">
            <div class="sig-line">Assinatura do Motorista / Expedição</div>
            <div class="sig-line">Conferência da Carga</div>
        </div>
    </body>
    </html>
    """
    return HTMLResponse(content=html)

