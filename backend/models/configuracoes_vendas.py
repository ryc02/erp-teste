from sqlalchemy import Column, Integer, String, Boolean, Float
from database import Base

class ConfiguracoesVenda(Base):
    __tablename__ = "configuracoes_vendas"
    id = Column(Integer, primary_key=True, index=True)
    desconto_tipo = Column(String, default="VALOR") # VALOR, PERCENTUAL
    considerar_taxa_cartao = Column(Boolean, default=False)
    dias_vencimento_padrao = Column(Integer, default=30)
    imprimir_vendedor = Column(Boolean, default=True)
    imprimir_observacoes = Column(Boolean, default=True)
    desconto_maximo_sem_aprovacao = Column(Float, default=10.0)
    
    # Novas configurações de exibição
    exibir_preco_desconto_itens = Column(Boolean, default=True)
    alerta_endereco_incompleto = Column(Boolean, default=True)
    alerta_comissao_zerada = Column(Boolean, default=True)
    visualizar_contas_receber = Column(Boolean, default=True)
    exibir_marcador_status_pagamento = Column(Boolean, default=True)
    exibir_detalhes_venda = Column(String, default="SIM") # SIM, NAO, RECOLHIDO
    exibir_dados_adicionais = Column(String, default="SIM") # SIM, NAO, RECOLHIDO
    exibir_transportador = Column(String, default="SIM") # SIM, NAO, RECOLHIDO

