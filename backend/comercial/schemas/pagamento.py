from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field, model_validator

from comercial.models import BaseCalculoCondicao


class FormaPagamentoBase(BaseModel):
    codigo: int = Field(ge=1)
    descricao: str = Field(min_length=2, max_length=255)
    ativo: bool = True


class FormaPagamentoCreate(FormaPagamentoBase):
    pass


class FormaPagamentoUpdate(BaseModel):
    codigo: Optional[int] = Field(default=None, ge=1)
    descricao: Optional[str] = Field(default=None, min_length=2, max_length=255)
    ativo: Optional[bool] = None


class FormaPagamentoSchema(FormaPagamentoBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class CondicaoPagamentoParcela(BaseModel):
    numero: int = Field(ge=1)
    dias: Optional[int] = Field(default=None, ge=0)
    data_fixa: Optional[date] = None

    @model_validator(mode="after")
    def validate_due_rule(self):
        if self.dias is None and self.data_fixa is None:
            raise ValueError("Cada parcela deve ter dias ou data fixa.")
        return self


class CondicaoPagamentoBase(BaseModel):
    codigo: int = Field(ge=1)
    descricao: str = Field(min_length=2, max_length=255)
    indice_financeiro: float = Field(default=1.0, gt=0)
    base_calculo: BaseCalculoCondicao = BaseCalculoCondicao.DATA_DO_DIA
    numero_parcelas: int = Field(default=1, ge=1, le=24)
    parcelas: list[CondicaoPagamentoParcela] = Field(default_factory=list)
    ativo: bool = True


class CondicaoPagamentoCreate(CondicaoPagamentoBase):
    pass


class CondicaoPagamentoUpdate(BaseModel):
    codigo: Optional[int] = Field(default=None, ge=1)
    descricao: Optional[str] = Field(default=None, min_length=2, max_length=255)
    indice_financeiro: Optional[float] = Field(default=None, gt=0)
    base_calculo: Optional[BaseCalculoCondicao] = None
    numero_parcelas: Optional[int] = Field(default=None, ge=1, le=24)
    parcelas: Optional[list[CondicaoPagamentoParcela]] = None
    ativo: Optional[bool] = None


class CondicaoPagamentoSchema(CondicaoPagamentoBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
