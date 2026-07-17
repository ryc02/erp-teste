from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import models, schemas

router = APIRouter(prefix="/modulos", tags=["Módulos"])

@router.get("/", response_model=list[schemas.ModuloSchema])
def listar_modulos(db: Session = Depends(get_db)):
    return db.query(models.Modulo).all()

@router.patch("/{nome}/status")
def alterar_status_modulo(nome: str, ativo: bool, db: Session = Depends(get_db)):
    modulo = db.query(models.Modulo).filter(models.Modulo.nome == nome).first()
    if not modulo:
        raise HTTPException(status_code=404, detail="Módulo não encontrado")
    modulo.ativo = ativo
    db.commit()
    return {"message": f"Módulo {nome} {'ativado' if ativo else 'desativado'}"}
