from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Boolean, Table
from sqlalchemy.orm import relationship
from database import Base
import datetime

# Tabela de associação N:N entre NotaFiscal e Marcador
nota_fiscal_marcador = Table(
    'nota_fiscal_marcador',
    Base.metadata,
    Column('nota_id', Integer, ForeignKey('notas_fiscais.id')),
    Column('marcador_id', Integer, ForeignKey('marcadores.id'))
)

class Marcador(Base):
    __tablename__ = "marcadores"
    id = Column(Integer, primary_key=True, index=True)
    descricao = Column(String, index=True)
    cor = Column(String, default="#808080")

class SefazAlerta(Base):
    __tablename__ = "sefaz_alertas"
    id = Column(Integer, primary_key=True, index=True)
    tipo = Column(String, default="INFO") # INFO, WARNING, CRITICAL
    mensagem = Column(String)
    data_leitura = Column(DateTime, default=datetime.datetime.utcnow)
    fonte = Column(String)
    lido = Column(Boolean, default=False)

class NotaFiscal(Base):
    __tablename__ = "notas_fiscais"

    id = Column(Integer, primary_key=True, index=True)
    pedido_id = Column(Integer, ForeignKey("pedidos_venda.id"), nullable=True)
    
    tipo = Column(String, default="E") # E (Entrada), S (Saída)
    natureza_operacao = Column(String, nullable=True)
    regime_tributario = Column(String, nullable=True)
    finalidade = Column(String, default="1")
    serie = Column(String, nullable=True)
    numero = Column(String, nullable=True, index=True)
    numero_ecommerce = Column(String, nullable=True)
    
    data_emissao = Column(DateTime, default=datetime.datetime.utcnow)
    data_saida = Column(DateTime, nullable=True)
    
    cliente_id = Column(Integer, ForeignKey("comercial_clientes.id"), nullable=True)
    cliente_nome = Column(String, nullable=True)
    cliente_cpf_cnpj = Column(String, nullable=True)
    
    # Valores
    base_icms = Column(Float, default=0.0)
    valor_icms = Column(Float, default=0.0)
    base_icms_st = Column(Float, default=0.0)
    valor_icms_st = Column(Float, default=0.0)
    # Reforma Tributária 2026 (IBS / CBS / IS)
    valor_ibs = Column(Float, default=0.0)
    valor_cbs = Column(Float, default=0.0)
    valor_is = Column(Float, default=0.0)
    valor_servicos = Column(Float, default=0.0)
    valor_produtos = Column(Float, default=0.0)
    valor_frete = Column(Float, default=0.0)
    valor_seguro = Column(Float, default=0.0)
    valor_outras = Column(Float, default=0.0)
    valor_ipi = Column(Float, default=0.0)
    valor_issqn = Column(Float, default=0.0)
    valor_desconto = Column(Float, default=0.0)
    valor_nota = Column(Float, default=0.0)
    valor_faturado = Column(Float, default=0.0)
    
    # Transporte
    frete_por_conta = Column(String, nullable=True) # D, R, T, S, etc
    transportador_nome = Column(String, nullable=True)
    transportador_cpf_cnpj = Column(String, nullable=True)
    transportador_ie = Column(String, nullable=True)
    transportador_endereco = Column(String, nullable=True)
    transportador_cidade = Column(String, nullable=True)
    transportador_uf = Column(String, nullable=True)
    placa = Column(String, nullable=True)
    uf_placa = Column(String, nullable=True)
    quantidade_volumes = Column(String, nullable=True)
    especie_volumes = Column(String, nullable=True)
    peso_bruto = Column(Float, default=0.0)
    peso_liquido = Column(Float, default=0.0)
    
    # Vendas
    vendedor_id = Column(Integer, ForeignKey("comercial_representantes.id"), nullable=True)
    nome_vendedor = Column(String, nullable=True)
    
    # Pagamentos
    condicao_pagamento = Column(String, nullable=True)
    forma_pagamento = Column(String, nullable=True)
    meio_pagamento = Column(String, nullable=True)
    
    # Status e Contingência SEFAZ
    situacao = Column(String, default="0")
    descricao_situacao = Column(String, default="Pendente")
    tp_emis = Column(String, default="1") # 1=Normal, 9=Contingência Offline NFC-e
    codigo_rejeicao = Column(String, nullable=True)
    motivo_rejeicao = Column(String, nullable=True)
    
    id_forma_frete = Column(String, nullable=True)
    id_forma_envio = Column(String, nullable=True)
    codigo_rastreamento = Column(String, nullable=True)
    url_rastreamento = Column(String, nullable=True)
    
    obs = Column(String, nullable=True)
    xml_conteudo = Column(String, nullable=True)
    chave_acesso = Column(String, nullable=True, index=True)
    
    id_tiny = Column(String, nullable=True) # Para vincular a nota sincronizada da API
    
    email_enviado = Column(Boolean, default=False)
    data_envio_email = Column(DateTime, nullable=True)
    
    created_at = Column(DateTime(timezone=True), default=datetime.datetime.utcnow)
    
    pedido = relationship("PedidoVenda", backref="notas_fiscais")
    itens = relationship("NotaFiscalItem", back_populates="nota", cascade="all, delete-orphan")
    parcelas = relationship("NotaFiscalParcela", back_populates="nota", cascade="all, delete-orphan")
    marcadores = relationship("Marcador", secondary=nota_fiscal_marcador, backref="notas")

class NotaFiscalItem(Base):
    __tablename__ = "notas_fiscais_itens"

    id = Column(Integer, primary_key=True, index=True)
    nota_id = Column(Integer, ForeignKey("notas_fiscais.id"))
    produto_id = Column(Integer, ForeignKey("produtos.id"), nullable=True)
    
    codigo = Column(String, nullable=True)
    descricao = Column(String, nullable=True)
    unidade = Column(String, default="UN")
    ncm = Column(String, nullable=True)
    cfop = Column(String, nullable=True)
    natureza = Column(String, nullable=True)
    
    quantidade = Column(Float, default=1.0)
    valor_unitario = Column(Float, default=0.0)
    valor_total = Column(Float, default=0.0)
    
    # Reforma Tributária 2026
    valor_ibs = Column(Float, default=0.0)
    valor_cbs = Column(Float, default=0.0)
    valor_is = Column(Float, default=0.0)

    nota = relationship("NotaFiscal", back_populates="itens")

class NotaFiscalParcela(Base):
    __tablename__ = "notas_fiscais_parcelas"

    id = Column(Integer, primary_key=True, index=True)
    nota_id = Column(Integer, ForeignKey("notas_fiscais.id"))
    
    dias = Column(Integer, nullable=True)
    data_vencimento = Column(String, nullable=True)
    valor = Column(Float, default=0.0)
    obs = Column(String, nullable=True)
    forma_pagamento = Column(String, nullable=True)
    meio_pagamento = Column(String, nullable=True)

    nota = relationship("NotaFiscal", back_populates="parcelas")
