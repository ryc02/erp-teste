from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from database import Base

class Maquina(Base):
    __tablename__ = "maquinas"
    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String, nullable=False)
    tipo = Column(String)
    capacidade = Column(String)
    codigo = Column(String, unique=True)
    status = Column(String, default="OPERANTE", index=True)
    horas_uso_acumulado = Column(Float, default=0.0)
    horas_manutencao_preventiva = Column(Float, default=500.0)
    ultima_manutencao_horas = Column(Float, default=0.0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    componentes = relationship("MaquinaComponente", back_populates="maquina", cascade="all, delete-orphan")
    ordens_servico = relationship("OrdemServico", back_populates="maquina", cascade="all, delete-orphan")

class MaquinaComponente(Base):
    __tablename__ = "maquina_componentes"
    id = Column(Integer, primary_key=True, index=True)
    maquina_id = Column(Integer, ForeignKey("maquinas.id"))
    produto_id = Column(Integer, ForeignKey("produtos.id"))
    data_instalacao = Column(DateTime, server_default=func.now())
    vida_util_dias = Column(Integer)
    
    maquina = relationship("Maquina", back_populates="componentes")
    produto = relationship("Produto", back_populates="componentes_maquina")

class OrdemServico(Base):
    __tablename__ = "ordens_servico"
    id = Column(Integer, primary_key=True, index=True)
    maquina_id = Column(Integer, ForeignKey("maquinas.id"))
    tipo = Column(String)
    status = Column(String, default="ABERTA", index=True)
    problema_desc = Column(String)
    custo_mao_obra = Column(Float, default=0.0)
    custo_total = Column(Float, default=0.0)
    data_abertura = Column(DateTime, server_default=func.now())
    data_fechamento = Column(DateTime, nullable=True)

    maquina = relationship("Maquina", back_populates="ordens_servico")
    itens = relationship("OSItem", back_populates="os", cascade="all, delete-orphan")

class OSItem(Base):
    __tablename__ = "os_itens"
    id = Column(Integer, primary_key=True, index=True)
    os_id = Column(Integer, ForeignKey("ordens_servico.id"))
    produto_id = Column(Integer, ForeignKey("produtos.id"))
    quantidade = Column(Float, nullable=False)
    custo_unitario = Column(Float)

    os = relationship("OrdemServico", back_populates="itens")
    produto = relationship("Produto")
