from enum import Enum

from sqlalchemy import Column, DateTime, Enum as SAEnum, Integer, String, Text, func, ForeignKey

from database import Base


class SituacaoCadastro(str, Enum):
    ATIVO = "ATIVO"
    INATIVO = "INATIVO"


class TipoPessoaCadastro(str, Enum):
    FISICA = "FISICA"
    JURIDICA = "JURIDICA"


class CondicaoPagamentoCadastro(str, Enum):
    A_VISTA = "A_VISTA"
    A_PRAZO = "A_PRAZO"


class ClienteComercial(Base):
    __tablename__ = "comercial_clientes"

    id = Column(Integer, primary_key=True, index=True)
    situacao = Column(SAEnum(SituacaoCadastro), default=SituacaoCadastro.ATIVO, nullable=False)
    tipo_pessoa = Column(SAEnum(TipoPessoaCadastro), default=TipoPessoaCadastro.JURIDICA, nullable=False)
    tipo_contato = Column(String, default="Cliente", nullable=False)
    nome_razao_social = Column(String, nullable=False, index=True)
    nome_fantasia = Column(String, nullable=True, index=True)
    cpf_cnpj = Column(String, nullable=True, unique=True, index=True)
    rg = Column(String, nullable=True)
    inscricao_estadual = Column(String, nullable=True)
    telefone = Column(String, nullable=True)
    whatsapp = Column(String, nullable=True)
    email = Column(String, nullable=True, index=True)
    cep = Column(String, nullable=True)
    endereco = Column(String, nullable=True)
    numero = Column(String, nullable=True)
    complemento = Column(String, nullable=True)
    bairro = Column(String, nullable=True)
    cidade = Column(String, nullable=True, index=True)
    uf = Column(String(2), nullable=True, index=True)
    codigo_externo = Column(String, nullable=True)
    contribuinte = Column(String, nullable=True)
    inscricao_municipal = Column(String, nullable=True)
    codigo_regime_tributario = Column(String, nullable=True)
    inscricao_suframa = Column(String, nullable=True)
    data_nascimento = Column(DateTime, nullable=True)
    status_crm = Column(String, nullable=True)
    vendedor_id = Column(String, nullable=True)
    limite_credito = Column(Integer, nullable=True)
    representante_id = Column(Integer, nullable=True, index=True)
    nome_vendedor_interno = Column(String, nullable=True, index=True)
    forma_pagamento_id = Column(Integer, nullable=True, index=True)
    condicao_pagamento_id = Column(Integer, nullable=True, index=True)
    cep_cobranca = Column(String, nullable=True)
    endereco_cobranca = Column(String, nullable=True)
    numero_cobranca = Column(String, nullable=True)
    complemento_cobranca = Column(String, nullable=True)
    bairro_cobranca = Column(String, nullable=True)
    uf_cobranca = Column(String(2), nullable=True, index=True)
    municipio_cobranca = Column(String, nullable=True, index=True)
    cnpj_cobranca = Column(String, nullable=True)
    inscricao_estadual_cobranca = Column(String, nullable=True)
    email_cobranca = Column(String, nullable=True, index=True)
    cep_entrega = Column(String, nullable=True)
    endereco_entrega = Column(String, nullable=True)
    numero_entrega = Column(String, nullable=True)
    complemento_entrega = Column(String, nullable=True)
    bairro_entrega = Column(String, nullable=True)
    cidade_entrega = Column(String, nullable=True, index=True)
    uf_entrega = Column(String(2), nullable=True, index=True)
    forma_pagamento_padrao = Column(String, nullable=True)
    condicao_pagamento = Column(SAEnum(CondicaoPagamentoCadastro), nullable=True)
    prazo_pagamento_dias = Column(Integer, nullable=True)
    prazo_entrega_padrao_dias = Column(Integer, nullable=True)
    vendedor_padrao_id = Column(Integer, ForeignKey("comercial_representantes.id"), nullable=True)
    id_lista_preco = Column(Integer, nullable=True)
    observacoes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
