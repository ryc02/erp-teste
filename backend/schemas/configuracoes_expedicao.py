from pydantic import BaseModel
from typing import Optional

class ConfiguracoesExpedicaoBase(BaseModel):
    formato_etiqueta: str = "PDF_A4"
    template_etiqueta: Optional[str] = None
    imprimir_dce: bool = True
    remetente_nome: Optional[str] = None
    remetente_documento: Optional[str] = None
    remetente_endereco: Optional[str] = None
    remetente_cidade: Optional[str] = None
    remetente_estado: Optional[str] = None
    remetente_cep: Optional[str] = None

class ConfiguracoesExpedicaoResponse(ConfiguracoesExpedicaoBase):
    id: int

    class Config:
        from_attributes = True

class ConfiguracoesExpedicaoUpdate(ConfiguracoesExpedicaoBase):
    pass
