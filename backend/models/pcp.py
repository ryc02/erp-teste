from sqlalchemy import Column, Integer, Float, DateTime, ForeignKey, String, func
from sqlalchemy.orm import relationship
from database import Base

class FichaTecnicaItem(Base):
    __tablename__ = "ficha_tecnica_itens"
    id = Column(Integer, primary_key=True, index=True)
    produto_composto_id = Column(Integer, ForeignKey("produtos.id"))
    produto_componente_id = Column(Integer, ForeignKey("produtos.id"))
    quantidade_necessaria = Column(Float, nullable=False)
    
    produto_composto = relationship("Produto", foreign_keys=[produto_composto_id])
    produto_componente = relationship("Produto", foreign_keys=[produto_componente_id])

class OrdemProducao(Base):
    __tablename__ = "ordens_producao"
    id = Column(Integer, primary_key=True, index=True)
    produto_id = Column(Integer, ForeignKey("produtos.id"))
    quantidade_planejada = Column(Float, nullable=False)
    quantidade_produzida = Column(Float, default=0.0)
    status = Column(String, default="PLANEJADA")
    data_inicio = Column(DateTime(timezone=True), nullable=True)
    data_fim = Column(DateTime(timezone=True), nullable=True)
    
    custo_mao_obra = Column(Float, default=0.0)
    custo_insumos = Column(Float, default=0.0)
    custo_maquina = Column(Float, default=0.0)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    produto = relationship("Produto")
    itens = relationship("OrdemProducaoItem", back_populates="ordem_producao", cascade="all, delete-orphan")

class OrdemProducaoItem(Base):
    __tablename__ = "ordem_producao_itens"
    id = Column(Integer, primary_key=True, index=True)
    ordem_producao_id = Column(Integer, ForeignKey("ordens_producao.id"))
    produto_componente_id = Column(Integer, ForeignKey("produtos.id"))
    quantidade_necessaria = Column(Float, nullable=False)
    custo_unitario = Column(Float, default=0.0)
    
    ordem_producao = relationship("OrdemProducao", back_populates="itens")
    produto_componente = relationship("Produto")
