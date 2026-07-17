from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class CategoriaFinanceiraBase(BaseModel):
    descricao: str
    grupo: Optional[str] = None
    considera_dre: Optional[str] = None
    tipo: Optional[str] = None
    padrao_venda: Optional[bool] = False

class CategoriaFinanceiraCreate(CategoriaFinanceiraBase):
    pass

class CategoriaFinanceiraResponse(CategoriaFinanceiraBase):
    id: int

    class Config:
        orm_mode = True

class ContaBancariaBase(BaseModel):
    descricao: str
    banco: Optional[str] = None
    agencia: Optional[str] = None
    conta: Optional[str] = None
    saldo_inicial: Optional[float] = 0.0

class ContaBancariaCreate(ContaBancariaBase):
    pass

class ContaBancariaResponse(ContaBancariaBase):
    id: int

    class Config:
        orm_mode = True

class ContaFinanceiraBase(BaseModel):
    tipo: str
    descricao: str
    valor: float
    data_vencimento: datetime
    data_pagamento: Optional[datetime] = None
    status: Optional[str] = "PENDENTE"
    categoria_id: Optional[int] = None
    conta_bancaria_id: Optional[int] = None
    pedido_id: Optional[int] = None
    cliente_id: Optional[int] = None
    observacoes: Optional[str] = None
    tags_csv: Optional[str] = None

class ContaFinanceiraCreate(ContaFinanceiraBase):
    pass

class ContaFinanceiraUpdate(BaseModel):
    status: Optional[str] = None
    data_pagamento: Optional[datetime] = None
    valor: Optional[float] = None
    conta_bancaria_id: Optional[int] = None

class ContaFinanceiraResponse(ContaFinanceiraBase):
    id: int
    data_emissao: datetime
    categoria: Optional[CategoriaFinanceiraResponse] = None
    
    # We will compute client name on the router if needed, or rely on cliente_id

    class Config:
        orm_mode = True

class DREContaItem(BaseModel):
    conta: str
    valor: float
    nivel: int
    tipo: str # normal, subtotal, total

class DREResponse(BaseModel):
    competencia: str
    linhas: List[DREContaItem]
