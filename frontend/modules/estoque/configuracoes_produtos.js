window.Modulo_configuracoes_produtos = {
    init() {
        console.log("Módulo de Configurações de Produtos inicializado");
        this.loadSettings();
    },

    async loadSettings() {
        try {
            const res = await apiFetch('/configuracoes/produtos');
            if (res.ok) {
                const config = await res.json();
                this.populateForm(config);
            } else {
                showNotify("Erro ao carregar configurações de produtos", "error");
            }
        } catch (e) {
            console.error(e);
            showNotify("Falha na conexão ao carregar configurações", "error");
        }
    },

    populateForm(config) {
        const form = document.getElementById('form-configuracoes-produtos');
        if (!form) return;

        const setVal = (name, value) => {
            const el = form.elements[name];
            if (el) {
                if (el.type === 'checkbox') {
                    el.checked = value;
                } else if (el.tagName === 'SELECT' && typeof value === 'boolean') {
                    el.value = value ? "true" : "false";
                } else {
                    el.value = value !== null && value !== undefined ? value : '';
                }
            }
        };

        setVal('casas_decimais_quantidade', config.casas_decimais_quantidade);
        setVal('casas_decimais_preco', config.casas_decimais_preco);
        setVal('somar_peso_pedidos', config.somar_peso_pedidos);
        setVal('sku_automatico', config.sku_automatico);
        setVal('base_calculo_custo', config.base_calculo_custo);
        setVal('cadastro_automatico_compras', config.cadastro_automatico_compras);
        setVal('exibir_estoque_lista_precos', config.exibir_estoque_lista_precos);
        setVal('unidade_medida_padrao', config.unidade_medida_padrao);
        setVal('ncm_padrao', config.ncm_padrao);
        setVal('origem_padrao', config.origem_padrao);
    },

    async save(e) {
        e.preventDefault();
        const form = e.target;
        
        const data = {
            casas_decimais_quantidade: parseInt(form.elements['casas_decimais_quantidade'].value) || 2,
            casas_decimais_preco: parseInt(form.elements['casas_decimais_preco'].value) || 2,
            somar_peso_pedidos: form.elements['somar_peso_pedidos'].checked,
            sku_automatico: form.elements['sku_automatico'].value === "true",
            base_calculo_custo: form.elements['base_calculo_custo'].value,
            cadastro_automatico_compras: form.elements['cadastro_automatico_compras'].checked,
            exibir_estoque_lista_precos: form.elements['exibir_estoque_lista_precos'].checked,
            unidade_medida_padrao: form.elements['unidade_medida_padrao'].value,
            ncm_padrao: form.elements['ncm_padrao'].value || null,
            origem_padrao: form.elements['origem_padrao'].value
        };

        try {
            const res = await apiFetch('/configuracoes/produtos', {
                method: 'PUT',
                body: JSON.stringify(data)
            });

            if (res.ok) {
                showNotify("Configurações de produtos salvas com sucesso!", "success");
            } else {
                const err = await res.json();
                showNotify(err.detail || "Erro ao salvar configurações", "error");
            }
        } catch (e) {
            console.error(e);
            showNotify("Falha na conexão ao salvar configurações", "error");
        }
    }
};
