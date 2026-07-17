from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional, List
from .produtos import ProdutoSchema

class MaquinaBase(BaseModel):
    nome: str
    tipo: Optional[str] = None
    capacidade: Optional[str] = None
    status: Optional[str] = "OPERANTE"

class MaquinaCreate(MaquinaBase):
    pass

class MaquinaSchema(MaquinaBase):
    id: int
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class OrdemServicoBase(BaseModel):
    maquina_id: Optional[int] = None
    tipo: str
    problema_desc: Optional[str] = None

class OSItemCreate(BaseModel):
    produto_id: int
    quantidade: float
    custo_unitario: Optional[float] = 0.0

class OSItemSchema(BaseModel):
    id: int
    produto_id: int
    quantidade: float
    custo_unitario: Optional[float] = 0.0
    produto: Optional[ProdutoSchema] = None
    model_config = ConfigDict(from_attributes=True)

class OSFinalizacaoPayload(BaseModel):
    custo_mao_obra: Optional[float] = 0.0

class OrdemServicoCreate(OrdemServicoBase):
    pass

class OrdemServicoSchema(OrdemServicoBase):
    id: int
    status: str
    custo_mao_obra: float
    custo_total: float
    data_abertura: datetime
    data_fechamento: Optional[datetime] = None
    maquina: Optional[MaquinaSchema] = None
    itens: List[OSItemSchema] = []
    model_config = ConfigDict(from_attributes=True)
