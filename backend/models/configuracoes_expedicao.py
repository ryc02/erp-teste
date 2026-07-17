from sqlalchemy import Column, Integer, String, Boolean
from database import Base

class ConfiguracoesExpedicao(Base):
    __tablename__ = "configuracoes_expedicao"

    id = Column(Integer, primary_key=True, index=True)
    formato_etiqueta = Column(String(50), default="PDF_A4") # PDF_A4, ZPL_TERMICA
    imprimir_dce = Column(Boolean, default=True)
    
    # Dados do Remetente Padrão (para emissão de etiquetas/DC-e)
    remetente_nome = Column(String(255), nullable=True)
    remetente_documento = Column(String(50), nullable=True) # CPF ou CNPJ
    remetente_endereco = Column(String(255), nullable=True)
    remetente_cidade = Column(String(100), nullable=True)
    remetente_estado = Column(String(2), nullable=True)
    remetente_cep = Column(String(20), nullable=True)
