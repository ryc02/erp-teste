from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field

from comercial.models import CondicaoPagamentoCadastro, SituacaoCadastro, TipoPessoaCadastro


class ClienteBase(BaseModel):
    situacao: SituacaoCadastro = SituacaoCadastro.ATIVO
    tipo_pessoa: TipoPessoaCadastro = TipoPessoaCadastro.JURIDICA
    tipo_contato: str = Field(default="Cliente", max_length=50)
    nome_razao_social: str = Field(min_length=3, max_length=255)
    nome_fantasia: Optional[str] = Field(default=None, max_length=255)
    cpf_cnpj: Optional[str] = Field(default=None, max_length=20)
    rg: Optional[str] = Field(default=None, max_length=30)
    inscricao_estadual: Optional[str] = Field(default=None, max_length=50)
    telefone: Optional[str] = Field(default=None, max_length=30)
    whatsapp: Optional[str] = Field(default=None, max_length=30)
    email: Optional[str] = Field(default=None, max_length=255)
    cep: Optional[str] = Field(default=None, max_length=20)
    endereco: Optional[str] = Field(default=None, max_length=255)
    numero: Optional[str] = Field(default=None, max_length=20)
    complemento: Optional[str] = Field(default=None, max_length=100)
    bairro: Optional[str] = Field(default=None, max_length=100)
    cidade: Optional[str] = Field(default=None, max_length=100)
    uf: Optional[str] = Field(default=None, min_length=2, max_length=2)
    codigo_externo: Optional[str] = Field(default=None, max_length=50)
    contribuinte: Optional[str] = Field(default=None, max_length=100)
    inscricao_municipal: Optional[str] = Field(default=None, max_length=50)
    codigo_regime_tributario: Optional[str] = Field(default=None, max_length=100)
    inscricao_suframa: Optional[str] = Field(default=None, max_length=50)
    data_nascimento: Optional[datetime] = None
    status_crm: Optional[str] = Field(default=None, max_length=50)
    vendedor_id: Optional[str] = Field(default=None, max_length=50)
    limite_credito: Optional[int] = None
    representante_id: Optional[int] = Field(default=None, ge=1)
    nome_vendedor_interno: Optional[str] = Field(default=None, max_length=255)
    forma_pagamento_id: Optional[int] = Field(default=None, ge=1)
    condicao_pagamento_id: Optional[int] = Field(default=None, ge=1)
    cep_cobranca: Optional[str] = Field(default=None, max_length=20)
    endereco_cobranca: Optional[str] = Field(default=None, max_length=255)
    numero_cobranca: Optional[str] = Field(default=None, max_length=20)
    complemento_cobranca: Optional[str] = Field(default=None, max_length=100)
    bairro_cobranca: Optional[str] = Field(default=None, max_length=100)
    uf_cobranca: Optional[str] = Field(default=None, min_length=2, max_length=2)
    municipio_cobranca: Optional[str] = Field(default=None, max_length=100)
    cnpj_cobranca: Optional[str] = Field(default=None, max_length=20)
    inscricao_estadual_cobranca: Optional[str] = Field(default=None, max_length=50)
    email_cobranca: Optional[str] = Field(default=None, max_length=255)
    cep_entrega: Optional[str] = Field(default=None, max_length=20)
    endereco_entrega: Optional[str] = Field(default=None, max_length=255)
    numero_entrega: Optional[str] = Field(default=None, max_length=20)
    complemento_entrega: Optional[str] = Field(default=None, max_length=100)
    bairro_entrega: Optional[str] = Field(default=None, max_length=100)
    cidade_entrega: Optional[str] = Field(default=None, max_length=100)
    uf_entrega: Optional[str] = Field(default=None, min_length=2, max_length=2)
    forma_pagamento_padrao: Optional[str] = Field(default=None, max_length=50)
    condicao_pagamento: Optional[CondicaoPagamentoCadastro] = None
    prazo_pagamento_dias: Optional[int] = None
    prazo_entrega_padrao_dias: Optional[int] = None
    observacoes: Optional[str] = None


