window.Modulo_configuracoes_vendas = {
    init: async function() {
        await this.carregarConfiguracoes();
    },
    
    refresh: function() {},
    
    destroy: function() {},

    carregarConfiguracoes: async function() {
        try {
            const res = await apiFetch('/vendas/configuracoes');
            if (!res.ok) throw new Error('Falha ao carregar configurações de venda');
            const data = await res.json();
            
            document.getElementById('config-desconto-tipo').value = data.desconto_tipo || 'VALOR';
            document.getElementById('config-dias-vencimento').value = data.dias_vencimento_padrao || 30;
            document.getElementById('config-taxa-cartao').checked = data.considerar_taxa_cartao || false;
            document.getElementById('config-imprimir-vendedor').checked = data.imprimir_vendedor || false;
            document.getElementById('config-imprimir-obs').checked = data.imprimir_observacoes || false;
        } catch (e) {
            console.error(e);
            showNotify('Erro ao carregar configurações de venda', 'error');
        }
    },

    salvarConfiguracoes: async function() {
        const payload = {
            desconto_tipo: document.getElementById('config-desconto-tipo').value,
            dias_vencimento_padrao: parseInt(document.getElementById('config-dias-vencimento').value) || 30,
            considerar_taxa_cartao: document.getElementById('config-taxa-cartao').checked,
            imprimir_vendedor: document.getElementById('config-imprimir-vendedor').checked,
            imprimir_observacoes: document.getElementById('config-imprimir-obs').checked
        };

        try {
            const res = await apiFetch('/vendas/configuracoes', {
                method: 'PUT',
                body: JSON.stringify(payload)
            });
            
            if (!res.ok) throw new Error('Falha ao salvar configurações de venda');
            
            showNotify('Configurações de Venda salvas com sucesso!', 'success');
        } catch (e) {
            console.error(e);
            showNotify('Erro ao salvar configurações de venda', 'error');
        }
    }
};
