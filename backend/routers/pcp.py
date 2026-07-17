from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import models, schemas
from typing import List
from services.auth import get_current_user

router = APIRouter(prefix="/pcp", tags=["PCP"])

# --- Ficha Técnica ---
@router.get("/ficha_tecnica/{produto_id}", response_model=List[schemas.FichaTecnicaItemSchema])
def listar_ficha_tecnica(
    produto_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    produto = db.query(models.Produto).filter(models.Produto.id == produto_id).first()
    if not produto:
        raise HTTPException(status_code=404, detail="Produto não encontrado")
    
    return db.query(models.FichaTecnicaItem).filter(models.FichaTecnicaItem.produto_composto_id == produto_id).all()

@router.post("/ficha_tecnica/{produto_id}", response_model=schemas.FichaTecnicaItemSchema)
def adicionar_item_ficha(
    produto_id: int,
    item: schemas.FichaTecnicaItemCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    produto = db.query(models.Produto).filter(models.Produto.id == produto_id).first()
    if not produto:
        raise HTTPException(status_code=404, detail="Produto principal não encontrado")
        
    componente = db.query(models.Produto).filter(models.Produto.id == item.produto_componente_id).first()
    if not componente:
        raise HTTPException(status_code=404, detail="Componente não encontrado")

    # Verifica duplicidade
    existente = db.query(models.FichaTecnicaItem).filter(
        models.FichaTecnicaItem.produto_composto_id == produto_id,
        models.FichaTecnicaItem.produto_componente_id == item.produto_componente_id
    ).first()
    if existente:
        raise HTTPException(status_code=400, detail="Este componente já está na ficha técnica deste produto")

    db_item = models.FichaTecnicaItem(
        produto_composto_id=produto_id,
        produto_componente_id=item.produto_componente_id,
        quantidade_necessaria=item.quantidade_necessaria
    )
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

@router.delete("/ficha_tecnica/{item_id}")
def remover_item_ficha(
    item_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    item = db.query(models.FichaTecnicaItem).filter(models.FichaTecnicaItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item da ficha técnica não encontrado")
    
    db.delete(item)
    db.commit()
    return {"message": "Item removido com sucesso"}

# --- Ordens de Produção ---
@router.get("/ordens", response_model=List[schemas.OrdemProducaoSchema])
def listar_ordens_producao(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    return db.query(models.OrdemProducao).all()

@router.post("/ordens", response_model=schemas.OrdemProducaoSchema)
def criar_ordem_producao(
    op: schemas.OrdemProducaoCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    produto = db.query(models.Produto).filter(models.Produto.id == op.produto_id).first()
    if not produto:
        raise HTTPException(status_code=404, detail="Produto não encontrado")
        
    ficha_tecnica = db.query(models.FichaTecnicaItem).filter(models.FichaTecnicaItem.produto_composto_id == op.produto_id).all()
    if not ficha_tecnica:
        raise HTTPException(status_code=400, detail="Este produto não possui ficha técnica configurada.")

    db_op = models.OrdemProducao(
        produto_id=op.produto_id,
        quantidade_planejada=op.quantidade_planejada,
        status="PLANEJADA"
    )
    db.add(db_op)
    db.commit()
    db.refresh(db_op)
    
    # Cria os itens da OP baseados na ficha técnica e na quantidade planejada
    for f in ficha_tecnica:
        db_item_op = models.OrdemProducaoItem(
            ordem_producao_id=db_op.id,
            produto_componente_id=f.produto_componente_id,
            quantidade_necessaria=f.quantidade_necessaria * op.quantidade_planejada
        )
        db.add(db_item_op)
    
    db.commit()
    db.refresh(db_op)
    return db_op

@router.post("/ordens/{op_id}/iniciar")
def iniciar_ordem_producao(
    op_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    op = db.query(models.OrdemProducao).filter(models.OrdemProducao.id == op_id).first()
    if not op:
        raise HTTPException(status_code=404, detail="Ordem de produção não encontrada")
    if op.status != "PLANEJADA":
        raise HTTPException(status_code=400, detail="Apenas OPs planejadas podem ser iniciadas")

    import datetime
    op.status = "EM_ANDAMENTO"
    op.data_inicio = datetime.datetime.now(datetime.timezone.utc)
    
    # Baixa no estoque dos componentes
    for item in op.itens:
        mov_payload = schemas.MovimentacaoCreate(
            produto_id=item.produto_componente_id,
            tipo=schemas.TipoMovimentacaoSchema.SAIDA_PRODUCAO,
            quantidade=item.quantidade_necessaria,
            usuario=current_user.username,
            origem=f"OP #{op.id}",
            observacao="Baixa automática por início de Ordem de Produção"
        )
        from services.estoque_service import EstoqueService
        EstoqueService.registrar_movimentacao(db, mov_payload)

    db.commit()
    return {"message": "OP Iniciada e estoque dos componentes baixado."}

@router.post("/ordens/{op_id}/concluir")
def concluir_ordem_producao(
    op_id: int,
    quantidade_produzida: float,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    op = db.query(models.OrdemProducao).filter(models.OrdemProducao.id == op_id).first()
    if not op:
        raise HTTPException(status_code=404, detail="Ordem de produção não encontrada")
    if op.status != "EM_ANDAMENTO":
        raise HTTPException(status_code=400, detail="A OP precisa estar em andamento para ser concluída")

    import datetime
    op.status = "CONCLUIDA"
    op.data_fim = datetime.datetime.now(datetime.timezone.utc)
    op.quantidade_produzida = quantidade_produzida
    
    # Entrada no estoque do produto final
    mov_payload = schemas.MovimentacaoCreate(
        produto_id=op.produto_id,
        tipo=schemas.TipoMovimentacaoSchema.ENTRADA_PRODUCAO,
        quantidade=quantidade_produzida,
        usuario=current_user.username,
        origem=f"OP #{op.id}",
        observacao="Entrada automática por conclusão de Ordem de Produção"
    )
    from services.estoque_service import EstoqueService
    EstoqueService.registrar_movimentacao(db, mov_payload)

    db.commit()
    return {"message": "OP Concluída e estoque do produto final adicionado."}
