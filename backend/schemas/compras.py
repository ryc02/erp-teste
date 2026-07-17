from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from enum import Enum

class StatusOrdemCompra(str, Enum):
    RASCUNHO = "RASCUNHO"
    AGUARDANDO_RECEBIMENTO = "AGUARDANDO_RECEBIMENTO"
    RECEBIDO = "RECEBIDO"
    CANCELADO = "CANCELADO"

class OrdemCompraItemBase(BaseModel):
    produto_id: int
    quantidade: float
    preco_unitario: float

class OrdemCompraItemCreate(OrdemCompraItemBase):
    pass

class OrdemCompraItemSchema(OrdemCompraItemBase):
    id: int
    ordem_id: int
    class Config:
        from_attributes = True

class OrdemCompraBase(BaseModel):
    fornecedor_id: Optional[int] = None
    fornecedor_nome: str
    valor_frete: float = 0.0
    desconto_valor: float = 0.0
    observacoes: Optional[str] = None
    status: Optional[StatusOrdemCompra] = StatusOrdemCompra.RASCUNHO

class OrdemCompraCreate(OrdemCompraBase):
    itens: List[OrdemCompraItemCreate]

class OrdemCompraSchema(OrdemCompraBase):
    id: int
    data_emissao: datetime
    data_recebimento: Optional[datetime] = None
    valor_total: float
    itens: List[OrdemCompraItemSchema] = []

    class Config:
        from_attributes = True
