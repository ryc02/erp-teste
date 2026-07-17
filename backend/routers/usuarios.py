from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

import models, schemas
from database import get_db
from services.auth import (
    get_password_hash, 
    get_current_user, 
    check_role
)
from services.auditoria_service import AuditoriaService
from fastapi import Request

router = APIRouter(prefix="/usuarios", tags=["Usuários"])

@router.get("/logs/audit", response_model=List[schemas.AuditoriaLogSchema])
async def list_audit_logs(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(check_role(["ADMIN"]))
):
    return db.query(models.AuditoriaLog).order_by(models.AuditoriaLog.created_at.desc()).limit(200).all()

@router.get("/me", response_model=schemas.UserSchema)
async def read_users_me(current_user: models.User = Depends(get_current_user)):
    return current_user

@router.post("", response_model=schemas.UserSchema)
@router.post("/", response_model=schemas.UserSchema, include_in_schema=False)
async def create_user(
    user: schemas.UserCreate, 
    request: Request,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(check_role(["ADMIN"]))
):
    db_user = db.query(models.User).filter(models.User.username == user.username).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Username já cadastrado")
    
    hashed_password = get_password_hash(user.password)
    db_user = models.User(
        username=user.username,
        email=user.email,
        nome_completo=user.nome_completo,
        hashed_password=hashed_password,
        role_id=user.role_id,
        permissoes=user.permissoes,
        ativo=user.ativo
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    AuditoriaService.registrar(
        db, current_user.username, "CREATE", "USUARIOS", 
        f"Criou novo usuário: {db_user.username} ({db_user.nome_completo})",
        entidade_id=db_user.id,
        request=request
    )
    
    return db_user

@router.get("", response_model=List[schemas.UserSchema])
@router.get("/", response_model=List[schemas.UserSchema], include_in_schema=False)
async def list_users(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(check_role(["ADMIN"]))
):
    return db.query(models.User).all()

@router.get("/roles/all", response_model=List[schemas.RoleSchema])
async def list_roles(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    # Mudado de /roles para /usuarios/roles/all para evitar conflitos se necessário
    return db.query(models.Role).all()

@router.put("/{id}", response_model=schemas.UserSchema)
async def update_user(
    id: int,
    user_update: schemas.UserUpdate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(check_role(["ADMIN"]))
):
    db_user = db.query(models.User).filter(models.User.id == id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    
    update_data = user_update.model_dump(exclude_unset=True)
    
    if "password" in update_data and update_data["password"]:
        update_data["hashed_password"] = get_password_hash(update_data["password"])
        del update_data["password"]
    
    for key, value in update_data.items():
        setattr(db_user, key, value)
        
    db.commit()
    db.refresh(db_user)
    
    AuditoriaService.registrar(
        db, current_user.username, "UPDATE", "USUARIOS", 
        f"Atualizou dados do usuário: {db_user.username}",
        entidade_id=db_user.id,
        request=request
    )
    
    return db_user

@router.delete("/{id}")
async def delete_user(
    id: int,
    request: Request,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(check_role(["ADMIN"]))
):
    user = db.query(models.User).filter(models.User.id == id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    
    if user.username == current_user.username:
        raise HTTPException(status_code=400, detail="Você não pode excluir a si mesmo")
        
    username_del = user.username
    user.ativo = False
    db.commit()
    
    AuditoriaService.registrar(
        db, current_user.username, "DELETE", "USUARIOS", 
        f"Desativou usuário (Exclusão Lógica): {username_del}",
        entidade_id=id,
        request=request
    )
    
    return {"message": "Usuário desativado com sucesso"}


