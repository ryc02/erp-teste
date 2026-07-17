from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, func, Boolean
from sqlalchemy.orm import relationship
from database import Base

class PedidoVenda(Base):
    __tablename__ = "pedidos_venda"
    id = Column(Integer, primary_key=True, index=True)
    tipo = Column(String, default="PEDIDO") # PEDIDO, COTACAO
    cliente_id = Column(Integer, ForeignKey("comercial_clientes.id"), nullable=True)
    cliente_nome = Column(String) 
    representante_id = Column(Integer, ForeignKey("comercial_representantes.id"), nullable=True)
    vendedor_interno_id = Column(Integer, ForeignKey("usuarios.id"), nullable=True)
    condicao_pagamento_id = Column(Integer, ForeignKey("comercial_condicoes_pagamento.id"), nullable=True)
    data_pedido = Column(DateTime(timezone=True), server_default=func.now())
    natureza_operacao = Column(String, nullable=True)
    vendedor_id = Column(Integer, ForeignKey("comercial_representantes.id"), nullable=True)
    status = Column(String, default="EM_ABERTO") # EM_ABERTO, APROVADO, PREPARANDO_ENVIO, FATURADO, PRONTO_ENVIO, ENVIADO, ENTREGUE, CANCELADO
    valor_frete = Column(Float, default=0.0)
    desconto_valor = Column(Float, default=0.0)
    valor_total = Column(Float, default=0.0) # Valor líquido (itens + frete - desconto)
    observacoes = Column(Text, nullable=True)
    gerar_nota = Column(Boolean, default=True)
    codigo_rastreio = Column(String, nullable=True)
    url_rastreio = Column(String, nullable=True)
    codigo_rastreamento = Column(String, nullable=True)
    url_rastreamento = Column(String, nullable=True)
    data_prevista = Column(DateTime, nullable=True)
    transportadora = Column(String, nullable=True)
    proposta_id = Column(Integer, ForeignKey("propostas_comerciais.id"), nullable=True)
    peso_bruto = Column(Float, default=0.0)
    peso_liquido = Column(Float, default=0.0)
    volumes = Column(Float, default=1.0)
    status_separacao = Column(String, default="PENDENTE") # PENDENTE, AGUARDANDO_SEPARACAO, EM_SEPARACAO, SEPARADO, CONFERIDO
    natureza_operacao = Column(String, nullable=True)

    cliente = relationship("ClienteComercial")
    representante = relationship("RepresentanteComercial", foreign_keys=[representante_id])
    vendedor = relationship("RepresentanteComercial", foreign_keys=[vendedor_id])
    vendedor_interno = relationship("User")
    condicao_pagamento = relationship("CondicaoPagamentoComercial")
    itens = relationship("PedidoVendaItem", back_populates="pedido")

class PedidoVendaItem(Base):
    __tablename__ = "pedido_venda_itens"
    id = Column(Integer, primary_key=True, index=True)
    pedido_id = Column(Integer, ForeignKey("pedidos_venda.id"))
    produto_id = Column(Integer, ForeignKey("produtos.id"))
    quantidade = Column(Float, nullable=False)
    preco_unitario = Column(Float, nullable=False)

    pedido = relationship("PedidoVenda", back_populates="itens")
    produto = relationship("Produto")
