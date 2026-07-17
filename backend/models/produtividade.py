from sqlalchemy import (
    Boolean,
    Column,
    Date,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
    UniqueConstraint,
    func,
)
from sqlalchemy.orm import relationship

from database import Base


class SetorProdutividade(Base):
    __tablename__ = "setores_produtividade"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String, nullable=False)
    nome_chave = Column(String, unique=True, index=True, nullable=False)
    meta_diaria = Column(Float, nullable=False, default=0.0)
    meta_colaborador_diaria = Column(Float, nullable=False, default=0.0)
    ativo = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    apontamentos = relationship(
        "ApontamentoProdutividade",
        back_populates="setor",
        cascade="all, delete-orphan",
    )
    colaboradores = relationship(
        "ColaboradorProdutividade",
        back_populates="setor",
        cascade="all, delete-orphan",
    )


class ColaboradorProdutividade(Base):
    __tablename__ = "colaboradores_produtividade"
    __table_args__ = (
        UniqueConstraint(
            "setor_id",
            "nome_chave",
            name="uq_colaborador_produtividade_setor_nome",
        ),
    )

    id = Column(Integer, primary_key=True, index=True)
    setor_id = Column(Integer, ForeignKey("setores_produtividade.id"), nullable=False, index=True)
    nome = Column(String, nullable=False)
    nome_chave = Column(String, nullable=False, index=True)
    ativo = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    setor = relationship("SetorProdutividade", back_populates="colaboradores")
    apontamentos = relationship("ApontamentoProdutividade", back_populates="colaborador")


class ApontamentoProdutividade(Base):
    __tablename__ = "apontamentos_produtividade"
    __table_args__ = (
        UniqueConstraint(
            "data_referencia",
            "setor_id",
            "colaborador_chave",
            name="uq_apontamento_produtividade_dia_setor_colaborador",
        ),
    )

    id = Column(Integer, primary_key=True, index=True)
    data_referencia = Column(Date, index=True, nullable=False)
    setor_id = Column(Integer, ForeignKey("setores_produtividade.id"), nullable=False, index=True)
    colaborador_id = Column(Integer, ForeignKey("colaboradores_produtividade.id"), nullable=True, index=True)
    colaborador_nome = Column(String, nullable=False)
    colaborador_chave = Column(String, nullable=False, index=True)
    quantidade = Column(Float, nullable=False, default=0.0)
    ocorrencia = Column(String, nullable=False, default="PRODUCAO")
    observacao = Column(Text, nullable=True)
    criado_por = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    setor = relationship("SetorProdutividade", back_populates="apontamentos")
    colaborador = relationship("ColaboradorProdutividade", back_populates="apontamentos")
