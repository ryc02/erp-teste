window.Modulo_vendas = {
    catalogo: [],
    pedidos: [],
    currentOrderItems: [],
    searchTimer: null,
    clientes: [],
    representantes: [],
    condicoes: [],
    currentPedidoId: null,

    async init() {
        console.log("Modulo de vendas comercial inicializado");
        this.bindEvents();
        await Promise.all([
            this.loadCatalog(),
            this.loadOrders(),
            this.loadClientes(),
            this.loadRepresentantes(),
            this.loadCondicoes()
        ]);
    },

    async destroy() {
        if (this.searchTimer) {
            window.clearTimeout(this.searchTimer);
            this.searchTimer = null;
        }
    },

    refresh() {
        this.loadCatalog();
        this.loadOrders();
    },

    bindEvents() {
        const searchInput = document.getElementById('vendas-search');
        const refreshButton = document.getElementById('btn-vendas-refresh');

        if (searchInput) {
            searchInput.addEventListener('input', () => {
                if (this.searchTimer) window.clearTimeout(this.searchTimer);
                this.searchTimer = window.setTimeout(() => {
                    this.loadCatalog({ search: searchInput.value });
                }, 250);
            });
        }

        if (refreshButton) {
            refreshButton.addEventListener('click', () => this.refresh());
        }
    },

    switchTab(tabId) {
        document.querySelectorAll('#view-vendas .tab-btn').forEach(btn => {
            if (!btn.id.startsWith('btn-order-tab-')) {
                btn.classList.toggle('active', btn.getAttribute('onclick').includes(tabId));
            }
        });
        document.querySelectorAll('#view-vendas > .tab-content').forEach(content => {
            content.classList.toggle('active', content.id === tabId);
        });
    },

    switchOrderTab(tabId) {
        document.querySelectorAll('#modal-novo-pedido .tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('onclick').includes(tabId));
        });
        document.querySelectorAll('#modal-novo-pedido .tab-content').forEach(content => {
            content.classList.toggle('active', content.id === tabId);
        });
    },

    async loadCatalog(options = {}) {
        const searchInput = document.getElementById('vendas-search');
        const search = String(options.search ?? searchInput?.value ?? '').trim();
        const tbody = document.querySelector('#table-vendas-catalogo tbody');

        if (tbody && window.renderSkeletonLoaders) {
            tbody.innerHTML = window.renderSkeletonLoaders(8, 5);
        }

        try {
            const params = new URLSearchParams({ limit: '200' });
            if (search) params.set('search', search);

            const res = await apiFetch(`/vendas/catalogo-produtos?${params.toString()}`);
            if (!res.ok) throw new Error("Erro ao carregar catálogo");

            this.catalogo = await res.json();
            this.renderCatalog();
            this.updateStats();
        } catch (error) {
            console.error(error);
        }
    },

    async loadOrders() {
        const tbody = document.querySelector('#table-vendas-pedidos tbody');
        if (tbody && window.renderSkeletonLoaders) {
            tbody.innerHTML = window.renderSkeletonLoaders(6, 5);
        }
        try {
            const res = await apiFetch('/vendas/pedidos');
            if (!res.ok) throw new Error("Erro ao carregar pedidos");

            this.pedidos = await res.json();
            this.renderOrders();
            this.updateStats();
        } catch (error) {
            console.error(error);
        }
    },

    async loadClientes(force = false) {
        try {
            const res = await apiFetch('/comercial/clientes');
            if (res.ok) {
                this.clientes = await res.json();
                this.populateCrmClientSelect();
                if (force) showNotify('Lista de clientes atualizada', 'success');
            }
        } catch (e) { console.error(e); }
    },

    populateCrmClientSelect() {
        const sel = document.getElementById('crm-cliente-select');
        if (!sel) return;
        const currentVal = sel.value;
        sel.innerHTML = '<option value="">Selecione um cliente para carregar o histórico...</option>' + 
            this.clientes.map(c => `<option value="${c.id}">${c.nome_razao_social} (${c.cpf_cnpj || 'Sem doc'})</option>`).join('');
        if (currentVal) sel.value = currentVal;
    },

    async onCrmClientSelected() {
        const sel = document.getElementById('crm-cliente-select');
        const clientId = parseInt(sel.value, 10);
        const dashboard = document.getElementById('crm-dashboard');

        if (!clientId) {
            dashboard.style.display = 'none';
            return;
        }

        const cliente = this.clientes.find(c => c.id === clientId);
        if (!cliente) return;

        // Render header
        document.getElementById('crm-cliente-nome').innerText = cliente.nome_razao_social;
        document.getElementById('crm-cliente-documento').innerText = cliente.cpf_cnpj || 'Não informado';
        document.getElementById('crm-cliente-email').innerText = cliente.email || 'Não informado';
        document.getElementById('crm-cliente-telefone').innerText = cliente.telefone || 'Não informado';
        document.getElementById('crm-cliente-situacao').innerText = cliente.situacao || 'Ativo';
        
        dashboard.style.display = 'block';

        // Load Tables
        this.loadCrmQuotes(clientId);
        this.loadCrmOrders(clientId);
    },

    async loadCrmQuotes(clientId) {
        const tbody = document.querySelector('#table-crm-cotacoes tbody');
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center">Carregando cotações...</td></tr>';
        
        try {
            const res = await apiFetch(`/vendas/pedidos?cliente_id=${clientId}&tipo=COTACAO`);
            const data = await res.json();
            
            if (!data || !data.length) {
                tbody.innerHTML = '<tr><td colspan="5" style="text-align:center">Nenhuma cotação encontrada.</td></tr>';
                return;
            }

            tbody.innerHTML = data.map(p => this.renderCrmTableRow(p)).join('');
        } catch (e) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:var(--danger);">Erro ao carregar cotações.</td></tr>';
        }
    },

    async loadCrmOrders(clientId) {
        const tbody = document.querySelector('#table-crm-pedidos tbody');
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center">Carregando pedidos...</td></tr>';
        
        try {
            const res = await apiFetch(`/vendas/pedidos?cliente_id=${clientId}&tipo=PEDIDO`);
            const data = await res.json();
            
            if (!data || !data.length) {
                tbody.innerHTML = '<tr><td colspan="5" style="text-align:center">Nenhum pedido encontrado.</td></tr>';
                return;
            }

            tbody.innerHTML = data.map(p => this.renderCrmTableRow(p)).join('');
        } catch (e) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:var(--danger);">Erro ao carregar pedidos.</td></tr>';
        }
    },

    renderCrmTableRow(p) {
        let badgeClass = 'badge-info';
        if (p.status === 'APROVADO') badgeClass = 'badge-primary';
        if (p.status === 'FATURADO' || p.status === 'ENTREGUE') badgeClass = 'badge-success';
        if (p.status === 'CANCELADO') badgeClass = 'badge-danger';
        
        return `
            <tr>
                <td>#${p.id}</td>
                <td>${formatDate(p.data_pedido)}</td>
                <td><span class="badge ${badgeClass}">${p.status}</span></td>
                <td style="font-weight: 700;">${formatCurrency(p.valor_total)}</td>
                <td>
                    <button class="btn btn-outline btn-sm" onclick="Modulo_vendas.viewOrder(${p.id})">
                        <i class="ph ph-eye"></i> Ver
                    </button>
                </td>
            </tr>
        `;
    },

    async loadRepresentantes() {
        try {
            const res = await apiFetch('/comercial/representantes?include_inativos=false');
            if (res.ok) {
                this.representantes = await res.json();
            }
        } catch (e) { console.error(e); }
    },

    async loadCondicoes() {
        try {
            const res = await apiFetch('/comercial/condicoes-pagamento');
            if (res.ok) {
                this.condicoes = await res.json();
            }
        } catch (e) { console.error(e); }
    },

    renderCatalog() {
        const tbody = document.querySelector('#table-vendas-catalogo tbody');
        if (!tbody) return;

        if (!this.catalogo.length) {
            if (window.renderEmptyState) {
                tbody.innerHTML = window.renderEmptyState(8, 'ph ph-package', 'Nenhum produto', 'Nenhum produto encontrado no catálogo.');
            } else {
                tbody.innerHTML = '<tr><td colspan="8" style="text-align:center">Nenhum produto encontrado.</td></tr>';
            }
            return;
        }

        tbody.innerHTML = this.catalogo.map(item => {
            const stockColor = item.estoque_atual > 0 ? 'var(--success)' : 'var(--danger)';
            return `
                <tr>
                    <td><strong>${item.sku}</strong></td>
                    <td>
                        <div style="font-weight: 600;">${item.nome}</div>
                        <div style="font-size: 0.8rem; color: var(--text-secondary);">${item.descricao || ''}</div>
                    </td>
                    <td>${item.categoria}</td>
                    <td>${item.unidade_medida}</td>
                    <td style="font-weight: 700; color: var(--accent);">${formatCurrency(item.preco_venda)}</td>
                    <td style="font-weight: 700; color: ${stockColor};">${item.estoque_atual}</td>
                    <td>${item.corredor || ''}/${item.prateleira || ''}/${item.posicao || ''}</td>
                    <td>${item.dias_preparacao} dia(s)</td>
                </tr>
            `;
        }).join('');
    },


    updateStats() {
        const statTotal = document.getElementById('stat-vendas-total');
        if (statTotal) statTotal.innerText = this.catalogo.length;
        
        const statHoje = document.getElementById('stat-vendas-pedidos-hoje');
        if (statHoje && this.pedidos) {
            const hoje = new Date().toISOString().split('T')[0];
            const pedidosHoje = this.pedidos.filter(p => p.data_pedido && p.data_pedido.startsWith(hoje));
            statHoje.innerText = pedidosHoje.length;
        }

        const statMes = document.getElementById('stat-vendas-valor-mes');
        if (statMes && this.pedidos) {
            const hoje = new Date().toISOString().split('T')[0];
            const mesAtual = hoje.substring(0, 7);
            const valorMes = this.pedidos
                .filter(p => p.data_pedido && p.data_pedido.startsWith(mesAtual) && p.status !== 'CANCELADO')
                .reduce((acc, curr) => acc + curr.valor_total, 0);
            statMes.innerText = formatCurrency(valorMes);
        }
    },

    onClientChange() {
        const sel = document.getElementById('order-cliente-id');
        if (!sel || !this.clientes) return;
        const cliente = this.clientes.find(c => c.id == sel.value);
        const nameField = document.getElementById('order-cliente-nome');
        if (cliente && nameField) {
            nameField.value = cliente.nome_razao_social;
        }
    },


    filterOrders() {
        const search = document.getElementById('pedidos-search')?.value?.toLowerCase() || '';
        const status = document.getElementById('pedidos-status-filter')?.value || '';
        this.renderOrders(search, status);
    },

    renderOrders(searchFilter = '', statusFilter = '') {
        const tbody = document.querySelector('#table-vendas-pedidos tbody');
        if (!tbody) return;

        let filtered = this.pedidos;
        
        if (searchFilter) {
            filtered = filtered.filter(p => 
                p.cliente_nome.toLowerCase().includes(searchFilter) || 
                String(p.id).includes(searchFilter)
            );
        }

        if (statusFilter) {
            filtered = filtered.filter(p => p.status === statusFilter);
        }

        if (!filtered.length) {
            if (window.renderEmptyState) {
                tbody.innerHTML = window.renderEmptyState(6, 'ph ph-shopping-cart', 'Nenhum pedido', searchFilter ? 'Nenhum pedido encontrado para a busca.' : 'Nenhum pedido realizado.', '<button class="btn btn-primary" onclick="Modulo_vendas.openNewOrderModal()"><i class="ph ph-plus"></i> Novo Pedido</button>');
            } else {
                tbody.innerHTML = `<tr><td colspan="6" style="text-align:center">${searchFilter ? 'Nenhum pedido encontrado para a busca.' : 'Nenhum pedido realizado.'}</td></tr>`;
            }
            return;
        }

        tbody.innerHTML = filtered.map(p => {
            let badgeClass = 'badge-info';
            if (p.status === 'APROVADO') badgeClass = 'badge-primary';
            if (p.status === 'FATURADO') badgeClass = 'badge-success';
            if (p.status === 'ENTREGUE') badgeClass = 'badge-success';
            if (p.status === 'CANCELADO') badgeClass = 'badge-danger';
            
            return `
                <tr>
                    <td>#${p.id}</td>
                    <td>${p.cliente_nome}</td>
                    <td>${formatDate(p.data_pedido)}</td>
                    <td><span class="badge ${badgeClass}">${p.status}</span></td>
                    <td style="font-weight: 700;">${formatCurrency(p.valor_total)}</td>
                    <td>
                        <button class="btn btn-outline btn-sm" onclick="Modulo_vendas.viewOrder(${p.id})">
                            <i class="ph ph-eye"></i> Visualizar
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    },

    updateStats() {
        if (document.getElementById('stat-vendas-total')) {
            document.getElementById('stat-vendas-total').innerText = this.catalogo.length;
        }
        if (document.getElementById('stat-vendas-pedidos-hoje')) {
            const hoje = new Date().toISOString().split('T')[0];
            const pedidosHoje = this.pedidos.filter(p => p.data_pedido.startsWith(hoje)).length;
            document.getElementById('stat-vendas-pedidos-hoje').innerText = pedidosHoje;
        }
        if (document.getElementById('stat-vendas-valor-mes')) {
            const totalMes = this.pedidos.reduce((acc, p) => acc + p.valor_total, 0);
            document.getElementById('stat-vendas-valor-mes').innerText = formatCurrency(totalMes);
        }
    },

    openNewOrderModal(tipo = 'PEDIDO', lockClient = false) {
        if (window.UXTelemetry) window.UXTelemetry.startTask('vendas_novo_pedido');
        this.currentOrderItems = [];
        this.switchOrderTab('order-tab-geral');
        document.getElementById('order-tipo').value = tipo;
        document.getElementById('modal-novo-pedido-title').innerText = tipo === 'PEDIDO' ? 'Novo Pedido de Venda' : 'Nova Cotação / Orçamento';
        
        let targetClientId = '';
        if (lockClient) {
            const sel = document.getElementById('crm-cliente-select');
            targetClientId = sel ? sel.value : '';
        }

        document.getElementById('order-cliente-id').value = targetClientId;
        document.getElementById('order-cliente-nome').value = '';
        document.getElementById('order-representante-id').value = '';
        document.getElementById('order-obs').value = '';
        this.renderOrderItems();
        
        const cliSel = document.getElementById('order-cliente-id');
        cliSel.innerHTML = '<option value="">Selecione um cliente...</option>' + 
            this.clientes.map(c => `<option value="${c.id}">${c.nome_razao_social} (${c.cpf_cnpj || '-'})</option>`).join('');
            
        if (targetClientId) {
            cliSel.value = targetClientId;
            this.onClientChange(); // to set the hidden name field
            cliSel.disabled = true; // lock if opened from CRM
        } else {
            cliSel.disabled = false;
        }

        const repSel = document.getElementById('order-representante-id');
        if (repSel) {
            repSel.innerHTML = '<option value="">Venda Direta / Nenhum</option>' + 
                this.representantes.map(r => `<option value="${r.id}">${r.codigo} - ${r.nome}</option>`).join('');
        }

        const condSel = document.getElementById('order-condicao-id');
        if (condSel) {
            condSel.innerHTML = '<option value="">Selecione uma condição...</option>' + 
                this.condicoes.map(c => `<option value="${c.id}">${c.nome}</option>`).join('');
        }

        document.getElementById('order-tipo').value = 'PEDIDO';
        document.getElementById('order-frete').value = '0.00';
        document.getElementById('order-desconto').value = '0.00';

        const sel = document.getElementById('order-item-sel');
        sel.innerHTML = '<option value="">Selecione um produto...</option>' + 
            this.catalogo.map(p => `<option value="${p.id}">${p.sku} - ${p.nome} (${formatCurrency(p.preco_venda)})</option>`).join('');
        
        openModal('modal-novo-pedido');
    },

    onClientChange() {
        const sel = document.getElementById('order-cliente-id');
        const cliente = this.clientes.find(c => c.id == sel.value);
        if (cliente) {
            document.getElementById('order-cliente-nome').value = cliente.nome_razao_social;
        }
    },

    addItemToOrder() {
        const sel = document.getElementById('order-item-sel');
        const qtdInput = document.getElementById('order-item-qtd');
        const produtoId = parseInt(sel.value);
        const qtd = parseFloat(qtdInput.value);

        if (!produtoId || qtd <= 0) return;

        const produto = this.catalogo.find(p => p.id === produtoId);
        if (!produto) return;

        this.currentOrderItems.push({
            produto_id: produto.id,
            sku: produto.sku,
            nome: produto.nome,
            quantidade: qtd,
            preco_unitario: produto.preco_venda
        });

        if (window.UXTelemetry) window.UXTelemetry.trackStep('vendas_novo_pedido', 'add_item');

        this.renderOrderItems();
        qtdInput.value = 1;
        sel.value = '';
    },

    removeItemFromOrder(index) {
        this.currentOrderItems.splice(index, 1);
        this.renderOrderItems();
    },

    renderOrderItems() {
        const tbody = document.querySelector('#table-order-items tbody');
        let subtotal = 0;

        tbody.innerHTML = this.currentOrderItems.map((item, index) => {
            const itemSub = item.quantidade * item.preco_unitario;
            subtotal += itemSub;
            return `
                <tr>
                    <td><strong>${item.sku}</strong> - ${item.nome}</td>
                    <td>${item.quantidade}</td>
                    <td>${formatCurrency(item.preco_unitario)}</td>
                    <td>${formatCurrency(itemSub)}</td>
                    <td>
                        <i class="ph ph-trash text-danger" style="cursor:pointer" onclick="Modulo_vendas.removeItemFromOrder(${index})"></i>
                    </td>
                </tr>
            `;
        }).join('');

        const frete = parseFloat(document.getElementById('order-frete').value || 0);
        const desconto = parseFloat(document.getElementById('order-desconto').value || 0);
        const total = (subtotal + frete) - desconto;

        document.getElementById('order-subtotal-value').innerText = formatCurrency(subtotal);
        if (document.getElementById('order-subtotal-value-2')) {
            document.getElementById('order-subtotal-value-2').innerText = formatCurrency(subtotal);
        }
        document.getElementById('order-frete-display').innerText = `+ ${formatCurrency(frete)}`;
        document.getElementById('order-desconto-display').innerText = `- ${formatCurrency(desconto)}`;
        document.getElementById('order-total-value').innerText = formatCurrency(total);
    },

    async submitOrder() {
        const clienteIdSelect = document.getElementById('order-cliente-id');
        const clienteId = clienteIdSelect.value;
        const clienteNome = document.getElementById('order-cliente-nome').value;
        const representanteId = document.getElementById('order-representante-id').value;
        const obs = document.getElementById('order-obs').value.trim();

        if (!clienteId && !clienteNome) {
            showNotify("Por favor, selecione um cliente.", "error");
            return;
        }

        if (!this.currentOrderItems.length) {
            showNotify("O pedido deve ter pelo menos um item.", "error");
            return;
        }

        try {
            const payload = {
                tipo: document.getElementById('order-tipo').value,
                cliente_id: clienteId ? parseInt(clienteId) : null,
                cliente_nome: clienteNome,
                representante_id: representanteId ? parseInt(representanteId) : null,
                condicao_pagamento_id: document.getElementById('order-condicao-id').value ? parseInt(document.getElementById('order-condicao-id').value) : null,
                valor_frete: parseFloat(document.getElementById('order-frete').value || 0),
                desconto_valor: parseFloat(document.getElementById('order-desconto').value || 0),
                observacoes: obs,
                itens: this.currentOrderItems.map(i => ({
                    produto_id: i.produto_id,
                    quantidade: i.quantidade,
                    preco_unitario: i.preco_unitario
                }))
            };

            const res = await apiFetch('/vendas/pedidos', {
                method: 'POST',
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                if (window.UXTelemetry) window.UXTelemetry.completeTask('vendas_novo_pedido');
                showNotify("Documento criado com sucesso!", "success");
                closeModal('modal-novo-pedido');
                this.loadOrders();
                
                // Update CRM tables if active
                const crmClientId = document.getElementById('crm-cliente-select')?.value;
                if (crmClientId && crmClientId === clienteId) {
                    if (typeof this.loadCrmQuotes === 'function') this.loadCrmQuotes(crmClientId);
                    if (typeof this.loadCrmOrders === 'function') this.loadCrmOrders(crmClientId);
                } else if (!crmClientId) {
                    this.switchTab('vendas-tab-pedidos');
                }
            } else {
                if (window.UXTelemetry) window.UXTelemetry.trackError('FORM_VALIDATION', 'Erro ao salvar pedido');
                const err = await res.json();
                showNotify(err.detail || "Erro ao salvar pedido", "error");
            }
        } catch (error) {
            console.error(error);
            if (window.UXTelemetry) window.UXTelemetry.trackError('API_ERROR', 'Erro de conexão com o servidor');
            showNotify("Erro de conexão com o servidor", "error");
        }
    },

    async viewOrder(pedidoId) {
        this.currentPedidoId = pedidoId;
        try {
            const res = await apiFetch(`/vendas/pedidos/${pedidoId}`);
            if (!res.ok) throw new Error("Falha ao carregar detalhes do pedido");
            
            const p = await res.json();
            
            document.getElementById('detalhe-pedido-id').innerText = `#${p.id}`;
            document.getElementById('detalhe-pedido-cliente').innerText = p.cliente_nome;
            document.getElementById('detalhe-pedido-data').innerText = formatDate(p.data_pedido);
            document.getElementById('detalhe-pedido-obs').innerText = p.observacoes || 'Sem observações';
            document.getElementById('detalhe-pedido-total').innerText = formatCurrency(p.valor_total);
            
            // Status Badge
            const badgeArea = document.getElementById('detalhe-pedido-status-badge');
            let badgeClass = 'badge-info';
            if (p.status === 'APROVADO') badgeClass = 'badge-primary';
            if (p.status === 'FATURADO') badgeClass = 'badge-success';
            if (p.status === 'ENTREGUE') badgeClass = 'badge-success';
            if (p.status === 'CANCELADO') badgeClass = 'badge-danger';
            badgeArea.innerHTML = `<span class="badge ${badgeClass}" style="font-size: 0.9rem;">${p.status}</span>`;
            
            // Itens
            const tbody = document.querySelector('#table-detalhe-itens tbody');
            tbody.innerHTML = p.itens.map(item => {
                const prodName = item.produto ? `<strong>${item.produto.sku}</strong> - ${item.produto.nome}` : `ID: ${item.produto_id}`;
                return `
                    <tr>
                        <td>${prodName}</td>
                        <td>${item.quantidade}</td>
                        <td>${formatCurrency(item.preco_unitario)}</td>
                        <td>${formatCurrency(item.quantidade * item.preco_unitario)}</td>
                    </tr>
                `;
            }).join('');
            
            // Ações Dinâmicas
            const areaAcao = document.getElementById('area-acao-aprovacao');
            if (p.tipo === 'COTACAO') {
                areaAcao.innerHTML = `
                    <button class="btn btn-primary" onclick="Modulo_vendas.converterCotacao(${p.id})">
                        <i class="ph ph-arrows-merge"></i> Converter em Pedido
                    </button>
                `;
            } else if (p.status === 'RASCUNHO') {
                areaAcao.innerHTML = `
                    <button class="btn btn-accent" onclick="Modulo_vendas.approveOrder(${p.id})">
                        <i class="ph ph-check-circle"></i> Aprovar e Baixar Estoque
                    </button>
                `;
            } else if (p.status === 'APROVADO') {
                areaAcao.innerHTML = `
                    <button class="btn btn-success" onclick="Modulo_vendas.faturarPedido(${p.id})">
                        <i class="ph ph-file-text"></i> Faturar Pedido
                    </button>
                `;
            } else if (p.status === 'FATURADO') {
                areaAcao.innerHTML = `
                    <button class="btn btn-primary" onclick="Modulo_vendas.entregarPedido(${p.id})">
                        <i class="ph ph-truck"></i> Marcar como Entregue
                    </button>
                `;
            } else {
                areaAcao.innerHTML = '';
            }
            
            openModal('modal-pedido-detalhe');
        } catch (e) {
            console.error(e);
            showNotify(e.message, "error");
        }
    },

    async approveOrder(pedidoId) {
        if (!confirm(`Deseja aprovar o pedido #${pedidoId} e realizar a baixa automática no estoque?`)) return;
        
        try {
            const res = await apiFetch(`/vendas/pedidos/${pedidoId}/aprovar`, { method: 'POST' });
            const data = await res.json();
            
            if (res.ok) {
                showNotify(data.message, "success");
                closeModal('modal-pedido-detalhe');
                this.loadOrders();
                this.refreshCrmIfActive(pedidoId);
            } else {
                showNotify(data.detail || "Erro ao aprovar pedido", "error");
            }
        } catch (e) {
            console.error(e);
            showNotify("Erro de conexão ao aprovar pedido", "error");
        }
    },

    async faturarPedido(pedidoId) {
        if (!confirm(`Deseja faturar o pedido #${pedidoId}?`)) return;
        try {
            const res = await apiFetch(`/vendas/pedidos/${pedidoId}/faturar`, { method: 'POST' });
            if (res.ok) {
                showNotify("Pedido faturado com sucesso!", "success");
                closeModal('modal-pedido-detalhe');
                this.loadOrders();
            } else {
                const err = await res.json();
                showNotify(err.detail || "Erro ao faturar", "error");
            }
        } catch (e) { console.error(e); }
    },

    async entregarPedido(pedidoId) {
        if (!confirm(`Confirmar entrega do pedido #${pedidoId}?`)) return;
        try {
            const res = await apiFetch(`/vendas/pedidos/${pedidoId}/entregar`, { method: 'POST' });
            if (res.ok) {
                showNotify("Pedido marcado como entregue!", "success");
                closeModal('modal-pedido-detalhe');
                this.loadOrders();
            } else {
                const err = await res.json();
                showNotify(err.detail || "Erro ao entregar", "error");
            }
        } catch (e) { console.error(e); }
    },

    async converterCotacao(pedidoId) {
        if (!confirm(`Deseja converter a cotação #${pedidoId} em um Pedido de Venda ativo?`)) return;
        try {
            const res = await apiFetch(`/vendas/pedidos/${pedidoId}/converter-em-pedido`, { method: 'POST' });
            if (res.ok) {
                showNotify("Cotação convertida com sucesso!", "success");
                closeModal('modal-pedido-detalhe');
                this.loadOrders();
                this.refreshCrmIfActive(pedidoId);
            } else {
                const err = await res.json();
                showNotify(err.detail || "Erro ao converter", "error");
            }
        } catch (e) { console.error(e); }
    },

    refreshCrmIfActive() {
        const sel = document.getElementById('crm-cliente-select');
        if (sel && sel.value) {
            if (typeof this.loadCrmQuotes === 'function') this.loadCrmQuotes(sel.value);
            if (typeof this.loadCrmOrders === 'function') this.loadCrmOrders(sel.value);
        }
    },

    imprimirPedido() {
        if (!this.currentPedidoId) return;
        const token = sessionStorage.getItem('token');
        const url = `${API_URL}/relatorios/pedido_venda/${this.currentPedidoId}/pdf?token=${token}`;
        window.openDocumentViaAgent(url, {
            preferAppMode: true,
            width: 1280,
            height: 900,
            documentKind: 'pdf'
        });
    }
};
