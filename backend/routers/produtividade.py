from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session, joinedload

import models
import schemas
from database import get_db
from services.auth import check_role, get_current_user
from services.produtividade_db_service import ProdutividadeDBService


ALLOWED_PRODUCTIVITY_ROLES = ["ADMIN", "GERENTE", "OPERADOR"]

router = APIRouter(
    prefix="/produtividade",
    tags=["Produtividade"],
    dependencies=[Depends(check_role(ALLOWED_PRODUCTIVITY_ROLES))],
)


@router.get("/dashboard")
def dashboard_produtividade(
    ano: int = Query(default=date.today().year, ge=2020, le=2100),
    mes: int = Query(default=date.today().month, ge=1, le=12),
    setor_id: int | None = Query(default=None),
    db: Session = Depends(get_db),
):
    return ProdutividadeDBService.build_dashboard(db=db, year=ano, month=mes, setor_id=setor_id)


@router.get("/setores", response_model=list[schemas.SetorProdutividadeSchema])
def listar_setores(
    db: Session = Depends(get_db),
):
    return ProdutividadeDBService.list_sectors(db)


@router.post("/setores", response_model=schemas.SetorProdutividadeSchema)
def salvar_setor(
    payload: schemas.SetorProdutividadeCreate,
    db: Session = Depends(get_db),
):
    try:
        return ProdutividadeDBService.upsert_sector(db, payload)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc


@router.put("/setores/{sector_id}", response_model=schemas.SetorProdutividadeSchema)
def atualizar_setor(
    sector_id: int,
    payload: schemas.SetorProdutividadeUpdate,
    db: Session = Depends(get_db),
):
    try:
        return ProdutividadeDBService.update_sector(db, sector_id, payload)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc


@router.get("/colaboradores", response_model=list[schemas.ColaboradorProdutividadeSchema])
def listar_colaboradores(
    setor_id: int | None = Query(default=None),
    db: Session = Depends(get_db),
):
    return ProdutividadeDBService.list_collaborators(db, setor_id=setor_id)


@router.post("/colaboradores", response_model=schemas.ColaboradorProdutividadeSchema)
def salvar_colaborador(
    payload: schemas.ColaboradorProdutividadeCreate,
    db: Session = Depends(get_db),
):
    try:
        return ProdutividadeDBService.upsert_collaborator(db, payload)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc


@router.put("/colaboradores/{collab_id}", response_model=schemas.ColaboradorProdutividadeSchema)
def atualizar_colaborador(
    collab_id: int,
    payload: schemas.ColaboradorProdutividadeUpdate,
    db: Session = Depends(get_db),
):
    try:
        return ProdutividadeDBService.update_collaborator(db, collab_id, payload)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc


@router.get("/apontamentos", response_model=list[schemas.ApontamentoProdutividadeSchema])
def listar_apontamentos(
    ano: int = Query(default=date.today().year, ge=2020, le=2100),
    mes: int = Query(default=date.today().month, ge=1, le=12),
    setor_id: int | None = Query(default=None),
    db: Session = Depends(get_db),
):
    start = date(ano, mes, 1)
    end = date(ano, mes, 1).replace(day=1)
    from calendar import monthrange

    end = end.replace(day=monthrange(ano, mes)[1])
    query = (
        db.query(models.ApontamentoProdutividade)
        .options(
            joinedload(models.ApontamentoProdutividade.setor),
            joinedload(models.ApontamentoProdutividade.colaborador),
        )
        .filter(models.ApontamentoProdutividade.data_referencia >= start)
        .filter(models.ApontamentoProdutividade.data_referencia <= end)
    )
    if setor_id:
        query = query.filter(models.ApontamentoProdutividade.setor_id == setor_id)

    return (
        query.order_by(
            models.ApontamentoProdutividade.data_referencia.desc(),
            models.ApontamentoProdutividade.updated_at.desc(),
        ).all()
    )


@router.post("/apontamentos", response_model=schemas.ApontamentoProdutividadeSchema)
def salvar_apontamento(
    payload: schemas.ApontamentoProdutividadeCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    try:
        return ProdutividadeDBService.upsert_entry(db, payload, username=current_user.username)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc


@router.put("/apontamentos/{entry_id}", response_model=schemas.ApontamentoProdutividadeSchema)
def atualizar_apontamento(
    entry_id: int,
    payload: schemas.ApontamentoProdutividadeUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    try:
        return ProdutividadeDBService.update_entry(db, entry_id, payload, username=current_user.username)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc


@router.delete("/apontamentos/{entry_id}")
def excluir_apontamento(
    entry_id: int,
    db: Session = Depends(get_db),
):
    try:
        ProdutividadeDBService.delete_entry(db, entry_id)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    return {"message": "Apontamento removido com sucesso."}
