from sqlalchemy import Column, Integer, String, Boolean, Float, DateTime
from models.base import Base

class ConfiguracaoProduto(Base):
    __tablename__ = "configuracoes_produtos"

    id = Column(Integer, primary_key=True, index=True)
    casas_decimais_quantidade = Column(Integer, default=2)
    casas_decimais_preco = Column(Integer, default=2)
    somar_peso_pedidos = Column(Boolean, default=True)
    sku_automatico = Column(Boolean, default=False)
    base_calculo_custo = Column(String, default="ultimo_custo")
    cadastro_automatico_compras = Column(Boolean, default=False)
    exibir_estoque_lista_precos = Column(Boolean, default=True)
    unidade_medida_padrao = Column(String, default="UN")
    ncm_padrao = Column(String, nullable=True)
    origem_padrao = Column(String, default="0")
