from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import models, schemas
from sqlalchemy.sql import func
from services.auth import check_role

ALLOWED_STOCK_ROLES = ["ADMIN", "GERENTE", "OPERADOR"]

router = APIRouter(
    prefix="/inventario",
    tags=["Inventário"],
    dependencies=[Depends(check_role(ALLOWED_STOCK_ROLES))],
)

def _preparar_sessao_detalhada(sessao: models.InventarioSessao) -> dict:
    if not sessao:
        return None
        
    itens_com_detalhes = []
    for item in sessao.itens:
        item_data = {
            "id": item.id,
            "produto_id": item.produto_id,
            "quantidade_sistema": item.quantidade_sistema,
            "quantidade_fisica": item.quantidade_fisica,
            "diferenca": item.diferenca,
            "processado": item.processado,
        }
        if item.produto:
            item_data.update({
                "sku": item.produto.sku,
                "nome": item.produto.nome,
                "corredor": item.produto.corredor,
                "prateleira": item.produto.prateleira,
                "posicao": item.produto.posicao,
            })
        itens_com_detalhes.append(item_data)
        
    return {
        "id": sessao.id,
        "status": sessao.status,
        "usuario_abertura": sessao.usuario_abertura,
        "data_abertura": sessao.data_abertura,
        "data_fechamento": sessao.data_fechamento,
        "itens": itens_com_detalhes
    }

@router.get("/atual", response_model=Optional[schemas.InventarioSessaoSchema])
def obter_inventario_atual(db: Session = Depends(get_db)):
    sessao = db.query(models.InventarioSessao).filter(models.InventarioSessao.status == "ABERTO").first()
    return _preparar_sessao_detalhada(sessao)

@router.post("/iniciar", response_model=schemas.InventarioSessaoSchema)
def iniciar_inventario(sessao: schemas.InventarioSessaoBase, db: Session = Depends(get_db)):
    # Verifica se já tem um aberto
    aberto = db.query(models.InventarioSessao).filter(models.InventarioSessao.status == "ABERTO").first()
    if aberto:
        raise HTTPException(status_code=400, detail="Já existe um inventário em andamento.")
        
    db_sessao = models.InventarioSessao(usuario_abertura=sessao.usuario_abertura)
    db.add(db_sessao)
    db.commit()
    db.refresh(db_sessao)
    
    # Snapshot inicial de todos os produtos ativos
    produtos = db.query(models.Produto).filter(models.Produto.ativo == True).all()
    for p in produtos:
        item = models.InventarioItem(
            sessao_id=db_sessao.id,
            produto_id=p.id,
            quantidade_sistema=p.estoque_atual
        )
        db.add(item)
    db.commit()
    db.refresh(db_sessao)
    
    return _preparar_sessao_detalhada(db_sessao)

@router.post("/contar")
def registrar_contagem(contagem: schemas.ContagemItem, db: Session = Depends(get_db)):
    sessao = db.query(models.InventarioSessao).filter(models.InventarioSessao.status == "ABERTO").first()
    if not sessao:
        raise HTTPException(status_code=400, detail="Nenhum inventário aberto.")
        
    item = db.query(models.InventarioItem)\
        .filter(models.InventarioItem.sessao_id == sessao.id)\
        .filter(models.InventarioItem.produto_id == contagem.produto_id)\
        .first()
        
    if not item:
        raise HTTPException(status_code=404, detail="Produto não encontrado nesta sessão.")
        
    item.quantidade_fisica = contagem.quantidade_fisica
    item.diferenca = contagem.quantidade_fisica - item.quantidade_sistema
    db.commit()
    return {"message": "Contagem registrada"}

@router.post("/finalizar")
def finalizar_inventario(db: Session = Depends(get_db)):
    sessao = db.query(models.InventarioSessao).filter(models.InventarioSessao.status == "ABERTO").first()
    if not sessao:
        raise HTTPException(status_code=400, detail="Nenhum inventário aberto.")
        
    itens = db.query(models.InventarioItem).filter(models.InventarioItem.sessao_id == sessao.id).all()
    
    for item in itens:
        if item.quantidade_fisica is not None and item.diferenca != 0:
            # O estoque é derivado das movimentações; basta registrar o ajuste.
            mov = models.MovimentacaoEstoque(
                produto_id=item.produto_id,
                tipo=models.TipoMovimentacao.AJUSTE,
                quantidade=item.diferenca,
                usuario=sessao.usuario_abertura,
                origem=f"Inventário #{sessao.id}",
                observacao=f"Ajuste automático de inventário. Sistema: {item.quantidade_sistema}, Físico: {item.quantidade_fisica}"
            )
            db.add(mov)
            
        item.processado = True

    sessao.status = "FINALIZADO"
    sessao.data_fechamento = func.now()
    db.commit()
    return {"message": "Inventário finalizado e estoques ajustados."}
