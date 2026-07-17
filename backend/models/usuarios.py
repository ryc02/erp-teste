from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, Text, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base

class Role(Base):
    __tablename__ = "roles"
    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String, unique=True, index=True)
    permissoes = Column(Text, nullable=True)

class User(Base):
    __tablename__ = "usuarios"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    nome_completo = Column(String)
    role_id = Column(Integer, ForeignKey("roles.id"))
    permissoes = Column(Text, nullable=True)  # Lista de módulos separados por vírgula
    ativo = Column(Boolean, default=True)
    comissao_percentual = Column(Integer, nullable=True, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    role = relationship("Role")

class Modulo(Base):
    __tablename__ = "modulos"
    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String, unique=True, index=True)
    descricao = Column(String)
    ativo = Column(Boolean, default=True)
