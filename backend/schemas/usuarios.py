from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional

class RoleBase(BaseModel):
    nome: str
    permissoes: Optional[str] = None

class RoleSchema(RoleBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

class UserBase(BaseModel):
    username: str
    email: str
    nome_completo: str
    role_id: int
    permissoes: Optional[str] = None
    ativo: bool = True
    comissao_percentual: Optional[float] = 0

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    email: Optional[str] = None
    nome_completo: Optional[str] = None
    role_id: Optional[int] = None
    permissoes: Optional[str] = None
    ativo: Optional[bool] = None
    password: Optional[str] = None
    comissao_percentual: Optional[float] = None

class UserSchema(UserBase):
    id: int
    created_at: datetime
    role: Optional[RoleSchema] = None
    model_config = ConfigDict(from_attributes=True)

class ModuloBase(BaseModel):
    nome: str
    descricao: Optional[str] = None
    ativo: bool = True

class ModuloSchema(ModuloBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

class ModuloUpdate(BaseModel):
    ativo: bool
