from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class NotaFiscalBase(BaseModel):
    pedido_id: Optional[int] = None
    tipo: str = "E"
    serie: Optional[str] = None
    numero: Optional[str] = None
    numero_ecommerce: Optional[str] = None
    cliente_id: Optional[int] = None
    cliente_nome: Optional[str] = None
    cliente_cpf_cnpj: Optional[str] = None
    valor_produtos: float = 0.0
    valor_frete: float = 0.0
    valor_total: float = 0.0
    vendedor_id: Optional[int] = None
    nome_vendedor: Optional[str] = None
    situacao: str = "0"
    descricao_situacao: str = "Pendente"
    id_forma_frete: Optional[str] = None
    id_forma_envio: Optional[str] = None
    codigo_rastreamento: Optional[str] = None
    url_rastreamento: Optional[str] = None
    chave_acesso: Optional[str] = None

class NotaFiscalCreate(NotaFiscalBase):
    pass

class NotaFiscalUpdate(NotaFiscalBase):
    pass

class NotaFiscalResponse(NotaFiscalBase):
    id: int
    data_emissao: datetime
    created_at: datetime
    
    class Config:
        orm_mode = True
