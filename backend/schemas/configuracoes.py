from pydantic import BaseModel, ConfigDict
from typing import Optional

class ConfiguracaoProdutoBase(BaseModel):
    casas_decimais_quantidade: int = 2
    casas_decimais_preco: int = 2
    somar_peso_pedidos: bool = True
    sku_automatico: bool = False
    base_calculo_custo: str = "ultimo_custo"
    cadastro_automatico_compras: bool = False
    exibir_estoque_lista_precos: bool = True
    unidade_medida_padrao: str = "UN"
    ncm_padrao: Optional[str] = None
    origem_padrao: str = "0"

class ConfiguracaoProdutoUpdate(ConfiguracaoProdutoBase):
    pass

class ConfiguracaoProdutoSchema(ConfiguracaoProdutoBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

class ConfiguracaoVendaBase(BaseModel):
    desconto_tipo: str = "VALOR"
    considerar_taxa_cartao: bool = False
    dias_vencimento_padrao: int = 30
    imprimir_vendedor: bool = True
    imprimir_observacoes: bool = True
    desconto_maximo_sem_aprovacao: float = 10.0
    
    # Novas configurações de exibição
    exibir_preco_desconto_itens: bool = True
    alerta_endereco_incompleto: bool = True
    alerta_comissao_zerada: bool = True
    visualizar_contas_receber: bool = True
    exibir_marcador_status_pagamento: bool = True
    exibir_detalhes_venda: str = "SIM"
    exibir_dados_adicionais: str = "SIM"
    exibir_transportador: str = "SIM"

class ConfiguracaoVendaUpdate(ConfiguracaoVendaBase):
    pass

class ConfiguracaoVendaSchema(ConfiguracaoVendaBase):
    id: int
    model_config = ConfigDict(from_attributes=True)


