window.APP_MODULES = Object.freeze({
    dashboard: {
        id: 'dashboard',
        label: 'Dashboard',
        pageTitle: 'Dashboard',
        icon: 'ph ph-squares-four',
        folder: 'dashboard',
        externalScripts: [
            'https://cdn.jsdelivr.net/npm/chart.js'
        ],
        featureGroup: 'INICIO',
        roles: ['ADMIN', 'GERENTE', 'OPERADOR'],
        permissionKeys: ['DASHBOARD', 'DASHBOARD_VIEW'],
        order: 10
    },
    compras: {
        id: 'compras',
        label: 'Suprimentos (Compras)',
        pageTitle: 'Gestão de Suprimentos',
        icon: 'ph ph-shopping-bag',
        folder: 'compras',
        featureGroup: 'SUPRIMENTOS',
        roles: ['ADMIN', 'GERENTE', 'OPERADOR'],
        permissionKeys: ['COMPRAS', 'COMPRAS_VIEW', 'ESTOQUE'],
        order: 12
    },
    vendas: {
        id: 'vendas',
        label: 'Catálogo Vendas',
        pageTitle: 'Catálogo de Vendas',
        icon: 'ph ph-shopping-cart',
        folder: 'vendas',
        featureGroup: 'VENDAS',
        roles: ['ADMIN', 'GERENTE', 'COMERCIAL'],
        permissionKeys: ['VENDAS', 'COMERCIAL', 'VENDAS_VIEW'],
        order: 15
    },
    pedidos_venda: {
        id: 'pedidos_venda',
        label: 'Pedidos de Venda',
        pageTitle: 'Pedidos de Venda',
        icon: 'ph ph-receipt',
        folder: 'vendas',
        featureGroup: 'VENDAS',
        roles: ['ADMIN', 'GERENTE', 'COMERCIAL'],
        permissionKeys: ['VENDAS', 'COMERCIAL', 'VENDAS_VIEW'],
        order: 16
    },
    configuracoes_vendas: {
        id: 'configuracoes_vendas',
        label: 'Config. de Vendas',
        pageTitle: 'Configurações de Vendas',
        icon: 'ph ph-gear-six',
        folder: 'vendas',
        featureGroup: 'CONFIGURACOES',
        roles: ['ADMIN', 'GERENTE'],
        permissionKeys: ['VENDAS', 'COMERCIAL', 'CONFIGURACOES'],
        order: 17
    },
    resultados_comerciais: {
        id: 'resultados_comerciais',
        label: 'Resultados Comerc.',
        pageTitle: 'Resultados e Políticas Comerciais',
        icon: 'ph ph-trend-up',
        folder: 'vendas',
        featureGroup: 'VENDAS',
        roles: ['ADMIN', 'GERENTE', 'COMERCIAL'],
        permissionKeys: ['VENDAS', 'COMERCIAL', 'BI'],
        order: 17.5
    },
    expedicao_painel: {
        id: 'expedicao_painel',
        label: 'Painel de Expedição',
        pageTitle: 'Expedição e Etiquetas',
        icon: 'ph ph-package',
        folder: 'expedicao',
        featureGroup: 'SUPRIMENTOS',
        roles: ['ADMIN', 'GERENTE', 'OPERADOR'],
        permissionKeys: ['ESTOQUE', 'EXPEDICAO'],
        order: 18
    },
    separacao: {
        id: 'separacao',
        label: 'Separação (Picking)',
        pageTitle: 'Separação de Produtos',
        icon: 'ph ph-barcode',
        folder: 'expedicao',
        featureGroup: 'SUPRIMENTOS',
        roles: ['ADMIN', 'GERENTE', 'OPERADOR'],
        permissionKeys: ['ESTOQUE', 'EXPEDICAO'],
        order: 18.5
    },
    expedicao_configuracoes: {
        id: 'expedicao_configuracoes',
        label: 'Config. Expedição',
        pageTitle: 'Configurações de Expedição',
        icon: 'ph ph-printer',
        folder: 'expedicao',
        featureGroup: 'CONFIGURACOES',
        roles: ['ADMIN', 'GERENTE'],
        permissionKeys: ['ESTOQUE', 'EXPEDICAO', 'CONFIGURACOES'],
        order: 19
    },
    clientes: {
        id: 'clientes',
        label: 'Gestão de Clientes',
        pageTitle: 'Gestão de Clientes',
        icon: 'ph ph-address-book',
        folder: 'comercial',
        featureGroup: 'CADASTROS',
        roles: ['ADMIN', 'GERENTE', 'COMERCIAL'],
        permissionKeys: ['CLIENTES', 'COMERCIAL', 'CLIENTES_VIEW'],
        order: 14
    },
    propostas: {
        id: 'propostas',
        label: 'Propostas Comerciais',
        pageTitle: 'Propostas Comerciais',
        icon: 'ph ph-handshake',
        folder: 'comercial',
        featureGroup: 'VENDAS',
        roles: ['ADMIN', 'GERENTE', 'COMERCIAL'],
        permissionKeys: ['VENDAS', 'COMERCIAL', 'VENDAS_VIEW'],
        order: 14.5
    },
    // ponytail: módulo 'expedicao' legado removido — substituído por expedicao_painel + expedicao_configuracoes
    financeiro: {
        id: 'financeiro',
        label: 'Financeiro',
        pageTitle: 'Gestão Financeira',
        icon: 'ph ph-currency-dollar',
        folder: 'financeiro',
        featureGroup: 'FINANCAS',
        roles: ['ADMIN', 'GERENTE'],
        permissionKeys: ['FINANCEIRO', 'FINANCEIRO_VIEW'],
        order: 25
    },
    configuracoes_financeiras: {
        id: 'configuracoes_financeiras',
        label: 'Config. Financeiras',
        pageTitle: 'Configurações Financeiras',
        icon: 'ph ph-bank',
        folder: 'financeiro',
        featureGroup: 'CONFIGURACOES',
        roles: ['ADMIN', 'GERENTE'],
        permissionKeys: ['FINANCEIRO', 'CONFIGURACOES'],
        order: 26
    },
    relatorios_financeiros: {
        id: 'relatorios_financeiros',
        label: 'Relatórios Finanças',
        pageTitle: 'DRE e Fluxo de Caixa',
        icon: 'ph ph-chart-polar',
        folder: 'financeiro',
        featureGroup: 'FINANCAS',
        roles: ['ADMIN', 'GERENTE'],
        permissionKeys: ['FINANCEIRO', 'FINANCEIRO_VIEW', 'RELATORIOS'],
        order: 27
    },
    cobrancas_bancarias: {
        id: 'cobrancas_bancarias',
        label: 'Cobranças Bancárias',
        pageTitle: 'Integração Bancária',
        icon: 'ph ph-barcode',
        folder: 'financeiro',
        featureGroup: 'FINANCAS',
        roles: ['ADMIN', 'GERENTE'],
        permissionKeys: ['FINANCEIRO', 'FINANCEIRO_VIEW'],
        order: 28
    },
    produtos: {
        id: 'produtos',
        label: 'Controle de Estoque',
        pageTitle: 'Controle de Estoque',
        icon: 'ph ph-package',
        folder: 'estoque',
        featureGroup: 'CADASTROS',
        roles: ['ADMIN', 'GERENTE', 'OPERADOR'],
        permissionKeys: ['ESTOQUE', 'PRODUTOS', 'ESTOQUE_VIEW'],
        order: 20
    },
    configuracoes_produtos: {
        id: 'configuracoes_produtos',
        label: 'Config. de Produtos',
        pageTitle: 'Configurações de Produtos',
        icon: 'ph ph-sliders',
        folder: 'estoque',
        featureGroup: 'CONFIGURACOES',
        roles: ['ADMIN', 'GERENTE'],
        permissionKeys: ['ESTOQUE', 'CONFIGURACOES'],
        order: 21
    },
    reservas: {
        id: 'reservas',
        label: 'Reservas',
        pageTitle: 'Reservas',
        icon: 'ph ph-hand-pointing',
        folder: 'estoque',
        featureGroup: 'CADASTROS',
        roles: ['ADMIN', 'GERENTE', 'OPERADOR'],
        permissionKeys: ['RESERVAS', 'ESTOQUE', 'RESERVAS_VIEW'],
        order: 30
    },
    inventario: {
        id: 'inventario',
        label: 'Inventário',
        pageTitle: 'Inventário',
        icon: 'ph ph-clipboard-text',
        folder: 'estoque',
        featureGroup: 'SUPRIMENTOS',
        roles: ['ADMIN', 'GERENTE', 'OPERADOR'],
        permissionKeys: ['INVENTARIO', 'ESTOQUE', 'INVENTARIO_VIEW'],
        order: 40
    },
    relatorios: {
        id: 'relatorios',
        label: 'Relatórios',
        pageTitle: 'Relatórios',
        icon: 'ph ph-chart-line-up',
        folder: 'relatorios',
        featureGroup: 'SUPRIMENTOS',
        roles: ['ADMIN', 'GERENTE', 'OPERADOR'],
        permissionKeys: ['RELATORIOS', 'BI', 'RELATORIOS_VIEW'],
        order: 50
    },
    gestao_fabrica: {
        id: 'gestao_fabrica',
        label: 'Gestão Fábrica',
        pageTitle: 'Gestão Fábrica',
        icon: 'ph ph-grid-four',
        folder: 'gestao_fabrica',
        featureGroup: 'SERVICOS',
        roles: ['ADMIN', 'GERENTE', 'OPERADOR'],
        permissionKeys: ['GESTAO_FABRICA', 'MANUTENCAO', 'PCP', 'PRODUCAO', 'GESTAO_FABRICA_VIEW'],
        order: 55
    },
    produtividade: {
        id: 'produtividade',
        label: 'Produtividade',
        pageTitle: 'Produtividade Real x Teórica',
        icon: 'ph ph-gauge',
        folder: 'produtividade',
        featureGroup: 'SERVICOS',
        roles: ['ADMIN', 'GERENTE', 'OPERADOR'],
        permissionKeys: ['PRODUTIVIDADE_VIEW', 'PRODUCAO', 'PCP', 'GESTAO_FABRICA', 'RELATORIOS'],
        order: 58
    },
    manutencao: {
        id: 'manutencao',
        label: 'Manutenção',
        pageTitle: 'Manutenção',
        icon: 'ph ph-wrench',
        folder: 'manutencao',
        featureGroup: 'SERVICOS',
        roles: ['ADMIN', 'GERENTE', 'OPERADOR'],
        permissionKeys: ['MANUTENCAO', 'MANUTENCAO_VIEW'],
        order: 60
    },
    pcp: {
        id: 'pcp',
        label: 'Produção (PCP)',
        pageTitle: 'Produção (PCP)',
        icon: 'ph ph-factory',
        folder: 'pcp',
        featureGroup: 'SERVICOS',
        roles: ['ADMIN', 'GERENTE', 'OPERADOR'],
        permissionKeys: ['PCP', 'PRODUCAO', 'PCP_VIEW'],
        order: 70
    },
    auditoria: {
        id: 'auditoria',
        label: 'Auditoria',
        pageTitle: 'Auditoria',
        icon: 'ph ph-file-search',
        folder: 'auditoria',
        featureGroup: 'ADMIN',
        roles: ['ADMIN'],
        permissionKeys: ['AUDITORIA', 'AUDITORIA_VIEW'],
        order: 80
    },
    usuarios: {
        id: 'usuarios',
        label: 'Usuários',
        pageTitle: 'Usuários',
        icon: 'ph ph-users-three',
        folder: 'usuarios',
        featureGroup: 'ADMIN',
        roles: ['ADMIN'],
        permissionKeys: ['USUARIOS', 'USUARIOS_VIEW'],
        order: 90
    },
    configuracoes: {
        id: 'configuracoes',
        label: 'Configurações',
        pageTitle: 'Configurações',
        icon: 'ph ph-gear',
        folder: 'configuracoes',
        featureGroup: 'ADMIN',
        roles: ['ADMIN'],
        permissionKeys: ['CONFIGURACOES', 'CONFIGURACOES_VIEW'],
        order: 100
    }
});

window.getAppModule = function(moduleId) {
    return window.APP_MODULES[moduleId] || null;
};

window.listAppModules = function() {
    return Object.values(window.APP_MODULES).sort((a, b) => a.order - b.order);
};
