from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models.configuracoes_expedicao import ConfiguracoesExpedicao
from schemas.configuracoes_expedicao import ConfiguracoesExpedicaoResponse, ConfiguracoesExpedicaoUpdate
from services.auth import get_current_user

router = APIRouter(prefix="/configuracoes-expedicao", tags=["Configurações Expedição"])

def get_or_create_config(db: Session):
    config = db.query(ConfiguracoesExpedicao).first()
    if not config:
        config = ConfiguracoesExpedicao()
        db.add(config)
        db.commit()
        db.refresh(config)
    return config

@router.get("", response_model=ConfiguracoesExpedicaoResponse)
def get_config(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    return get_or_create_config(db)

@router.put("", response_model=ConfiguracoesExpedicaoResponse)
def update_config(
    data: ConfiguracoesExpedicaoUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    config = get_or_create_config(db)
    for key, value in data.dict().items():
        setattr(config, key, value)
    
    db.commit()
    db.refresh(config)
    return config
