from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class RepresentanteBase(BaseModel):
    codigo: Optional[str] = None
    nome: str = Field(min_length=2, max_length=255)
    fantasia: Optional[str] = None
    tipo_pessoa: Optional[str] = None
    cpf_cnpj: Optional[str] = None
    contribuinte: Optional[str] = None
    inscricao_estadual: Optional[str] = None
    cep: Optional[str] = None
    cidade: Optional[str] = None
    uf: Optional[str] = None
    endereco: Optional[str] = None
    bairro: Optional[str] = None
    numero: Optional[str] = None
    complemento: Optional[str] = None
    telefone: Optional[str] = None
    celular: Optional[str] = None
    email: Optional[str] = None
    ativo: bool = True


class RepresentanteCreate(RepresentanteBase):
    pass


class RepresentanteUpdate(BaseModel):
    codigo: Optional[str] = None
    nome: Optional[str] = Field(default=None, min_length=2, max_length=255)
    fantasia: Optional[str] = None
    tipo_pessoa: Optional[str] = None
    cpf_cnpj: Optional[str] = None
    contribuinte: Optional[str] = None
    inscricao_estadual: Optional[str] = None
    cep: Optional[str] = None
    cidade: Optional[str] = None
    uf: Optional[str] = None
    endereco: Optional[str] = None
    bairro: Optional[str] = None
    numero: Optional[str] = None
    complemento: Optional[str] = None
    telefone: Optional[str] = None
    celular: Optional[str] = None
    email: Optional[str] = None
    ativo: Optional[bool] = None


class RepresentanteSchema(RepresentanteBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
