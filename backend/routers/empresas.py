from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel
from database import get_db
from models.empresas import Empresa

router = APIRouter()

class EmpresaBase(BaseModel):
    razao_social: str
    nome_fantasia: str | None = None
    cnpj: str
    ativa: bool = True
    tipo_empresa: str = "MATRIZ"
    matriz_id: int | None = None
    regime_tributario: str = "SIMPLES_NACIONAL"

class EmpresaCreate(EmpresaBase):
    pass

class EmpresaResponse(EmpresaBase):
    id: int

    class Config:
        from_attributes = True

@router.get("/", response_model=List[EmpresaResponse])
def listar_empresas(db: Session = Depends(get_db)):
    return db.query(Empresa).filter(Empresa.ativa == True).all()

@router.post("/", response_model=EmpresaResponse)
def criar_empresa(empresa: EmpresaCreate, db: Session = Depends(get_db)):
    db_empresa = db.query(Empresa).filter(Empresa.cnpj == empresa.cnpj).first()
    if db_empresa:
        raise HTTPException(status_code=400, detail="CNPJ já cadastrado")
    nova = Empresa(**empresa.model_dump())
    db.add(nova)
    db.commit()
    db.refresh(nova)
    return nova

@router.put("/{empresa_id}", response_model=EmpresaResponse)
def atualizar_empresa(empresa_id: int, empresa: EmpresaCreate, db: Session = Depends(get_db)):
    db_empresa = db.query(Empresa).filter(Empresa.id == empresa_id).first()
    if not db_empresa:
        raise HTTPException(status_code=404, detail="Empresa não encontrada")
    
    for key, value in empresa.model_dump().items():
        setattr(db_empresa, key, value)
    
    db.commit()
    db.refresh(db_empresa)
    return db_empresa

@router.delete("/{empresa_id}")
def excluir_empresa(empresa_id: int, db: Session = Depends(get_db)):
    db_empresa = db.query(Empresa).filter(Empresa.id == empresa_id).first()
    if not db_empresa:
        raise HTTPException(status_code=404, detail="Empresa não encontrada")
    # Soft delete
    db_empresa.ativa = False
    db.commit()
    return {"detail": "Empresa inativada com sucesso"}
