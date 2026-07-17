from pydantic import BaseModel, ConfigDict
from typing import Optional

class ConfiguracoesVendaBase(BaseModel):
    desconto_tipo: str = "VALOR"
    considerar_taxa_cartao: bool = False
    dias_vencimento_padrao: int = 30
    imprimir_vendedor: bool = True
    imprimir_observacoes: bool = True
    desconto_maximo_sem_aprovacao: float = 10.0
    
    exibir_preco_desconto_itens: bool = True
    alerta_endereco_incompleto: bool = True
    alerta_comissao_zerada: bool = True
    visualizar_contas_receber: bool = True
    exibir_marcador_status_pagamento: bool = True
    exibir_detalhes_venda: str = "SIM"
    exibir_dados_adicionais: str = "SIM"
    exibir_transportador: str = "SIM"

class ConfiguracoesVendaCreate(ConfiguracoesVendaBase):
    pass

class ConfiguracoesVendaUpdate(ConfiguracoesVendaBase):
    pass

class ConfiguracoesVendaSchema(ConfiguracoesVendaBase):
    id: int
    model_config = ConfigDict(from_attributes=True)
