from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict
from .usuarios import UserSchema
from comercial.schemas import RepresentanteSchema, CondicaoPagamentoSchema

class PedidoVendaItemBase(BaseModel):
    produto_id: int
    quantidade: float
    preco_unitario: float

class PedidoVendaItemCreate(PedidoVendaItemBase):
    pass

class ProdutoCatalogoVendaSchema(BaseModel):
    id: int
    sku: str
    
    nome: str
    categoria: Optional[str] = None
    unidade_medida: str
    preco_venda: float
    estoque_atual: float
    dias_preparacao: int
    descricao: Optional[str] = None
    corredor: Optional[str] = None
    prateleira: Optional[str] = None
    posicao: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)

class PedidoVendaItemSchema(PedidoVendaItemBase):
    id: int
    pedido_id: int
    produto: Optional[ProdutoCatalogoVendaSchema] = None
    model_config = ConfigDict(from_attributes=True)

class PedidoVendaBase(BaseModel):
    tipo: str = "PEDIDO"
    cliente_id: Optional[int] = None
    cliente_nome: str
    representante_id: Optional[int] = None
    vendedor_interno_id: Optional[int] = None
    condicao_pagamento_id: Optional[int] = None
    valor_frete: float = 0.0
    desconto_valor: float = 0.0
    valor_total: float = 0.0
    gerar_nota: Optional[bool] = True
    observacoes: Optional[str] = None
    codigo_rastreio: Optional[str] = None
    url_rastreio: Optional[str] = None
    codigo_rastreamento: Optional[str] = None
    url_rastreamento: Optional[str] = None
    vendedor_id: Optional[int] = None
    data_prevista: Optional[datetime] = None
    transportadora: Optional[str] = None
    natureza_operacao: Optional[str] = None
    empresa_faturadora_id: Optional[int] = None

class PedidoVendaCreate(PedidoVendaBase):
    itens: List[PedidoVendaItemCreate]

class PedidoVendaSchema(PedidoVendaBase):
    id: int
    data_pedido: datetime
    status: str
    valor_total: float
    itens: List[PedidoVendaItemSchema]
    representante: Optional[RepresentanteSchema] = None
    vendedor_interno: Optional[UserSchema] = None
    condicao_pagamento: Optional[CondicaoPagamentoSchema] = None
    model_config = ConfigDict(from_attributes=True)
