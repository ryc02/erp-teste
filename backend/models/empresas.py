from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from database import Base
import datetime

class Empresa(Base):
    __tablename__ = "empresas"

    id = Column(Integer, primary_key=True, index=True)
    razao_social = Column(String, nullable=False)
    nome_fantasia = Column(String, nullable=True)
    cnpj = Column(String, unique=True, index=True, nullable=False)
    ativa = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), default=datetime.datetime.utcnow)
    
    # Estrutura Matriz/Filial e Faturamento
    tipo_empresa = Column(String, default="MATRIZ") # MATRIZ ou FILIAL
    matriz_id = Column(Integer, ForeignKey("empresas.id"), nullable=True)
    regime_tributario = Column(String, default="SIMPLES_NACIONAL") # SIMPLES_NACIONAL, LUCRO_PRESUMIDO, LUCRO_REAL
    
    filiais = relationship("Empresa", backref="matriz", remote_side=[id])
