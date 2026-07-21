from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, func, Boolean
from sqlalchemy.orm import relationship
from database import Base

class CategoriaFinanceira(Base):
    __tablename__ = "categorias_financeiras"
    
    id = Column(Integer, primary_key=True, index=True)
    descricao = Column(String, nullable=False)
    grupo = Column(String) # Receitas de Vendas, Despesas Operacionais, Tributos, etc.
    considera_dre = Column(String) # Outras receitas ou despesas, Deduções ou despesas operacionais, Tributos, Taxas e tarifas
    tipo = Column(String) # RECEITA, DESPESA, AMBOS
    padrao_venda = Column(Boolean, default=False)
    
class ContaBancaria(Base):
    __tablename__ = "contas_bancarias"
    
    id = Column(Integer, primary_key=True, index=True)
    descricao = Column(String, nullable=False)
    banco = Column(String)
    agencia = Column(String)
    conta = Column(String)
    saldo_inicial = Column(Float, default=0.0)
    empresa_id = Column(Integer, ForeignKey("empresas.id"), nullable=True)
    # the real balance will be computed via aggregations

class FechamentoFinanceiro(Base):
    __tablename__ = "fechamentos_financeiros"
    
    id = Column(Integer, primary_key=True, index=True)
    data_fechamento = Column(DateTime(timezone=True), nullable=False)
    data_registro = Column(DateTime(timezone=True), server_default=func.now())
    usuario_id = Column(Integer, ForeignKey("usuarios.id"), nullable=True)
    empresa_id = Column(Integer, ForeignKey("empresas.id"), nullable=True)
    
    usuario = relationship("User")

class TagFinanceira(Base):
    __tablename__ = "tags_financeiras"
    
    id = Column(Integer, primary_key=True, index=True)
    descricao = Column(String, nullable=False, unique=True)
    cor = Column(String, default="#CCCCCC")

class ContaFinanceira(Base):
    __tablename__ = "contas_financeiras"
    
    id = Column(Integer, primary_key=True, index=True)
    empresa_id = Column(Integer, ForeignKey("empresas.id"), nullable=True)
    tipo = Column(String, index=True) # RECEBER, PAGAR
    status = Column(String, default="PENDENTE", index=True) # PENDENTE, PAGO, CANCELADO, ATRASADO
    descricao = Column(String, nullable=False)
    valor = Column(Float, nullable=False)
    
    data_emissao = Column(DateTime(timezone=True), server_default=func.now())
    data_vencimento = Column(DateTime(timezone=True), nullable=False)
    data_pagamento = Column(DateTime(timezone=True), nullable=True)
    
    # Vinculos Novos
    categoria_id = Column(Integer, ForeignKey("categorias_financeiras.id"), nullable=True)
    conta_bancaria_id = Column(Integer, ForeignKey("contas_bancarias.id"), nullable=True)
    
    # Recorrencia e Parcelamento
    recorrencia_id = Column(String, nullable=True, index=True) # UUID to group installments
    parcela_atual = Column(Integer, default=1)
    total_parcelas = Column(Integer, default=1)
    
    # Vinculos Antigos
    pedido_id = Column(Integer, ForeignKey("pedidos_venda.id"), nullable=True)
    cliente_id = Column(Integer, ForeignKey("comercial_clientes.id"), nullable=True)
    
    observacoes = Column(Text, nullable=True)
    tags_csv = Column(String, nullable=True) # Ex: "Urgente,Marketing" (Simplified tag system for quick search)

    pedido = relationship("PedidoVenda")
    cliente = relationship("ClienteComercial")
    categoria = relationship("CategoriaFinanceira")
    conta_bancaria = relationship("ContaBancaria")
