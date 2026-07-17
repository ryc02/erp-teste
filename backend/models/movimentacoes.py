from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Enum, Text, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base
from .base import TipoMovimentacao, StatusReserva

class Lote(Base):
    __tablename__ = "estoque_lotes"
    id = Column(Integer, primary_key=True, index=True)
    produto_id = Column(Integer, ForeignKey("produtos.id"), index=True)
    codigo_lote = Column(String, index=True)
    data_fabricacao = Column(DateTime(timezone=True), nullable=True)
    data_validade = Column(DateTime(timezone=True), nullable=True)
    quantidade_inicial = Column(Float, default=0.0)
    quantidade_atual = Column(Float, default=0.0)
    ativo = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    produto = relationship("Produto")

class MovimentacaoEstoque(Base):
    __tablename__ = "movimentacoes_estoque"
    id = Column(Integer, primary_key=True, index=True)
    produto_id = Column(Integer, ForeignKey("produtos.id"), index=True)
    lote_id = Column(Integer, ForeignKey("estoque_lotes.id"), nullable=True)
    tipo = Column(Enum(TipoMovimentacao))
    quantidade = Column(Float)
    usuario = Column(String)
    origem = Column(String)
    observacao = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)

    produto = relationship("Produto", back_populates="movimentacoes")
    lote = relationship("Lote")

class ReservaEstoque(Base):
    __tablename__ = "reservas_estoque"
    id = Column(Integer, primary_key=True, index=True)
    produto_id = Column(Integer, ForeignKey("produtos.id"), index=True)
    pedido_ref = Column(String, index=True)
    quantidade = Column(Float)
    status = Column(Enum(StatusReserva), default=StatusReserva.ATIVA, index=True)
    usuario = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    produto = relationship("Produto", back_populates="reservas")

class InventarioSessao(Base):
    __tablename__ = "inventario_sessoes"
    id = Column(Integer, primary_key=True, index=True)
    status = Column(String, default="ABERTO")
    usuario_abertura = Column(String)
    data_abertura = Column(DateTime(timezone=True), server_default=func.now())
    data_fechamento = Column(DateTime(timezone=True), nullable=True)

    itens = relationship("InventarioItem", back_populates="sessao")

class InventarioItem(Base):
    __tablename__ = "inventario_itens"
    id = Column(Integer, primary_key=True, index=True)
    sessao_id = Column(Integer, ForeignKey("inventario_sessoes.id"))
    produto_id = Column(Integer, ForeignKey("produtos.id"), index=True)
    quantidade_sistema = Column(Float)
    quantidade_fisica = Column(Float, nullable=True)
    diferenca = Column(Float, nullable=True)
    processado = Column(Boolean, default=False)
    
    sessao = relationship("InventarioSessao", back_populates="itens")
    produto = relationship("Produto")
