from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from services.auth import get_current_user
import models
import schemas

router = APIRouter(prefix="/vendas/configuracoes", tags=["Configurações de Vendas"])

def get_or_create_config(db: Session):
    config = db.query(models.ConfiguracoesVenda).first()
    if not config:
        config = models.ConfiguracoesVenda()
        db.add(config)
        db.commit()
        db.refresh(config)
    return config

@router.get("", response_model=schemas.ConfiguracoesVendaSchema)
def obter_configuracoes_venda(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    return get_or_create_config(db)

@router.put("", response_model=schemas.ConfiguracoesVendaSchema)
def atualizar_configuracoes_venda(
    payload: schemas.ConfiguracoesVendaCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    config = db.query(models.ConfiguracoesVenda).first()
    if not config:
        config = models.ConfiguracoesVenda()
        db.add(config)
        
    config.desconto_tipo = payload.desconto_tipo
    config.considerar_taxa_cartao = payload.considerar_taxa_cartao
    config.dias_vencimento_padrao = payload.dias_vencimento_padrao
    config.imprimir_vendedor = payload.imprimir_vendedor
    config.imprimir_observacoes = payload.imprimir_observacoes
    
    db.commit()
    db.refresh(config)
    return config
