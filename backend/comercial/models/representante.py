from sqlalchemy import Boolean, Column, DateTime, Integer, String, Float, func

from database import Base


class RepresentanteComercial(Base):
    __tablename__ = "comercial_representantes"

    id = Column(Integer, primary_key=True, index=True)
    codigo = Column(String, nullable=True, index=True) # Changed to String to allow custom formatting if needed or just blank
    nome = Column(String, nullable=False, index=True)
    fantasia = Column(String, nullable=True)
    tipo_pessoa = Column(String, nullable=True)
    cpf_cnpj = Column(String, nullable=True)
    contribuinte = Column(String, nullable=True)
    inscricao_estadual = Column(String, nullable=True)
    cep = Column(String, nullable=True)
    cidade = Column(String, nullable=True)
    uf = Column(String, nullable=True)
    endereco = Column(String, nullable=True)
    bairro = Column(String, nullable=True)
    numero = Column(String, nullable=True)
    complemento = Column(String, nullable=True)
    celular = Column(String, nullable=True)
    ativo = Column(Boolean, nullable=False, default=True)
    comissao_padrao = Column(Float, nullable=False, default=0.0)
    email = Column(String, nullable=True)
    telefone = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
