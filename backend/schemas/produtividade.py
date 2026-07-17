from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


class SetorProdutividadeBase(BaseModel):
    nome: str
    meta_diaria: float
    meta_colaborador_diaria: float = 0.0
    ativo: bool = True


class SetorProdutividadeCreate(SetorProdutividadeBase):
    pass


class SetorProdutividadeUpdate(BaseModel):
    nome: Optional[str] = None
    meta_diaria: Optional[float] = None
    meta_colaborador_diaria: Optional[float] = None
    ativo: Optional[bool] = None


class SetorProdutividadeSchema(SetorProdutividadeBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class ColaboradorProdutividadeBase(BaseModel):
    nome: str
    setor_id: int
    ativo: bool = True


class ColaboradorProdutividadeCreate(ColaboradorProdutividadeBase):
    pass


class ColaboradorProdutividadeUpdate(BaseModel):
    nome: Optional[str] = None
    setor_id: Optional[int] = None
    ativo: Optional[bool] = None


class ColaboradorProdutividadeSchema(ColaboradorProdutividadeBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    setor: Optional[SetorProdutividadeSchema] = None

    model_config = ConfigDict(from_attributes=True)


class ApontamentoProdutividadeBase(BaseModel):
    data_referencia: date
    setor_id: int
    colaborador_id: Optional[int] = None
    colaborador_nome: Optional[str] = None
    quantidade: float = 0.0
    ocorrencia: str = "PRODUCAO"
    observacao: Optional[str] = None


class ApontamentoProdutividadeCreate(ApontamentoProdutividadeBase):
    pass


class ApontamentoProdutividadeUpdate(BaseModel):
    data_referencia: Optional[date] = None
    setor_id: Optional[int] = None
    colaborador_id: Optional[int] = None
    colaborador_nome: Optional[str] = None
    quantidade: Optional[float] = None
    ocorrencia: Optional[str] = None
    observacao: Optional[str] = None


class ApontamentoProdutividadeSchema(ApontamentoProdutividadeBase):
    id: int
    criado_por: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    setor: Optional[SetorProdutividadeSchema] = None
    colaborador: Optional[ColaboradorProdutividadeSchema] = None

    model_config = ConfigDict(from_attributes=True)
