from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models.vendas import PedidoVenda
from models.produtos import Produto
from services.auth import get_current_user

router = APIRouter(prefix="/separacao", tags=["Separação de Produtos"])

@router.get("/pedidos")
def get_pedidos_separacao(
    status_separacao: str = None, 
    db: Session = Depends(get_db), 
    current_user = Depends(get_current_user)
):
    query = db.query(PedidoVenda).filter(PedidoVenda.tipo == "PEDIDO")
    if status_separacao:
        query = query.filter(PedidoVenda.status_separacao == status_separacao)
    else:
        query = query.filter(PedidoVenda.status_separacao.in_(["AGUARDANDO_SEPARACAO", "EM_SEPARACAO", "SEPARADO"]))
        
    pedidos = query.all()
    res = []
    for p in pedidos:
        res.append({
            "id": p.id,
            "data_pedido": p.data_pedido,
            "cliente_nome": p.cliente_nome or (p.cliente.razao_social if p.cliente else "N/A"),
            "status": p.status,
            "status_separacao": p.status_separacao,
            "volumes": p.volumes
        })
    return res

@router.get("/pedidos/{pedido_id}")
def get_pedido_separacao(
    pedido_id: int, 
    db: Session = Depends(get_db), 
    current_user = Depends(get_current_user)
):
    p = db.query(PedidoVenda).filter(PedidoVenda.id == pedido_id).first()
    if not p:
        raise HTTPException(404, "Pedido não encontrado")
        
    itens_res = []
    for i in p.itens:
        prod = i.produto
        itens_res.append({
            "id": i.id,
            "produto_id": i.produto_id,
            "sku": prod.sku if prod else "",
            "nome": prod.descricao if prod else "Desconhecido",
            "gtin": prod.gtin if prod else "",
            "quantidade": i.quantidade,
            "quantidade_separada": 0 # This would ideally be in DB if saving partial state
        })
        
    return {
        "id": p.id,
        "status_separacao": p.status_separacao,
        "cliente_nome": p.cliente_nome or (p.cliente.razao_social if p.cliente else "N/A"),
        "itens": itens_res
    }

@router.put("/pedidos/{pedido_id}/iniciar")
def iniciar_separacao(
    pedido_id: int, 
    db: Session = Depends(get_db), 
    current_user = Depends(get_current_user)
):
    p = db.query(PedidoVenda).filter(PedidoVenda.id == pedido_id).first()
    if p:
        p.status_separacao = "EM_SEPARACAO"
        db.commit()
    return {"message": "Separação iniciada", "status_separacao": "EM_SEPARACAO"}

@router.put("/pedidos/{pedido_id}/concluir")
def concluir_separacao(
    pedido_id: int, 
    db: Session = Depends(get_db), 
    current_user = Depends(get_current_user)
):
    p = db.query(PedidoVenda).filter(PedidoVenda.id == pedido_id).first()
    if p:
        p.status_separacao = "CONFERIDO"
        p.status = "PREPARANDO_ENVIO" # Move to next stage
        db.commit()
    return {"message": "Separação concluída", "status_separacao": "CONFERIDO"}
