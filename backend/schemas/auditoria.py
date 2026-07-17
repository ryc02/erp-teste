from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class AuditoriaLogBase(BaseModel):
    usuario: str
    acao: str
    modulo: str
    detalhes: str
    entidade_id: Optional[str] = None
    ip_address: Optional[str] = None

class AuditoriaLogSchema(AuditoriaLogBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True
