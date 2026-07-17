from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from database import Base
import datetime
import enum

class StatusOrdemCompra(str, enum.Enum):
    RASCUNHO = "RASCUNHO"
    AGUARDANDO_RECEBIMENTO = "AGUARDANDO_RECEBIMENTO"
    RECEBIDO = "RECEBIDO"
    CANCELADO = "CANCELADO"

class OrdemCompra(Base):
    __tablename__ = "ordens_compra"

    id = Column(Integer, primary_key=True, index=True)
    fornecedor_id = Column(Integer, ForeignKey("comercial_clientes.id"), nullable=True) # Assuming Fornecedores share Clientes table for now, or just text
    fornecedor_nome = Column(String, nullable=False)
    data_emissao = Column(DateTime, default=datetime.datetime.utcnow)
    data_recebimento = Column(DateTime, nullable=True)
    status = Column(String, default=StatusOrdemCompra.RASCUNHO.value)
    valor_frete = Column(Float, default=0.0)
    desconto_valor = Column(Float, default=0.0)
    valor_total = Column(Float, default=0.0)
    observacoes = Column(String, nullable=True)

    itens = relationship("OrdemCompraItem", back_populates="ordem", cascade="all, delete-orphan")


class OrdemCompraItem(Base):
    __tablename__ = "ordens_compra_itens"

    id = Column(Integer, primary_key=True, index=True)
    ordem_id = Column(Integer, ForeignKey("ordens_compra.id"))
    produto_id = Column(Integer, ForeignKey("produtos.id"))
    quantidade = Column(Float, nullable=False)
    preco_unitario = Column(Float, nullable=False)

    ordem = relationship("OrdemCompra", back_populates="itens")
    produto = relationship("Produto")
