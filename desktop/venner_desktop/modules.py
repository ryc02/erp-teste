from .runtime import ModuleDefinition


ERP_MODULE = ModuleDefinition(
    module_id="erp",
    title="Venner ERP",
    login_target="/index.html",
    window_width=1440,
    window_height=900,
)


VENDAS_MODULE = ModuleDefinition(
    module_id="vendas",
    title="Venner Vendas",
    login_target="/comercial/index.html",
    window_width=1360,
    window_height=860,
)


ESTOQUE_MODULE = ModuleDefinition(
    module_id="estoque",
    title="Venner Estoque",
    login_target="/index.html#produtos",
    window_width=1280,
    window_height=800,
)


MANUTENCAO_MODULE = ModuleDefinition(
    module_id="manutencao",
    title="Venner Manutenção",
    login_target="/index.html#manutencao",
    window_width=1280,
    window_height=800,
)


PCP_MODULE = ModuleDefinition(
    module_id="pcp",
    title="Venner PCP",
    login_target="/index.html#pcp",
    window_width=1400,
    window_height=850,
)


PRODUTIVIDADE_MODULE = ModuleDefinition(
    module_id="produtividade",
    title="Venner Produtividade",
    login_target="/index.html#produtividade",
    window_width=1280,
    window_height=800,
)


USUARIOS_MODULE = ModuleDefinition(
    module_id="usuarios",
    title="Gerenciamento de Usuários",
    login_target="/index.html#usuarios",
    window_width=1200,
    window_height=800,
)


CONFIG_MODULE = ModuleDefinition(
    module_id="configuracoes",
    title="Configurações do Sistema",
    login_target="/index.html#configuracoes",
    window_width=1200,
    window_height=800,
)


MODULES = {
    ERP_MODULE.module_id: ERP_MODULE,
    VENDAS_MODULE.module_id: VENDAS_MODULE,
    ESTOQUE_MODULE.module_id: ESTOQUE_MODULE,
    MANUTENCAO_MODULE.module_id: MANUTENCAO_MODULE,
    PCP_MODULE.module_id: PCP_MODULE,
    PRODUTIVIDADE_MODULE.module_id: PRODUTIVIDADE_MODULE,
    USUARIOS_MODULE.module_id: USUARIOS_MODULE,
    CONFIG_MODULE.module_id: CONFIG_MODULE,
}
