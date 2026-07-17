from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional, List
from .produtos import ProdutoSchema

class FichaTecnicaItemBase(BaseModel):
    produto_componente_id: int
    quantidade_necessaria: float

class FichaTecnicaItemCreate(FichaTecnicaItemBase):
    pass

class FichaTecnicaItemSchema(FichaTecnicaItemBase):
    id: int
    produto_composto_id: int
    produto_componente: Optional[ProdutoSchema] = None
    model_config = ConfigDict(from_attributes=True)

class OrdemProducaoItemSchema(BaseModel):
    id: int
    produto_componente_id: int
    quantidade_necessaria: float
    custo_unitario: float
    produto_componente: Optional[ProdutoSchema] = None
    model_config = ConfigDict(from_attributes=True)

class OrdemProducaoBase(BaseModel):
    produto_id: int
    quantidade_planejada: float

class OrdemProducaoCreate(OrdemProducaoBase):
    pass

class OrdemProducaoSchema(OrdemProducaoBase):
    id: int
    quantidade_produzida: float
    status: str
    data_inicio: Optional[datetime] = None
    data_fim: Optional[datetime] = None
    custo_mao_obra: float
    custo_insumos: float
    custo_maquina: float
    created_at: datetime
    produto: Optional[ProdutoSchema] = None
    itens: List[OrdemProducaoItemSchema] = []
    model_config = ConfigDict(from_attributes=True)
