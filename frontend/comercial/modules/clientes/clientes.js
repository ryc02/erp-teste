window.Modulo_clientes = {
    clientes: [],
    representantes: [],
    formasPagamento: [],
    condicoesPagamento: [],
    searchTimer: null,
    cepLookupState: {
        principal: null,
        cobranca: null,
        entrega: null
    },

    async init() {
        console.log("Modulo de clientes comercial inicializado");
        this.bindEvents();
        await this.loadSupportData();
        await this.loadClientes();
    },

    async destroy() {
        if (this.searchTimer) {
            window.clearTimeout(this.searchTimer);
            this.searchTimer = null;
        }
    },

    refresh() {
        return this.loadClientes();
    },

    bindEvents() {
        const searchInput = document.getElementById('clientes-search');
        const situacaoFilter = document.getElementById('clientes-filter-situacao');
        const tipoFilter = document.getElementById('clientes-filter-tipo');
        const refreshButton = document.getElementById('btn-clientes-refresh');
        const tipoPessoa = document.getElementById('cliente-tipo-pessoa');
        const cepPrincipal = document.getElementById('cliente-cep');
        const cepCobranca = document.getElementById('cliente-cep-cobranca');
        const cepEntrega = document.getElementById('cliente-cep-entrega');
        const consultarRfbButton = document.getElementById('btn-consultar-rfb');

        if (searchInput && searchInput.dataset.bound !== 'true') {
            searchInput.dataset.bound = 'true';
            searchInput.addEventListener('input', () => {
                if (this.searchTimer) {
                    window.clearTimeout(this.searchTimer);
                }

                this.searchTimer = window.setTimeout(() => {
                    this.loadClientes();
                }, 250);
            });
        }

        [situacaoFilter, tipoFilter].forEach((element) => {
            if (element && element.dataset.bound !== 'true') {
                element.dataset.bound = 'true';
                element.addEventListener('change', () => this.loadClientes());
            }
        });

        if (refreshButton && refreshButton.dataset.bound !== 'true') {
            refreshButton.dataset.bound = 'true';
            refreshButton.addEventListener('click', () => this.loadClientes());
        }

        if (tipoPessoa && tipoPessoa.dataset.boundRfb !== 'true') {
            tipoPessoa.dataset.boundRfb = 'true';
            tipoPessoa.addEventListener('change', () => {
                this.syncTipoPessoaState();
                this.syncRfbButtonState();
            });
        }

        if (consultarRfbButton && consultarRfbButton.dataset.bound !== 'true') {
            consultarRfbButton.dataset.bound = 'true';
            consultarRfbButton.dataset.originalLabel = consultarRfbButton.innerHTML;
            consultarRfbButton.addEventListener('click', () => this.lookupRfb());
        }

        this.bindCepLookup(cepPrincipal, 'principal');
        this.bindCepLookup(cepCobranca, 'cobranca');
        this.bindCepLookup(cepEntrega, 'entrega');
        this.syncTipoPessoaState();
        this.syncRfbButtonState();
    },

    async loadSupportData() {
        try {
            await Promise.all([
                this.loadRepresentantes(),
                this.loadFormasPagamento(),
                this.loadCondicoesPagamento()
            ]);
        } catch (error) {
            console.error(error);
            showNotify('Não foi possível carregar os cadastros auxiliares do comercial.', 'warning');
        }
    },

    async loadRepresentantes() {
        const res = await apiFetch('/comercial/representantes?include_inativos=true');
        if (!res.ok) {
            throw new Error(`Falha ao carregar representantes (${res.status})`);
        }
        this.representantes = await res.json();
    },

    async loadFormasPagamento() {
        const res = await apiFetch('/comercial/formas-pagamento');
        if (!res.ok) {
            throw new Error(`Falha ao carregar formas de pagamento (${res.status})`);
        }
        this.formasPagamento = await res.json();
    },

    async loadCondicoesPagamento() {
        const res = await apiFetch('/comercial/condicoes-pagamento');
        if (!res.ok) {
            throw new Error(`Falha ao carregar condições de pagamento (${res.status})`);
        }
        this.condicoesPagamento = await res.json();
    },

    bindCepLookup(input, mode) {
        if (!input || input.dataset.boundCep === 'true') return;

        input.dataset.boundCep = 'true';
        input.addEventListener('input', () => {
            const digits = this.normalizeCep(input.value);
            input.value = this.formatCep(digits);

            if (digits.length !== 8) {
                input.dataset.lastLookupCep = '';
                return;
            }

            if (input.dataset.lastLookupCep === digits) {
                return;
            }

            this.lookupCep(digits, mode, input);
        });

        input.addEventListener('blur', () => {
            const digits = this.normalizeCep(input.value);
            input.value = this.formatCep(digits);

            if (digits.length === 8 && input.dataset.lastLookupCep !== digits) {
                this.lookupCep(digits, mode, input);
            }
        });
    },

    normalizeCep(value) {
        return String(value || '').replace(/\D/g, '').slice(0, 8);
    },

    formatCep(value) {
        const digits = this.normalizeCep(value);
        if (digits.length <= 5) return digits;
        return `${digits.slice(0, 5)}-${digits.slice(5)}`;
    },

    normalizeDocument(value) {
        return String(value || '').replace(/\D/g, '');
    },

    formatCpfCnpj(value) {
        const digits = this.normalizeDocument(value).slice(0, 14);

        if (digits.length <= 11) {
            if (digits.length <= 3) return digits;
            if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
            if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
            return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
        }

        if (digits.length <= 2) return digits;
        if (digits.length <= 5) return `${digits.slice(0, 2)}.${digits.slice(2)}`;
        if (digits.length <= 8) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`;
        if (digits.length <= 12) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8)}`;
        return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12)}`;
    },

    async lookupCep(cep, mode, input) {
        if (this.cepLookupState[mode] === cep) {
            return;
        }

        this.cepLookupState[mode] = cep;
        input.dataset.lastLookupCep = cep;

        try {
            const res = await apiFetch(`/comercial/cep/${cep}`);
            if (!res.ok) {
                const error = await res.json().catch(() => ({}));
                throw new Error(error.detail || 'Falha ao consultar CEP.');
            }

            const data = await res.json();
            this.applyCepResult(data, mode);
        } catch (error) {
            console.error(error);
            input.dataset.lastLookupCep = '';
            showNotify(error.message || 'Não foi possível consultar o CEP.', 'warning');
        } finally {
            this.cepLookupState[mode] = null;
        }
    },

    applyCepResult(data, mode) {
        const suffixMap = {
            principal: '',
            cobranca: '-cobranca',
            entrega: '-entrega'
        };
        const cityFieldMap = {
            principal: 'cliente-cidade',
            cobranca: 'cliente-municipio-cobranca',
            entrega: 'cliente-cidade-entrega'
        };
        const suffix = suffixMap[mode] ?? '';
        const enderecoInput = document.getElementById(`cliente-endereco${suffix}`);
        const bairroInput = document.getElementById(`cliente-bairro${suffix}`);
        const cidadeInput = document.getElementById(cityFieldMap[mode] || `cliente-cidade${suffix}`);
        const ufInput = document.getElementById(`cliente-uf${suffix}`);
        const cepInput = document.getElementById(`cliente-cep${suffix}`);

        if (cepInput && data.cep) cepInput.value = this.formatCep(data.cep);
        if (enderecoInput) enderecoInput.value = data.logradouro || '';
        if (bairroInput) bairroInput.value = data.bairro || '';
        if (cidadeInput) cidadeInput.value = data.cidade || '';
        if (ufInput) ufInput.value = data.uf || '';
    },

    syncRfbButtonState() {
        const tipoPessoa = document.getElementById('cliente-tipo-pessoa');
        const consultarRfbButton = document.getElementById('btn-consultar-rfb');
        if (!tipoPessoa || !consultarRfbButton) return;

        const isJuridica = tipoPessoa.value === 'JURIDICA';
        consultarRfbButton.disabled = !isJuridica;
        consultarRfbButton.innerHTML = isJuridica
            ? (consultarRfbButton.dataset.originalLabel || 'Consultar Dados R.F.B.')
            : '<i class="ph ph-pencil-simple"></i> Cadastro Manual';
        consultarRfbButton.title = isJuridica
            ? 'Consultar dados cadastrais do CNPJ'
            : 'Pessoa física é cadastrada manualmente.';
    },

    syncTipoPessoaState() {
        const tipoPessoa = document.getElementById('cliente-tipo-pessoa');
        const rgGroup = document.getElementById('group-cliente-rg');
        const inscricaoGroup = document.getElementById('group-cliente-inscricao-estadual');
        const nomeFantasiaInput = document.getElementById('cliente-nome-fantasia');

        if (!tipoPessoa) return;

        const isJuridica = tipoPessoa.value === 'JURIDICA';
        if (rgGroup) rgGroup.style.display = isJuridica ? 'none' : '';
        if (inscricaoGroup) inscricaoGroup.style.display = isJuridica ? '' : 'none';
        if (nomeFantasiaInput) {
            nomeFantasiaInput.placeholder = isJuridica ? '' : 'Opcional para pessoa física';
        }
    },

    async lookupRfb() {
        const tipoPessoa = document.getElementById('cliente-tipo-pessoa');
        const documentoInput = document.getElementById('cliente-cpf-cnpj');
        const consultarRfbButton = document.getElementById('btn-consultar-rfb');

        if (!tipoPessoa || !documentoInput || !consultarRfbButton) return;

        const isJuridica = tipoPessoa.value === 'JURIDICA';
        if (!isJuridica) {
            showNotify('Pessoa física é cadastrada manualmente.', 'info');
            return;
        }

        const documentDigits = this.normalizeDocument(documentoInput.value);
        const expectedLength = 14;

        if (documentDigits.length !== expectedLength) {
            showNotify(
                'Informe um CNPJ com 14 dígitos para consultar a R.F.B.',
                'warning'
            );
            switchTab('tab-cliente-geral');
            documentoInput.focus();
            return;
        }

        consultarRfbButton.disabled = true;
        consultarRfbButton.innerHTML = '<i class="ph ph-spinner-gap"></i> Consultando...';

        try {
            const res = await apiFetch(`/comercial/cnpj/${documentDigits}`);
            if (!res.ok) {
                const error = await res.json().catch(() => ({}));
                throw new Error(error.detail || 'Falha ao consultar dados na R.F.B.');
            }

            const data = await res.json();
            this.applyCnpjResult(data);
            showNotify(`Dados do CNPJ preenchidos com sucesso${data.fonte ? ` via ${data.fonte}` : ''}.`, 'success');
        } catch (error) {
            console.error(error);
            showNotify(error.message || 'Não foi possível consultar os dados na R.F.B.', 'error');
        } finally {
            consultarRfbButton.innerHTML = consultarRfbButton.dataset.originalLabel || 'Consultar Dados R.F.B.';
            this.syncRfbButtonState();
        }
    },

    applyCnpjResult(data) {
        const values = {
            'cliente-tipo-pessoa': 'JURIDICA',
            'cliente-cpf-cnpj': data.cnpj ? this.formatCpfCnpj(data.cnpj) : null,
            'cliente-nome-razao': data.razao_social,
            'cliente-nome-fantasia': data.nome_fantasia,
            'cliente-email': data.email,
            'cliente-telefone': data.telefone,
            'cliente-cep': data.cep ? this.formatCep(data.cep) : null,
            'cliente-endereco': data.endereco,
            'cliente-numero': data.numero,
            'cliente-complemento': data.complemento,
            'cliente-bairro': data.bairro,
            'cliente-cidade': data.cidade,
            'cliente-uf': data.uf
        };

        Object.entries(values).forEach(([fieldId, value]) => {
            if (value === null || value === undefined || value === '') return;

            const field = document.getElementById(fieldId);
            if (field) field.value = value;
        });

        const cepInput = document.getElementById('cliente-cep');
        if (cepInput && data.cep) {
            cepInput.dataset.lastLookupCep = this.normalizeCep(data.cep);
        }

        this.syncTipoPessoaState();
        this.syncRfbButtonState();
    },

    getFilters() {
        return {
            search: String(document.getElementById('clientes-search')?.value || '').trim(),
            situacao: String(document.getElementById('clientes-filter-situacao')?.value || '').trim(),
            tipo_pessoa: String(document.getElementById('clientes-filter-tipo')?.value || '').trim()
        };
    },

    async loadClientes() {
        const tbody = document.querySelector('#table-clientes tbody');
        const filters = this.getFilters();
        const params = new URLSearchParams({ limit: '300' });

        if (filters.search) params.set('search', filters.search);
        if (filters.situacao) params.set('situacao', filters.situacao);
        if (filters.tipo_pessoa) params.set('tipo_pessoa', filters.tipo_pessoa);

        if (tbody) {
            tbody.innerHTML = '<tr><td colspan="8" style="text-align:center">Consultando clientes...</td></tr>';
        }

        try {
            const res = await apiFetch(`/comercial/clientes?${params.toString()}`);
            if (!res.ok) {
                throw new Error(`Falha ao carregar clientes (${res.status})`);
            }

            this.clientes = await res.json();
            this.renderStats();
            this.renderTable();
        } catch (error) {
            console.error(error);
            if (tbody) {
                tbody.innerHTML = '<tr><td colspan="8" style="text-align:center">Não foi possível carregar os clientes.</td></tr>';
            }
        }
    },

    renderStats() {
        const total = this.clientes.length;
        const ativos = this.clientes.filter(cliente => cliente.situacao === 'ATIVO').length;
        const juridicas = this.clientes.filter(cliente => cliente.tipo_pessoa === 'JURIDICA').length;
        const fisicas = this.clientes.filter(cliente => cliente.tipo_pessoa === 'FISICA').length;

        const totalElement = document.getElementById('stat-clientes-total');
        const ativosElement = document.getElementById('stat-clientes-ativos');
        const juridicasElement = document.getElementById('stat-clientes-pj');
        const fisicasElement = document.getElementById('stat-clientes-pf');

        if (totalElement) totalElement.innerText = String(total);
        if (ativosElement) ativosElement.innerText = String(ativos);
        if (juridicasElement) juridicasElement.innerText = String(juridicas);
        if (fisicasElement) fisicasElement.innerText = String(fisicas);
    },

    renderTable() {
        const tbody = document.querySelector('#table-clientes tbody');
        if (!tbody) return;

        if (!this.clientes.length) {
            tbody.innerHTML = '<tr><td colspan="8" style="text-align:center">Nenhum cliente encontrado.</td></tr>';
            return;
        }

        tbody.innerHTML = this.clientes.map((cliente) => `
            <tr>
                <td>
                    <div style="font-weight: 600;">${cliente.nome_razao_social}</div>
                    <div style="font-size: 0.85rem; color: var(--text-secondary);">${cliente.email || 'Sem e-mail'}</div>
                </td>
                <td>${cliente.nome_fantasia || '-'}</td>
                <td>${cliente.tipo_pessoa === 'JURIDICA' ? 'Jurídica' : 'Física'}</td>
                <td>${cliente.cpf_cnpj ? this.formatCpfCnpj(cliente.cpf_cnpj) : '-'}</td>
                <td>${this.formatCidadeUf(cliente)}</td>
                <td>${cliente.whatsapp || cliente.telefone || '-'}</td>
                <td><span class="badge ${cliente.situacao === 'ATIVO' ? 'badge-success' : 'badge-warning'}">${cliente.situacao === 'ATIVO' ? 'Ativo' : 'Inativo'}</span></td>
                <td>
                    <div style="display:flex; gap:8px; justify-content:flex-end; flex-wrap:wrap;">
                        <button class="btn btn-outline" onclick="Modulo_clientes.editClient(${cliente.id})" title="Editar Cliente">
                            <i class="ph ph-pencil"></i>
                        </button>
                        <button class="btn btn-outline" onclick="Modulo_clientes.toggleClientStatus(${cliente.id})" title="${cliente.situacao === 'ATIVO' ? 'Inativar Cliente' : 'Reativar Cliente'}">
                            <i class="ph ${cliente.situacao === 'ATIVO' ? 'ph-toggle-left' : 'ph-toggle-right'}"></i>
                        </button>
                        <button class="btn btn-outline" onclick="Modulo_clientes.deleteClient(${cliente.id})" title="Excluir Cliente" style="color: var(--danger);">
                            <i class="ph ph-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    },

    formatCidadeUf(cliente) {
        const cidade = cliente.cidade || '';
        const uf = cliente.uf || '';
        if (cidade && uf) return `${cidade} / ${uf}`;
        return cidade || uf || '-';
    },

    getRepresentanteById(id) {
        return this.representantes.find(item => item.id === Number(id)) || null;
    },

    getFormaPagamentoById(id) {
        return this.formasPagamento.find(item => item.id === Number(id)) || null;
    },

    getCondicaoPagamentoById(id) {
        return this.condicoesPagamento.find(item => item.id === Number(id)) || null;
    },

    getDirectRepresentative() {
        return this.representantes.find(item => item.codigo === 1) || null;
    },

    applySelectedRepresentante(representante) {
        document.getElementById('cliente-representante-id').value = representante ? String(representante.id) : '';
        document.getElementById('cliente-representante-codigo').value = representante ? String(representante.codigo) : '';
        document.getElementById('cliente-representante-nome').value = representante ? representante.nome : '';
    },

    applySelectedFormaPagamento(formaPagamento) {
        document.getElementById('cliente-forma-pagamento-id').value = formaPagamento ? String(formaPagamento.id) : '';
        document.getElementById('cliente-forma-pagamento-codigo').value = formaPagamento ? String(formaPagamento.codigo) : '';
        document.getElementById('cliente-forma-pagamento-descricao').value = formaPagamento ? formaPagamento.descricao : '';
    },

    applySelectedCondicaoPagamento(condicaoPagamento) {
        document.getElementById('cliente-condicao-pagamento-id').value = condicaoPagamento ? String(condicaoPagamento.id) : '';
        document.getElementById('cliente-condicao-pagamento-codigo').value = condicaoPagamento ? String(condicaoPagamento.codigo) : '';
        document.getElementById('cliente-condicao-pagamento-descricao').value = condicaoPagamento ? condicaoPagamento.descricao : '';
        document.getElementById('cliente-condicao-pagamento-resumo').value = condicaoPagamento
            ? this.formatCondicaoResumo(condicaoPagamento)
            : '';
    },

    formatBaseCalculo(base) {
        const labels = {
            DATA_DO_DIA: 'Data do Dia',
            DATA_EMISSAO: 'Data de Emissão',
            DATA_FATURAMENTO: 'Data de Faturamento'
        };
        return labels[base] || base || '-';
    },

    formatCondicaoResumo(condicaoPagamento) {
        const parcelas = Array.isArray(condicaoPagamento.parcelas) ? condicaoPagamento.parcelas : [];
        if (!parcelas.length) {
            return `${condicaoPagamento.descricao} | Base: ${this.formatBaseCalculo(condicaoPagamento.base_calculo)}`;
        }

        const resumoParcelas = parcelas.map((parcela) => {
            if (parcela.data_fixa) {
                return `${parcela.numero}a: ${parcela.data_fixa}`;
            }
            return `${parcela.numero}a: ${parcela.dias ?? 0} dia(s)`;
        }).join(' | ');

        return `${condicaoPagamento.descricao} | Base: ${this.formatBaseCalculo(condicaoPagamento.base_calculo)} | ${resumoParcelas}`;
    },

    clearCommercialSelections() {
        this.applySelectedFormaPagamento(null);
        this.applySelectedCondicaoPagamento(null);
        this.applySelectedRepresentante(this.getDirectRepresentative());
        document.getElementById('cliente-nome-vendedor-interno').value = '';
    },

    prepareNewClient() {
        const form = document.getElementById('form-cliente');
        if (!form) return;

        form.reset();
        document.getElementById('cliente-id').value = '';
        document.getElementById('cliente-modal-title').innerText = 'Novo Cliente';
        document.getElementById('cliente-situacao').value = 'ATIVO';
        document.getElementById('cliente-tipo-pessoa').value = 'JURIDICA';
        ['cliente-cep', 'cliente-cep-cobranca', 'cliente-cep-entrega'].forEach((fieldId) => {
            const input = document.getElementById(fieldId);
            if (input) input.dataset.lastLookupCep = '';
        });

        this.clearCommercialSelections();
        document.getElementById('cliente-rg').value = '';
        document.getElementById('cliente-inscricao-estadual').value = '';
        this.syncTipoPessoaState();
        this.syncRfbButtonState();
        openModal('modal-cliente');
        switchTab('tab-cliente-geral');
    },

    editClient(clienteId) {
        const cliente = this.clientes.find(item => item.id === clienteId);
        if (!cliente) return;

        document.getElementById('cliente-id').value = String(cliente.id);
        document.getElementById('cliente-modal-title').innerText = 'Editar Cliente';
        document.getElementById('cliente-situacao').value = cliente.situacao || 'ATIVO';
        document.getElementById('cliente-tipo-pessoa').value = cliente.tipo_pessoa || 'JURIDICA';
        document.getElementById('cliente-nome-razao').value = cliente.nome_razao_social || '';
        document.getElementById('cliente-nome-fantasia').value = cliente.nome_fantasia || '';
        document.getElementById('cliente-cpf-cnpj').value = this.formatCpfCnpj(cliente.cpf_cnpj || '');
        document.getElementById('cliente-rg').value = cliente.rg || '';
        document.getElementById('cliente-inscricao-estadual').value = cliente.inscricao_estadual || '';
        document.getElementById('cliente-telefone').value = cliente.telefone || '';
        document.getElementById('cliente-whatsapp').value = cliente.whatsapp || '';
        document.getElementById('cliente-email').value = cliente.email || '';
        document.getElementById('cliente-cep').value = this.formatCep(cliente.cep || '');
        document.getElementById('cliente-endereco').value = cliente.endereco || '';
        document.getElementById('cliente-numero').value = cliente.numero || '';
        document.getElementById('cliente-complemento').value = cliente.complemento || '';
        document.getElementById('cliente-bairro').value = cliente.bairro || '';
        document.getElementById('cliente-cidade').value = cliente.cidade || '';
        document.getElementById('cliente-uf').value = cliente.uf || '';

        document.getElementById('cliente-cep-cobranca').value = this.formatCep(cliente.cep_cobranca || '');
        document.getElementById('cliente-endereco-cobranca').value = cliente.endereco_cobranca || '';
        document.getElementById('cliente-numero-cobranca').value = cliente.numero_cobranca || '';
        document.getElementById('cliente-complemento-cobranca').value = cliente.complemento_cobranca || '';
        document.getElementById('cliente-bairro-cobranca').value = cliente.bairro_cobranca || '';
        document.getElementById('cliente-uf-cobranca').value = cliente.uf_cobranca || '';
        document.getElementById('cliente-municipio-cobranca').value = cliente.municipio_cobranca || '';
        document.getElementById('cliente-cnpj-cobranca').value = this.formatCpfCnpj(cliente.cnpj_cobranca || '');
        document.getElementById('cliente-inscricao-estadual-cobranca').value = cliente.inscricao_estadual_cobranca || '';
        document.getElementById('cliente-email-cobranca').value = cliente.email_cobranca || '';

        document.getElementById('cliente-cep-entrega').value = this.formatCep(cliente.cep_entrega || '');
        document.getElementById('cliente-endereco-entrega').value = cliente.endereco_entrega || '';
        document.getElementById('cliente-numero-entrega').value = cliente.numero_entrega || '';
        document.getElementById('cliente-complemento-entrega').value = cliente.complemento_entrega || '';
        document.getElementById('cliente-bairro-entrega').value = cliente.bairro_entrega || '';
        document.getElementById('cliente-cidade-entrega').value = cliente.cidade_entrega || '';
        document.getElementById('cliente-uf-entrega').value = cliente.uf_entrega || '';

        document.getElementById('cliente-prazo-entrega').value = cliente.prazo_entrega_padrao_dias || '';
        document.getElementById('cliente-observacoes').value = cliente.observacoes || '';
        document.getElementById('cliente-nome-vendedor-interno').value = cliente.nome_vendedor_interno || '';

        ['cliente-cep', 'cliente-cep-cobranca', 'cliente-cep-entrega'].forEach((fieldId) => {
            const input = document.getElementById(fieldId);
            if (input) input.dataset.lastLookupCep = '';
        });

        this.applySelectedRepresentante(this.getRepresentanteById(cliente.representante_id) || null);
        this.applySelectedFormaPagamento(this.getFormaPagamentoById(cliente.forma_pagamento_id) || null);
        this.applySelectedCondicaoPagamento(this.getCondicaoPagamentoById(cliente.condicao_pagamento_id) || null);

        if (!cliente.representante_id) {
            this.applySelectedRepresentante(this.getDirectRepresentative());
        }

        this.syncTipoPessoaState();
        this.syncRfbButtonState();
        openModal('modal-cliente');
        switchTab('tab-cliente-geral');
    },

    async toggleClientStatus(clienteId) {
        const cliente = this.clientes.find(item => item.id === clienteId);
        if (!cliente) return;

        const ativar = cliente.situacao !== 'ATIVO';
        const novoStatus = ativar ? 'ATIVO' : 'INATIVO';
        const confirmed = await confirmAction(
            ativar ? 'Reativar cliente?' : 'Inativar cliente?',
            `Deseja ${ativar ? 'reativar' : 'inativar'} o cliente ${cliente.nome_razao_social}?`,
            {
                confirmText: ativar ? 'Reativar' : 'Inativar',
                color: ativar ? 'var(--success)' : 'var(--warning)',
                icon: ativar ? 'ph ph-check-circle' : 'ph ph-pause-circle'
            }
        );

        if (!confirmed) return;

        try {
            const res = await apiFetch(`/comercial/clientes/${cliente.id}`, {
                method: 'PUT',
                body: JSON.stringify({ situacao: novoStatus })
            });
            const data = await res.json().catch(() => ({}));

            if (!res.ok) {
                showNotify(data.detail || 'Não foi possível atualizar a situação do cliente.', 'error');
                return;
            }

            showNotify(`Cliente ${ativar ? 'reativado' : 'inativado'} com sucesso.`, 'success');
            await this.loadClientes();
        } catch (error) {
            console.error(error);
            showNotify('Falha ao atualizar a situação do cliente.', 'error');
        }
    },

    async deleteClient(clienteId) {
        const cliente = this.clientes.find(item => item.id === clienteId);
        if (!cliente) return;

        const confirmed = await confirmAction(
            'Excluir cliente?',
            (
                `Deseja excluir o cliente ${cliente.nome_razao_social}? `
                + 'Essa ação é definitiva e só é permitida quando não há vínculos.'
            ),
            {
                confirmText: 'Excluir',
                color: 'var(--danger)',
                icon: 'ph ph-trash'
            }
        );

        if (!confirmed) return;

        try {
            const res = await apiFetch(`/comercial/clientes/${cliente.id}`, {
                method: 'DELETE'
            });
            const data = await res.json().catch(() => ({}));

            if (!res.ok) {
                showNotify(data.detail || 'Não foi possível excluir o cliente.', 'error');
                return;
            }

            const modalCliente = document.getElementById('modal-cliente');
            const clienteEmEdicao = document.getElementById('cliente-id')?.value;
            if (modalCliente?.classList.contains('active') && clienteEmEdicao === String(cliente.id)) {
                closeModal('modal-cliente');
            }

            showNotify('Cliente excluído com sucesso.', 'success');
            await this.loadClientes();
        } catch (error) {
            console.error(error);
            showNotify('Falha ao excluir o cliente.', 'error');
        }
    },

    buildPayload(form) {
        const formData = new FormData(form);
        const payload = Object.fromEntries(formData.entries());
        const optionalFields = [
            'nome_fantasia',
            'cpf_cnpj',
            'rg',
            'inscricao_estadual',
            'telefone',
            'whatsapp',
            'email',
            'cep',
            'endereco',
            'numero',
            'complemento',
            'bairro',
            'cidade',
            'uf',
            'representante_id',
            'nome_vendedor_interno',
            'forma_pagamento_id',
            'condicao_pagamento_id',
            'cep_cobranca',
            'endereco_cobranca',
            'numero_cobranca',
            'complemento_cobranca',
            'bairro_cobranca',
            'uf_cobranca',
            'municipio_cobranca',
            'cnpj_cobranca',
            'inscricao_estadual_cobranca',
            'email_cobranca',
            'cep_entrega',
            'endereco_entrega',
            'numero_entrega',
            'complemento_entrega',
            'bairro_entrega',
            'cidade_entrega',
            'uf_entrega',
            'observacoes'
        ];

        optionalFields.forEach((field) => {
            if (payload[field] === '') {
                payload[field] = null;
            }
        });

        ['representante_id', 'forma_pagamento_id', 'condicao_pagamento_id', 'prazo_entrega_padrao_dias'].forEach((field) => {
            if (!(field in payload) || payload[field] === '' || payload[field] === null) {
                payload[field] = null;
                return;
            }
            payload[field] = Number(payload[field]);
        });

        return payload;
    },

    async saveClient(event) {
        event.preventDefault();

        const form = document.getElementById('form-cliente');
        const clienteId = document.getElementById('cliente-id').value;
        if (!form) return;

        const payload = this.buildPayload(form);

        try {
            const url = clienteId ? `/comercial/clientes/${clienteId}` : '/comercial/clientes';
            const method = clienteId ? 'PUT' : 'POST';
            const res = await apiFetch(url, {
                method,
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                const error = await res.json().catch(() => ({}));
                showNotify(error.detail || 'Erro ao salvar cliente.', 'error');
                return;
            }

            showNotify(clienteId ? 'Cliente atualizado com sucesso!' : 'Cliente criado com sucesso!', 'success');
            closeModal('modal-cliente');
            await this.loadClientes();
        } catch (error) {
            console.error(error);
            showNotify('Falha ao salvar cliente.', 'error');
        }
    },

    filterBySearch(items, search, fields) {
        const termo = String(search || '').trim().toLowerCase();
        if (!termo) return items;

        return items.filter((item) => fields.some((field) => String(item[field] ?? '').toLowerCase().includes(termo)));
    },

    async openRepresentanteModal() {
        if (!this.representantes.length) {
            await this.loadRepresentantes();
        }
        this.renderRepresentantesModal();
        this.resetRepresentanteForm();
        openModal('modal-representante');
    },

    renderRepresentantesModal() {
        const search = document.getElementById('representante-search')?.value || '';
        const tbody = document.querySelector('#table-representantes-modal tbody');
        if (!tbody) return;

        const itens = this.filterBySearch(this.representantes, search, ['codigo', 'nome']);
        if (!itens.length) {
            tbody.innerHTML = '<tr><td colspan="4" style="text-align:center">Nenhum representante encontrado.</td></tr>';
            return;
        }

        tbody.innerHTML = itens.map((item) => `
            <tr>
                <td>${item.codigo}</td>
                <td>${item.nome}</td>
                <td>${item.ativo ? 'Ativo' : 'Inativo'}</td>
                <td style="display:flex; gap:8px;">
                    <button class="btn btn-outline" type="button" onclick="Modulo_clientes.fillRepresentanteForm(${item.id})">
                        <i class="ph ph-pencil"></i>
                    </button>
                    <button class="btn btn-primary" type="button" onclick="Modulo_clientes.useRepresentante(${item.id})">Usar</button>
                </td>
            </tr>
        `).join('');
    },

    resetRepresentanteForm() {
        document.getElementById('representante-form-id').value = '';
        document.getElementById('representante-form-codigo').value = '';
        document.getElementById('representante-form-nome').value = '';
        document.getElementById('representante-form-ativo').value = 'true';
    },

    fillRepresentanteForm(id) {
        const item = this.getRepresentanteById(id);
        if (!item) return;

        document.getElementById('representante-form-id').value = String(item.id);
        document.getElementById('representante-form-codigo').value = String(item.codigo);
        document.getElementById('representante-form-nome').value = item.nome || '';
        document.getElementById('representante-form-ativo').value = item.ativo ? 'true' : 'false';
    },

    async saveRepresentante() {
        const id = document.getElementById('representante-form-id').value;
        const payload = {
            codigo: Number(document.getElementById('representante-form-codigo').value || 0),
            nome: document.getElementById('representante-form-nome').value,
            ativo: document.getElementById('representante-form-ativo').value === 'true'
        };

        try {
            const url = id ? `/comercial/representantes/${id}` : '/comercial/representantes';
            const method = id ? 'PUT' : 'POST';
            const res = await apiFetch(url, {
                method,
                body: JSON.stringify(payload)
            });

            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                showNotify(data.detail || 'Erro ao salvar representante.', 'error');
                return;
            }

            await this.loadRepresentantes();
            this.renderRepresentantesModal();
            this.fillRepresentanteForm(data.id);
            this.applySelectedRepresentante(this.getRepresentanteById(data.id));
            showNotify('Representante salvo com sucesso.', 'success');
            closeModal('modal-representante');
        } catch (error) {
            console.error(error);
            showNotify('Falha ao salvar representante.', 'error');
        }
    },

    useRepresentante(id) {
        const item = this.getRepresentanteById(id);
        if (!item) return;

        this.applySelectedRepresentante(item);
        closeModal('modal-representante');
    },

    selectRepresentanteFromForm() {
        const id = Number(document.getElementById('representante-form-id').value || 0);
        if (!id) {
            showNotify('Salve ou selecione um representante antes de usar no cliente.', 'warning');
            return;
        }
        this.useRepresentante(id);
    },

    async openFormaPagamentoModal() {
        if (!this.formasPagamento.length) {
            await this.loadFormasPagamento();
        }
        this.renderFormasPagamentoModal();
        this.resetFormaPagamentoForm();
        openModal('modal-forma-pagamento');
    },

    renderFormasPagamentoModal() {
        const search = document.getElementById('forma-pagamento-search')?.value || '';
        const tbody = document.querySelector('#table-formas-pagamento-modal tbody');
        if (!tbody) return;

        const itens = this.filterBySearch(this.formasPagamento, search, ['codigo', 'descricao']);
        if (!itens.length) {
            tbody.innerHTML = '<tr><td colspan="4" style="text-align:center">Nenhuma forma de pagamento encontrada.</td></tr>';
            return;
        }

        tbody.innerHTML = itens.map((item) => `
            <tr>
                <td>${item.codigo}</td>
                <td>${item.descricao}</td>
                <td>${item.ativo ? 'Ativo' : 'Inativo'}</td>
                <td style="display:flex; gap:8px;">
                    <button class="btn btn-outline" type="button" onclick="Modulo_clientes.fillFormaPagamentoForm(${item.id})">
                        <i class="ph ph-pencil"></i>
                    </button>
                    <button class="btn btn-primary" type="button" onclick="Modulo_clientes.useFormaPagamento(${item.id})">Usar</button>
                </td>
            </tr>
        `).join('');
    },

    resetFormaPagamentoForm() {
        document.getElementById('forma-pagamento-form-id').value = '';
        document.getElementById('forma-pagamento-form-codigo').value = '';
        document.getElementById('forma-pagamento-form-descricao').value = '';
        document.getElementById('forma-pagamento-form-ativo').value = 'true';
    },

    fillFormaPagamentoForm(id) {
        const item = this.getFormaPagamentoById(id);
        if (!item) return;

        document.getElementById('forma-pagamento-form-id').value = String(item.id);
        document.getElementById('forma-pagamento-form-codigo').value = String(item.codigo);
        document.getElementById('forma-pagamento-form-descricao').value = item.descricao || '';
        document.getElementById('forma-pagamento-form-ativo').value = item.ativo ? 'true' : 'false';
    },

    async saveFormaPagamento() {
        const id = document.getElementById('forma-pagamento-form-id').value;
        const payload = {
            codigo: Number(document.getElementById('forma-pagamento-form-codigo').value || 0),
            descricao: document.getElementById('forma-pagamento-form-descricao').value,
            ativo: document.getElementById('forma-pagamento-form-ativo').value === 'true'
        };

        try {
            const url = id ? `/comercial/formas-pagamento/${id}` : '/comercial/formas-pagamento';
            const method = id ? 'PUT' : 'POST';
            const res = await apiFetch(url, {
                method,
                body: JSON.stringify(payload)
            });

            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                showNotify(data.detail || 'Erro ao salvar forma de pagamento.', 'error');
                return;
            }

            await this.loadFormasPagamento();
            this.renderFormasPagamentoModal();
            this.fillFormaPagamentoForm(data.id);
            this.applySelectedFormaPagamento(this.getFormaPagamentoById(data.id));
            showNotify('Forma de pagamento salva com sucesso.', 'success');
            closeModal('modal-forma-pagamento');
        } catch (error) {
            console.error(error);
            showNotify('Falha ao salvar forma de pagamento.', 'error');
        }
    },

    useFormaPagamento(id) {
        const item = this.getFormaPagamentoById(id);
        if (!item) return;

        this.applySelectedFormaPagamento(item);
        closeModal('modal-forma-pagamento');
    },

    selectFormaPagamentoFromForm() {
        const id = Number(document.getElementById('forma-pagamento-form-id').value || 0);
        if (!id) {
            showNotify('Salve ou selecione uma forma de pagamento antes de usar no cliente.', 'warning');
            return;
        }
        this.useFormaPagamento(id);
    },

    async openCondicaoPagamentoModal() {
        if (!this.condicoesPagamento.length) {
            await this.loadCondicoesPagamento();
        }
        this.renderCondicoesPagamentoModal();
        this.resetCondicaoPagamentoForm();
        openModal('modal-condicao-pagamento');
    },

    renderCondicoesPagamentoModal() {
        const search = document.getElementById('condicao-pagamento-search')?.value || '';
        const tbody = document.querySelector('#table-condicoes-pagamento-modal tbody');
        if (!tbody) return;

        const itens = this.filterBySearch(this.condicoesPagamento, search, ['codigo', 'descricao']);
        if (!itens.length) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align:center">Nenhuma condição de pagamento encontrada.</td></tr>';
            return;
        }

        tbody.innerHTML = itens.map((item) => `
            <tr>
                <td>${item.codigo}</td>
                <td>${item.descricao}</td>
                <td>${this.formatBaseCalculo(item.base_calculo)}</td>
                <td>${item.numero_parcelas}</td>
                <td>${item.ativo ? 'Ativo' : 'Inativo'}</td>
                <td style="display:flex; gap:8px;">
                    <button class="btn btn-outline" type="button" onclick="Modulo_clientes.fillCondicaoPagamentoForm(${item.id})">
                        <i class="ph ph-pencil"></i>
                    </button>
                    <button class="btn btn-primary" type="button" onclick="Modulo_clientes.useCondicaoPagamento(${item.id})">Usar</button>
                </td>
            </tr>
        `).join('');
    },

    resetCondicaoPagamentoForm() {
        document.getElementById('condicao-pagamento-form-id').value = '';
        document.getElementById('condicao-pagamento-form-codigo').value = '';
        document.getElementById('condicao-pagamento-form-descricao').value = '';
        document.getElementById('condicao-pagamento-form-indice').value = '1.0000';
        document.getElementById('condicao-pagamento-form-base').value = 'DATA_DO_DIA';
        document.getElementById('condicao-pagamento-form-numero-parcelas').value = '1';
        document.getElementById('condicao-pagamento-form-ativo').value = 'true';
        this.generateCondicaoParcelRows();
    },

    fillCondicaoPagamentoForm(id) {
        const item = this.getCondicaoPagamentoById(id);
        if (!item) return;

        document.getElementById('condicao-pagamento-form-id').value = String(item.id);
        document.getElementById('condicao-pagamento-form-codigo').value = String(item.codigo);
        document.getElementById('condicao-pagamento-form-descricao').value = item.descricao || '';
        document.getElementById('condicao-pagamento-form-indice').value = Number(item.indice_financeiro || 1).toFixed(4);
        document.getElementById('condicao-pagamento-form-base').value = item.base_calculo || 'DATA_DO_DIA';
        document.getElementById('condicao-pagamento-form-numero-parcelas').value = String(item.numero_parcelas || 1);
        document.getElementById('condicao-pagamento-form-ativo').value = item.ativo ? 'true' : 'false';
        this.generateCondicaoParcelRows(item.parcelas || []);
    },

    generateCondicaoParcelRows(parcelas = null) {
        const count = Number(document.getElementById('condicao-pagamento-form-numero-parcelas').value || 0);
        const tbody = document.querySelector('#table-condicao-parcelas tbody');
        if (!tbody) return;

        if (count < 1) {
            tbody.innerHTML = '<tr><td colspan="3" style="text-align:center">Informe um número de parcelas válido.</td></tr>';
            return;
        }

        const rows = [];
        for (let index = 0; index < count; index += 1) {
            const parcelaNumero = index + 1;
            const existente = Array.isArray(parcelas)
                ? parcelas.find((item) => Number(item.numero) === parcelaNumero)
                : null;
            rows.push(`
                <tr>
                    <td>${parcelaNumero}</td>
                    <td>
                        <input type="number" min="0" class="condicao-parcela-dias" data-numero="${parcelaNumero}" value="${existente?.dias ?? ''}">
                    </td>
                    <td>
                        <input type="date" class="condicao-parcela-data" data-numero="${parcelaNumero}" value="${existente?.data_fixa || ''}">
                    </td>
                </tr>
            `);
        }

        tbody.innerHTML = rows.join('');
    },

    collectCondicaoParcelas() {
        const diasInputs = Array.from(document.querySelectorAll('.condicao-parcela-dias'));
        const dataInputs = Array.from(document.querySelectorAll('.condicao-parcela-data'));
        const parcelas = [];

        diasInputs.forEach((diasInput) => {
            const numero = Number(diasInput.dataset.numero);
            const dataInput = dataInputs.find((item) => Number(item.dataset.numero) === numero);
            const dias = diasInput.value === '' ? null : Number(diasInput.value);
            const dataFixa = dataInput?.value || null;

            parcelas.push({
                numero,
                dias,
                data_fixa: dataFixa
            });
        });

        return parcelas;
    },

    buildCondicaoPagamentoPayload() {
        return {
            codigo: Number(document.getElementById('condicao-pagamento-form-codigo').value || 0),
            descricao: document.getElementById('condicao-pagamento-form-descricao').value,
            indice_financeiro: Number(document.getElementById('condicao-pagamento-form-indice').value || 1),
            base_calculo: document.getElementById('condicao-pagamento-form-base').value,
            numero_parcelas: Number(document.getElementById('condicao-pagamento-form-numero-parcelas').value || 0),
            ativo: document.getElementById('condicao-pagamento-form-ativo').value === 'true',
            parcelas: this.collectCondicaoParcelas()
        };
    },

    async saveCondicaoPagamento() {
        const id = document.getElementById('condicao-pagamento-form-id').value;
        const payload = this.buildCondicaoPagamentoPayload();

        try {
            const url = id ? `/comercial/condicoes-pagamento/${id}` : '/comercial/condicoes-pagamento';
            const method = id ? 'PUT' : 'POST';
            const res = await apiFetch(url, {
                method,
                body: JSON.stringify(payload)
            });

            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                showNotify(data.detail || 'Erro ao salvar condição de pagamento.', 'error');
                return;
            }

            await this.loadCondicoesPagamento();
            this.renderCondicoesPagamentoModal();
            this.fillCondicaoPagamentoForm(data.id);
            this.applySelectedCondicaoPagamento(this.getCondicaoPagamentoById(data.id));
            showNotify('Condição de pagamento salva com sucesso.', 'success');
            closeModal('modal-condicao-pagamento');
        } catch (error) {
            console.error(error);
            showNotify('Falha ao salvar condição de pagamento.', 'error');
        }
    },

    useCondicaoPagamento(id) {
        const item = this.getCondicaoPagamentoById(id);
        if (!item) return;

        this.applySelectedCondicaoPagamento(item);
        closeModal('modal-condicao-pagamento');
    },

    selectCondicaoPagamentoFromForm() {
        const id = Number(document.getElementById('condicao-pagamento-form-id').value || 0);
        if (!id) {
            showNotify('Salve ou selecione uma condição de pagamento antes de usar no cliente.', 'warning');
            return;
        }
        this.useCondicaoPagamento(id);
    }
};
