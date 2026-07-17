window.APP_MODULES = Object.freeze({
    clientes: {
        id: 'clientes',
        label: 'Clientes',
        pageTitle: 'Cadastro de Clientes',
        icon: 'ph ph-address-book-tabs',
        folder: 'clientes',
        featureGroup: 'COMERCIAL',
        roles: ['ADMIN', 'GERENTE', 'COMERCIAL'],
        permissionKeys: ['COMERCIAL', 'CLIENTES', 'CLIENTES_VIEW'],
        order: 10
    }
});

window.getAppModule = function(moduleId) {
    return window.APP_MODULES[moduleId] || null;
};

window.listAppModules = function() {
    return Object.values(window.APP_MODULES).sort((a, b) => a.order - b.order);
};