class ClienteCreate(ClienteBase):
    pass


class ClienteUpdate(BaseModel):
    situacao: Optional[SituacaoCadastro] = None
    tipo_pessoa: Optional[TipoPessoaCadastro] = None
    tipo_contato: Optional[str] = Field(default=None, max_length=50)
    nome_razao_social: Optional[str] = Field(default=None, min_length=3, max_length=255)
    nome_fantasia: Optional[str] = Field(default=None, max_length=255)
    cpf_cnpj: Optional[str] = Field(default=None, max_length=20)
    rg: Optional[str] = Field(default=None, max_length=30)
    inscricao_estadual: Optional[str] = Field(default=None, max_length=50)
    telefone: Optional[str] = Field(default=None, max_length=30)
    whatsapp: Optional[str] = Field(default=None, max_length=30)
    email: Optional[str] = Field(default=None, max_length=255)
    cep: Optional[str] = Field(default=None, max_length=20)
    endereco: Optional[str] = Field(default=None, max_length=255)
    numero: Optional[str] = Field(default=None, max_length=20)
    complemento: Optional[str] = Field(default=None, max_length=100)
    bairro: Optional[str] = Field(default=None, max_length=100)
    cidade: Optional[str] = Field(default=None, max_length=100)
    uf: Optional[str] = Field(default=None, min_length=2, max_length=2)
    codigo_externo: Optional[str] = Field(default=None, max_length=50)
    contribuinte: Optional[str] = Field(default=None, max_length=100)
    inscricao_municipal: Optional[str] = Field(default=None, max_length=50)
    codigo_regime_tributario: Optional[str] = Field(default=None, max_length=100)
    inscricao_suframa: Optional[str] = Field(default=None, max_length=50)
    data_nascimento: Optional[datetime] = None
    status_crm: Optional[str] = Field(default=None, max_length=50)
    vendedor_id: Optional[str] = Field(default=None, max_length=50)
    limite_credito: Optional[int] = None
    representante_id: Optional[int] = Field(default=None, ge=1)
    nome_vendedor_interno: Optional[str] = Field(default=None, max_length=255)
    forma_pagamento_id: Optional[int] = Field(default=None, ge=1)
    condicao_pagamento_id: Optional[int] = Field(default=None, ge=1)
    cep_cobranca: Optional[str] = Field(default=None, max_length=20)
    endereco_cobranca: Optional[str] = Field(default=None, max_length=255)
    numero_cobranca: Optional[str] = Field(default=None, max_length=20)
    complemento_cobranca: Optional[str] = Field(default=None, max_length=100)
    bairro_cobranca: Optional[str] = Field(default=None, max_length=100)
    uf_cobranca: Optional[str] = Field(default=None, min_length=2, max_length=2)
    municipio_cobranca: Optional[str] = Field(default=None, max_length=100)
    cnpj_cobranca: Optional[str] = Field(default=None, max_length=20)
    inscricao_estadual_cobranca: Optional[str] = Field(default=None, max_length=50)
    email_cobranca: Optional[str] = Field(default=None, max_length=255)
    cep_entrega: Optional[str] = Field(default=None, max_length=20)
    endereco_entrega: Optional[str] = Field(default=None, max_length=255)
    numero_entrega: Optional[str] = Field(default=None, max_length=20)
    complemento_entrega: Optional[str] = Field(default=None, max_length=100)
    bairro_entrega: Optional[str] = Field(default=None, max_length=100)
    cidade_entrega: Optional[str] = Field(default=None, max_length=100)
    uf_entrega: Optional[str] = Field(default=None, min_length=2, max_length=2)
    forma_pagamento_padrao: Optional[str] = Field(default=None, max_length=50)
    condicao_pagamento: Optional[CondicaoPagamentoCadastro] = None
    prazo_pagamento_dias: Optional[int] = None
    prazo_entrega_padrao_dias: Optional[int] = None
    observacoes: Optional[str] = None


class ClienteSchema(ClienteBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
