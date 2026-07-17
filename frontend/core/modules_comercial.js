window.APP_MODULES = Object.freeze({
    vendas: {
        id: 'vendas',
        label: 'Pedidos de Venda',
        pageTitle: 'Pedidos de Venda',
        icon: 'ph ph-shopping-cart-simple',
        folder: 'vendas',
        featureGroup: 'VENDAS',
        roles: ['ADMIN', 'GERENTE', 'OPERADOR', 'COMERCIAL'],
        permissionKeys: ['VENDAS', 'VENDAS_VIEW', 'COMERCIAL'],
        order: 10
    }
});

window.getAppModule = function(moduleId) {
    return window.APP_MODULES[moduleId] || null;
};

window.listAppModules = function() {
    return Object.values(window.APP_MODULES).sort((a, b) => a.order - b.order);
};
