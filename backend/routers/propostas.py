from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel

from database import get_db
from models.comercial.proposta import PropostaComercial, PropostaComercialItem
from models.vendas import PedidoVenda, PedidoVendaItem
from models.usuarios import User
from services.auth import get_current_user

router = APIRouter(prefix="/propostas", tags=["Propostas Comerciais"])

class PropostaItemCreate(BaseModel):
    produto_id: int
    quantidade: float
    preco_unitario: float
    desconto_percentual: float = 0.0

class PropostaCreate(BaseModel):
    cliente_id: Optional[int] = None
    representante_id: Optional[int] = None
    vendedor_interno_id: Optional[int] = None
    natureza_operacao: str = "VENDA SIMPLES"
    lista_preco: str = "Padrão"
    validade_dias: int = 7
    status: str = "RASCUNHO"
    valor_frete: float = 0.0
    desconto_valor: float = 0.0
    peso_bruto: float = 0.0
    peso_liquido: float = 0.0
    volumes: float = 1.0
    tags_csv: Optional[str] = None
    observacoes: Optional[str] = None
    itens: List[PropostaItemCreate] = []

@router.get("/")
def get_propostas(
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    query = db.query(PropostaComercial).order_by(PropostaComercial.id.desc())
    if status and status != "TODAS":
        query = query.filter(PropostaComercial.status == status)
        
    propostas = query.all()
    res = []
    for p in propostas:
        res.append({
            "id": p.id,
            "numero": p.numero or p.id,
            "data_proposta": p.data_proposta,
            "prox_contato": p.prox_contato,
            "cliente_id": p.cliente_id,
            "cliente_nome": p.cliente.razao_social if p.cliente else None,
            "valor_total": p.valor_total,
            "status": p.status,
            "tags_csv": p.tags_csv
        })
    return res

@router.get("/{proposta_id}")
def get_proposta(proposta_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    p = db.query(PropostaComercial).filter(PropostaComercial.id == proposta_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Proposta não encontrada")
        
    itens_res = []
    for it in p.itens:
        itens_res.append({
            "id": it.id,
            "produto_id": it.produto_id,
            "produto_nome": it.produto.descricao if it.produto else None,
            "produto_sku": it.produto.sku if it.produto else None,
            "quantidade": it.quantidade,
            "preco_unitario": it.preco_unitario,
            "desconto_percentual": it.desconto_percentual,
            "preco_total": it.preco_total
        })
        
    return {
        "id": p.id,
        "numero": p.numero or p.id,
        "cliente_id": p.cliente_id,
        "representante_id": p.representante_id,
        "vendedor_interno_id": p.vendedor_interno_id,
        "natureza_operacao": p.natureza_operacao,
        "lista_preco": p.lista_preco,
        "data_proposta": p.data_proposta,
        "prox_contato": p.prox_contato,
        "validade_dias": p.validade_dias,
        "status": p.status,
        "valor_frete": p.valor_frete,
        "desconto_valor": p.desconto_valor,
        "valor_total": p.valor_total,
        "peso_bruto": p.peso_bruto,
        "peso_liquido": p.peso_liquido,
        "volumes": p.volumes,
        "tags_csv": p.tags_csv,
        "observacoes": p.observacoes,
        "itens": itens_res
    }

@router.post("/")
def create_proposta(
    data: PropostaCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    # Calcular totais
    valor_itens = 0.0
    for it in data.itens:
        preco_calc = it.quantidade * it.preco_unitario
        desconto_calc = preco_calc * (it.desconto_percentual / 100.0)
        valor_itens += (preco_calc - desconto_calc)
        
    valor_total = valor_itens + data.valor_frete - data.desconto_valor
    
    # Auto-increment simplificado para 'numero'
    max_num = db.query(func.max(PropostaComercial.numero)).scalar() or 0
    numero = max_num + 1

    nova = PropostaComercial(
        numero=numero,
        cliente_id=data.cliente_id,
        representante_id=data.representante_id,
        vendedor_interno_id=data.vendedor_interno_id,
        natureza_operacao=data.natureza_operacao,
        lista_preco=data.lista_preco,
        validade_dias=data.validade_dias,
        status=data.status,
        valor_frete=data.valor_frete,
        desconto_valor=data.desconto_valor,
        valor_total=valor_total,
        peso_bruto=data.peso_bruto,
        peso_liquido=data.peso_liquido,
        volumes=data.volumes,
        tags_csv=data.tags_csv,
        observacoes=data.observacoes
    )
    db.add(nova)
    db.flush() # Para pegar o id
    
    for it in data.itens:
        preco_calc = it.quantidade * it.preco_unitario
        desconto_calc = preco_calc * (it.desconto_percentual / 100.0)
        preco_total = preco_calc - desconto_calc
        
        n_it = PropostaComercialItem(
            proposta_id=nova.id,
            produto_id=it.produto_id,
            quantidade=it.quantidade,
            preco_unitario=it.preco_unitario,
            desconto_percentual=it.desconto_percentual,
            preco_total=preco_total
        )
        db.add(n_it)
        
    db.commit()
    return {"message": "Proposta criada com sucesso", "id": nova.id}

@router.put("/{proposta_id}/status")
def update_status(
    proposta_id: int,
    payload: dict,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    p = db.query(PropostaComercial).filter(PropostaComercial.id == proposta_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Proposta não encontrada")
        
    novo_status = payload.get("status")
    if not novo_status:
        raise HTTPException(status_code=400, detail="Status é obrigatório")
        
    p.status = novo_status
    db.commit()
    return {"message": "Status atualizado"}

@router.post("/{proposta_id}/gerar-venda")
def gerar_venda(
    proposta_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    p = db.query(PropostaComercial).filter(PropostaComercial.id == proposta_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Proposta não encontrada")
        
    if p.status != "APROVADA":
        raise HTTPException(status_code=400, detail="Apenas propostas APROVADAS podem virar pedido")
        
    # Create PedidoVenda
    pv = PedidoVenda(
        tipo="PEDIDO",
        cliente_id=p.cliente_id,
        representante_id=p.representante_id,
        vendedor_interno_id=p.vendedor_interno_id,
        status="EM_ABERTO",
        valor_frete=p.valor_frete,
        desconto_valor=p.desconto_valor,
        valor_total=p.valor_total,
        observacoes=p.observacoes,
        proposta_id=p.id,
        peso_bruto=p.peso_bruto,
        peso_liquido=p.peso_liquido,
        volumes=p.volumes,
        status_separacao="AGUARDANDO_SEPARACAO",
        natureza_operacao=p.natureza_operacao
    )
    db.add(pv)
    db.flush()
    
    for it in p.itens:
        pvi = PedidoVendaItem(
            pedido_id=pv.id,
            produto_id=it.produto_id,
            quantidade=it.quantidade,
            preco_unitario=it.preco_unitario # You could store the real discounted price here or expand PedidoVendaItem
        )
        db.add(pvi)
        
    p.status = "CONCLUIDA"
    db.commit()
    
    return {"message": "Pedido de venda gerado com sucesso", "pedido_id": pv.id}
