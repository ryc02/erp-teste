from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, func
from sqlalchemy.orm import relationship
from database import Base

class PropostaComercial(Base):
    __tablename__ = "propostas_comerciais"
    id = Column(Integer, primary_key=True, index=True)
    numero = Column(Integer, index=True) # Could be a generated sequence or manual
    cliente_id = Column(Integer, ForeignKey("comercial_clientes.id"), nullable=True)
    representante_id = Column(Integer, ForeignKey("comercial_representantes.id"), nullable=True)
    vendedor_interno_id = Column(Integer, ForeignKey("usuarios.id"), nullable=True)
    
    natureza_operacao = Column(String, default="VENDA SIMPLES")
    lista_preco = Column(String, default="Padrão")
    data_proposta = Column(DateTime(timezone=True), server_default=func.now())
    prox_contato = Column(DateTime(timezone=True), nullable=True)
    validade_dias = Column(Integer, default=7)
    status = Column(String, default="RASCUNHO") # RASCUNHO, PENDENTE, AGUARDANDO, APROVADA, NAO_APROVADA, CONCLUIDA, MODELO
    
    valor_frete = Column(Float, default=0.0)
    desconto_valor = Column(Float, default=0.0)
    valor_total = Column(Float, default=0.0)
    
    peso_bruto = Column(Float, default=0.0)
    peso_liquido = Column(Float, default=0.0)
    volumes = Column(Float, default=1.0)
    
    tags_csv = Column(String, nullable=True)
    observacoes = Column(Text, nullable=True)
    
    cliente = relationship("ClienteComercial")
    representante = relationship("RepresentanteComercial")
    vendedor_interno = relationship("User")
    itens = relationship("PropostaComercialItem", back_populates="proposta")


class PropostaComercialItem(Base):
    __tablename__ = "proposta_comercial_itens"
    id = Column(Integer, primary_key=True, index=True)
    proposta_id = Column(Integer, ForeignKey("propostas_comerciais.id"))
    produto_id = Column(Integer, ForeignKey("produtos.id"))
    quantidade = Column(Float, nullable=False, default=1.0)
    preco_unitario = Column(Float, nullable=False, default=0.0)
    desconto_percentual = Column(Float, default=0.0)
    preco_total = Column(Float, nullable=False, default=0.0)

    proposta = relationship("PropostaComercial", back_populates="itens")
    produto = relationship("Produto")
