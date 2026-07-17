window.Modulo_expedicao_configuracoes = {
    init: async function() {
        await this.carregarConfiguracoes();
    },
    
    refresh: function() {},
    
    destroy: function() {},

    carregarConfiguracoes: async function() {
        try {
            const res = await window.apiFetch('/configuracoes-expedicao');
            if (!res.ok) throw new Error('Erro ao carregar');
            const config = await res.json();
            
            document.getElementById('config-formato-etiqueta').value = config.formato_etiqueta || 'PDF_A4';
            document.getElementById('config-imprimir-dce').checked = config.imprimir_dce;
            document.getElementById('config-remetente-nome').value = config.remetente_nome || '';
            document.getElementById('config-remetente-documento').value = config.remetente_documento || '';
            document.getElementById('config-remetente-cep').value = config.remetente_cep || '';
            document.getElementById('config-remetente-endereco').value = config.remetente_endereco || '';
            document.getElementById('config-remetente-cidade').value = config.remetente_cidade || '';
            document.getElementById('config-remetente-estado').value = config.remetente_estado || '';
            
        } catch (error) {
            console.error('Erro ao carregar configurações de expedição:', error);
            // toast is handled by apiFetch
        }
    },

    salvarConfiguracoes: async function() {
        const payload = {
            formato_etiqueta: document.getElementById('config-formato-etiqueta').value,
            imprimir_dce: document.getElementById('config-imprimir-dce').checked,
            remetente_nome: document.getElementById('config-remetente-nome').value,
            remetente_documento: document.getElementById('config-remetente-documento').value,
            remetente_cep: document.getElementById('config-remetente-cep').value,
            remetente_endereco: document.getElementById('config-remetente-endereco').value,
            remetente_cidade: document.getElementById('config-remetente-cidade').value,
            remetente_estado: document.getElementById('config-remetente-estado').value
        };

        try {
            const res = await window.apiFetch('/configuracoes-expedicao', {
                method: 'PUT',
                body: JSON.stringify(payload)
            });
            
            if (res.ok) {
                window.ui.showNotify('Configurações salvas com sucesso!', 'success');
            }
        } catch (error) {
            console.error('Erro ao salvar:', error);
        }
    }
};
