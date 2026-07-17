from enum import Enum

from sqlalchemy import Boolean, Column, DateTime, Enum as SAEnum, Float, Integer, String, Text, func

from database import Base


class BaseCalculoCondicao(str, Enum):
    DATA_DO_DIA = "DATA_DO_DIA"
    DATA_EMISSAO = "DATA_EMISSAO"
    DATA_FATURAMENTO = "DATA_FATURAMENTO"


class FormaPagamentoComercial(Base):
    __tablename__ = "comercial_formas_pagamento"

    id = Column(Integer, primary_key=True, index=True)
    codigo = Column(Integer, nullable=False, unique=True, index=True)
    descricao = Column(String, nullable=False, index=True)
    ativo = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class CondicaoPagamentoComercial(Base):
    __tablename__ = "comercial_condicoes_pagamento"

    id = Column(Integer, primary_key=True, index=True)
    codigo = Column(Integer, nullable=False, unique=True, index=True)
    descricao = Column(String, nullable=False, index=True)
    indice_financeiro = Column(Float, nullable=False, default=1.0)
    base_calculo = Column(SAEnum(BaseCalculoCondicao), nullable=False, default=BaseCalculoCondicao.DATA_DO_DIA)
    numero_parcelas = Column(Integer, nullable=False, default=1)
    parcelas_json = Column(Text, nullable=True)
    ativo = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
