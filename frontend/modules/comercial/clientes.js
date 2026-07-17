window.Modulo_clientes = {
    clientes: [],
    representantes: [],
    formasPagamento: [],
    
    async init() {
        console.log("Modulo de Clientes inicializado");
        this.bindEvents();
        await this.loadData();
    },

    bindEvents() {
        const searchInput = document.getElementById('clientes-search');
        if (searchInput) {
            searchInput.addEventListener('input', () => {
                if (this.searchTimer) clearTimeout(this.searchTimer);
                this.searchTimer = setTimeout(() => this.renderList(), 300);
            });
        }
    },

    async loadData() {
        try {
            const [resCli, resRep, resForma] = await Promise.all([
                apiFetch('/comercial/clientes'),
                apiFetch('/comercial/representantes'),
                apiFetch('/comercial/formas-pagamento')
            ]);

            this.clientes = await resCli.json();
            this.representantes = await resRep.json();
            this.formasPagamento = await resForma.json();

            this.renderList();
            this.populateSelects();
            this.updateStats();
        } catch (e) {
            console.error("Erro ao carregar dados de clientes", e);
            showNotify("Erro ao carregar dados.", "error");
        }
    },

    refresh() {
        this.loadData();
    },

    updateStats() {
        if (document.getElementById('stat-clientes-total')) {
            document.getElementById('stat-clientes-total').innerText = this.clientes.length;
        }
        if (document.getElementById('stat-clientes-ativos')) {
            document.getElementById('stat-clientes-ativos').innerText = this.clientes.filter(c => c.situacao === 'ATIVO').length;
        }
        if (document.getElementById('stat-clientes-novos')) {
            const esteMes = new Date().toISOString().slice(0, 7);
            document.getElementById('stat-clientes-novos').innerText = this.clientes.filter(c => c.created_at && c.created_at.startsWith(esteMes)).length;
        }
    },

    renderList() {
        const tbody = document.querySelector('#table-clientes tbody');
        if (!tbody) return;

        const search = document.getElementById('clientes-search')?.value.toLowerCase() || '';
        const situacao = document.getElementById('clientes-filter-situacao')?.value;
        const tipo = document.getElementById('clientes-filter-tipo')?.value;

        const filtered = this.clientes.filter(c => {
            const matchesSearch = !search || 
                c.nome_razao_social.toLowerCase().includes(search) || 
                (c.cpf_cnpj && c.cpf_cnpj.includes(search)) ||
                (c.cidade && c.cidade.toLowerCase().includes(search));
            const matchesSituacao = !situacao || c.situacao === situacao;
            const matchesTipo = !tipo || c.tipo_pessoa === tipo;
            return matchesSearch && matchesSituacao && matchesTipo;
        });

        if (filtered.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align:center">Nenhum cliente encontrado.</td></tr>';
            return;
        }

        tbody.innerHTML = filtered.map(c => `
            <tr>
                <td>
                    <div style="font-weight: 600;">${c.nome_razao_social}</div>
                    <div style="font-size: 0.8rem; color: var(--text-secondary);">${c.nome_fantasia || ''}</div>
                </td>
                <td>${c.cpf_cnpj || '-'}</td>
                <td>${c.cidade || '-'}/${c.uf || '-'}</td>
                <td><span class="badge ${c.situacao === 'ATIVO' ? 'badge-success' : 'badge-danger'}">${c.situacao}</span></td>
                <td>
                    <div class="flex-gap">
                        <button class="btn btn-outline btn-sm" onclick="Modulo_clientes.edit(${c.id})" title="Editar">
                            <i class="ph ph-pencil"></i>
                        </button>
                        <button class="btn btn-outline btn-sm text-danger" onclick="Modulo_clientes.delete(${c.id})" title="Excluir">
                            <i class="ph ph-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    },

    populateSelects() {
        const repSel = document.getElementById('cliente-representante');
        if (repSel) {
            repSel.innerHTML = '<option value="">Venda Direta</option>' + 
                this.representantes.map(r => `<option value="${r.id}">${r.nome}</option>`).join('');
        }

        const formaSel = document.getElementById('cliente-forma-pgto');
        if (formaSel) {
            formaSel.innerHTML = '<option value="">Selecione...</option>' + 
                this.formasPagamento.map(f => `<option value="${f.id}">${f.nome}</option>`).join('');
        }
    },

    switchTab(tabId) {
        document.querySelectorAll('#modal-cliente .tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('onclick').includes(tabId));
        });
        document.querySelectorAll('#modal-cliente .tab-content').forEach(content => {
            content.classList.toggle('active', content.id === tabId);
        });
    },

    toggleDocumentLabels() {
        const tipo = document.getElementById('cliente-tipo-pessoa').value;
        const isJuridica = tipo === 'JURIDICA';
        
        document.getElementById('lbl-cliente-nome').innerText = isJuridica ? 'Razão Social' : 'Nome Completo';
        document.getElementById('lbl-cliente-documento').innerText = isJuridica ? 'CNPJ' : 'CPF';
        document.getElementById('lbl-cliente-rg').innerText = isJuridica ? 'Inscrição Estadual' : 'RG';
        document.getElementById('cliente-documento').placeholder = isJuridica ? '00.000.000/0000-00' : '000.000.000-00';
    },

    openModalNovo() {
        document.getElementById('form-cliente').reset();
        document.getElementById('cliente-id').value = '';
        document.getElementById('modal-cliente-title').innerText = 'Cadastro de Cliente';
        this.switchTab('tab-cliente-dados');
        this.toggleDocumentLabels();
        openModal('modal-cliente');
    },

    async edit(id) {
        try {
            const res = await apiFetch(`/comercial/clientes/${id}`);
            const c = await res.json();

            document.getElementById('cliente-id').value = c.id;
            document.getElementById('cliente-tipo-pessoa').value = c.tipo_pessoa;
            document.getElementById('cliente-situacao').value = c.situacao;
            document.getElementById('cliente-nome').value = c.nome_razao_social;
            document.getElementById('cliente-documento').value = c.cpf_cnpj || '';
            document.getElementById('cliente-rg-ie').value = c.rg || c.inscricao_estadual || '';
            document.getElementById('cliente-email').value = c.email || '';
            document.getElementById('cliente-whatsapp').value = c.whatsapp || '';
            
            document.getElementById('cliente-cep').value = c.cep || '';
            document.getElementById('cliente-endereco').value = c.endereco || '';
            document.getElementById('cliente-numero').value = c.numero || '';
            document.getElementById('cliente-bairro').value = c.bairro || '';
            document.getElementById('cliente-complemento').value = c.complemento || '';
            document.getElementById('cliente-cidade').value = c.cidade || '';
            document.getElementById('cliente-uf').value = c.uf || '';

            document.getElementById('cliente-representante').value = c.representante_id || '';
            document.getElementById('cliente-vendedor-interno').value = c.nome_vendedor_interno || '';
            document.getElementById('cliente-forma-pgto').value = c.forma_pagamento_id || '';
            document.getElementById('cliente-condicao-pgto').value = c.condicao_pagamento || 'A_VISTA';
            document.getElementById('cliente-obs').value = c.observacoes || '';

            document.getElementById('modal-cliente-title').innerText = 'Editar Cliente';
            this.toggleDocumentLabels();
            this.switchTab('tab-cliente-dados');
            openModal('modal-cliente');
        } catch (e) { console.error(e); }
    },

    async save(e) {
        e.preventDefault();
        const id = document.getElementById('cliente-id').value;
        const payload = {
            tipo_pessoa: document.getElementById('cliente-tipo-pessoa').value,
            situacao: document.getElementById('cliente-situacao').value,
            nome_razao_social: document.getElementById('cliente-nome').value,
            cpf_cnpj: document.getElementById('cliente-documento').value,
            email: document.getElementById('cliente-email').value,
            whatsapp: document.getElementById('cliente-whatsapp').value,
            cep: document.getElementById('cliente-cep').value,
            endereco: document.getElementById('cliente-endereco').value,
            numero: document.getElementById('cliente-numero').value,
            bairro: document.getElementById('cliente-bairro').value,
            complemento: document.getElementById('cliente-complemento').value,
            cidade: document.getElementById('cliente-cidade').value,
            uf: document.getElementById('cliente-uf').value,
            representante_id: document.getElementById('cliente-representante').value ? parseInt(document.getElementById('cliente-representante').value) : null,
            nome_vendedor_interno: document.getElementById('cliente-vendedor-interno').value,
            forma_pagamento_id: document.getElementById('cliente-forma-pgto').value ? parseInt(document.getElementById('cliente-forma-pgto').value) : null,
            condicao_pagamento: document.getElementById('cliente-condicao-pgto').value,
            observacoes: document.getElementById('cliente-obs').value
        };

        // Adicionar campos extras baseados no tipo
        if (payload.tipo_pessoa === 'JURIDICA') {
            payload.inscricao_estadual = document.getElementById('cliente-rg-ie').value;
        } else {
            payload.rg = document.getElementById('cliente-rg-ie').value;
        }

        try {
            const url = id ? `/comercial/clientes/${id}` : '/comercial/clientes';
            const method = id ? 'PUT' : 'POST';
            const res = await apiFetch(url, {
                method: method,
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                showNotify(id ? "Cliente atualizado!" : "Cliente cadastrado!", "success");
                closeModal('modal-cliente');
                this.refresh();
            } else {
                const err = await res.json();
                showNotify(err.detail || "Erro ao salvar cliente", "error");
            }
        } catch (e) { console.error(e); }
    },

    async delete(id) {
        if (!confirm("Deseja realmente excluir este cliente?")) return;
        try {
            const res = await apiFetch(`/comercial/clientes/${id}`, { method: 'DELETE' });
            if (res.ok) {
                showNotify("Cliente excluído", "success");
                this.refresh();
            }
        } catch (e) { console.error(e); }
    },

    async lookupCEP() {
        const cep = document.getElementById('cliente-cep').value;
        if (!cep || cep.length < 8) return;
        try {
            const res = await apiFetch(`/comercial/cep/${cep}`);
            if (res.ok) {
                const data = await res.json();
                document.getElementById('cliente-endereco').value = data.logradouro || '';
                document.getElementById('cliente-bairro').value = data.bairro || '';
                document.getElementById('cliente-cidade').value = data.cidade || '';
                document.getElementById('cliente-uf').value = data.uf || '';
                document.getElementById('cliente-numero').focus();
            }
        } catch (e) { console.error(e); }
    },

    async lookupDocumento() {
        const doc = document.getElementById('cliente-documento').value.replace(/\D/g, '');
        const tipo = document.getElementById('cliente-tipo-pessoa').value;
        if (!doc) return;

        try {
            const endpoint = tipo === 'JURIDICA' ? `/comercial/cnpj/${doc}` : `/comercial/cpf/${doc}`;
            const res = await apiFetch(endpoint);
            if (res.ok) {
                const data = await res.json();
                if (tipo === 'JURIDICA') {
                    document.getElementById('cliente-nome').value = data.razao_social || data.nome || '';
                    if (data.cep) {
                        document.getElementById('cliente-cep').value = data.cep;
                        this.lookupCEP();
                    }
                } else {
                    document.getElementById('cliente-nome').value = data.nome || '';
                }
                showNotify("Dados recuperados com sucesso", "info");
            }
        } catch (e) { console.error(e); }
    }
};
