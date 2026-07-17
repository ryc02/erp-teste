from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from .base import Base

class AuditoriaLog(Base):
    __tablename__ = "auditoria_logs"

    id = Column(Integer, primary_key=True, index=True)
    usuario = Column(String(50), index=True) # Username ou 'Sistema'
    acao = Column(String(100), index=True)    # Ex: 'CREATE', 'UPDATE', 'DELETE', 'LOGIN'
    modulo = Column(String(50), index=True)  # Ex: 'ESTOQUE', 'USUARIOS', 'PCP'
    detalhes = Column(Text)                  # Descrição amigável da ação
    entidade_id = Column(String(50), nullable=True) # ID do objeto afetado (se aplicável)
    ip_address = Column(String(45), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f"<AuditoriaLog(usuario='{self.usuario}', acao='{self.acao}', modulo='{self.modulo}')>"
