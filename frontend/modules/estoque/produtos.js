// === GESTAO DE PRODUTOS (MODULAR) ===

window.Modulo_produtos = {
    currentPage: 0,
    itemsPerPage: 20,
    totalItems: 0,
    currentTipo: '',
    currentStatus: 'ativos',

    init() {
        console.log("Modulo de Produtos inicializado");
        this.currentPage = 0;
        this.loadProducts();
    },

    switchMainTab(tabId) {
        document.querySelectorAll('#view-produtos .tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('onclick').includes(tabId));
        });
        document.querySelectorAll('#view-produtos .tab-content').forEach(content => {
            content.classList.toggle('active', content.id === tabId);
        });
        if (tabId === 'tab-estoque-abc') {
            this.loadABC();
        }
    },

    async loadProducts() {
        try {
            const search = document.getElementById('filter-search')?.value || '';
            const shelf = document.getElementById('filter-shelf-select')?.value || '';
            const category = document.getElementById('filter-category-select')?.value || '';
            const status = this.getProductStatusFilter();

            const params = new URLSearchParams();
            params.set('status', status);
            params.set('skip', this.currentPage * this.itemsPerPage);
            params.set('limit', this.itemsPerPage);
            if (search) params.set('search', search);
            if (category) params.set('categoria', category);
            if (shelf) params.set('posicao', shelf);
            if (this.currentTipo) params.set('tipo', this.currentTipo);

            const res = await apiFetch(`/produtos/?${params.toString()}`);
            if (!res.ok) {
                throw new Error(`Falha ao carregar produtos (${res.status})`);
            }

            this.totalItems = parseInt(res.headers.get('X-Total-Count') || '0');
            state.products = await res.json();
            
            // Buscar stats
            try {
                const resStats = await apiFetch(`/produtos/stats`);
                if (resStats.ok) {
                    const stats = await resStats.json();
                    if(document.getElementById('stat-todos')) document.getElementById('stat-todos').innerText = stats.todos || 0;
                    if(document.getElementById('stat-simples')) document.getElementById('stat-simples').innerText = stats.simples || 0;
                    if(document.getElementById('stat-kits')) document.getElementById('stat-kits').innerText = stats.kits || 0;
                    if(document.getElementById('stat-variacoes')) document.getElementById('stat-variacoes').innerText = stats.variacoes || 0;
                    if(document.getElementById('stat-fabricado')) document.getElementById('stat-fabricado').innerText = stats.fabricado || 0;
                    if(document.getElementById('stat-materia')) document.getElementById('stat-materia').innerText = stats.materia_prima || 0;
                }
            } catch(es) { console.error("Erro stats", es); }
            
            // Garantir que temos o catálogo completo para os filtros
            await ensureProductCatalog();
            
            this.populateFilterOptions();
            this.renderProducts();
            this.renderPagination();
        } catch (e) {
            console.error("Erro ao carregar produtos", e);
        }
    },

    getProductStatusFilter() {
        return this.currentStatus;
    },

    toggleStatusFilter(btn) {
        if (this.currentStatus === 'ativos') this.currentStatus = 'inativos';
        else if (this.currentStatus === 'inativos') this.currentStatus = 'todos';
        else this.currentStatus = 'ativos';
        
        if (btn) {
            let color = '#10b981';
            let label = 'Ativos';
            if(this.currentStatus === 'inativos') { color = '#ef4444'; label = 'Inativos'; }
            if(this.currentStatus === 'todos') { color = '#3b82f6'; label = 'Todos'; }
            
            btn.innerHTML = `<div style="width: 8px; height: 8px; border-radius: 50%; background: ${color};"></div> Situação: ${label} <i class="ph ph-caret-down" style="font-size: 12px; margin-left: 4px;"></i>`;
        }
        this.currentPage = 0;
        this.loadProducts();
    },

    getProductEmptyMessage() {
        const status = this.getProductStatusFilter();
        if (status === 'inativos') return 'Nenhum produto inativo encontrado.';
        if (status === 'todos') return 'Nenhum produto cadastrado encontrado.';
        return 'Nenhum produto ativo encontrado.';
    },

    populateFilterOptions() {
        const shelfSelect = document.getElementById('filter-shelf-select');
        const categorySelect = document.getElementById('filter-category-select');
        if (!shelfSelect || !categorySelect) return;

        const selectedShelf = shelfSelect.value;
        const selectedCategory = categorySelect.value;
        
        // Usar o catálogo completo para as opções de filtro
        const sourceData = state.productCatalog || state.products;
        
        const shelves = [...new Set(sourceData.map(p => p.posicao).filter(Boolean))].sort();
        const categories = [...new Set(sourceData.map(p => p.categoria).filter(Boolean))].sort();

        shelfSelect.innerHTML = '<option value="">Todas as Localizações</option>';
        shelves.forEach(shelf => {
            const opt = document.createElement('option');
            opt.value = shelf;
            opt.innerText = shelf;
            shelfSelect.appendChild(opt);
        });

        categorySelect.innerHTML = '<option value="">Todas as Categorias</option>';
        categories.forEach(category => {
            const opt = document.createElement('option');
            opt.value = category;
            opt.innerText = category;
            categorySelect.appendChild(opt);
        });

        shelfSelect.value = shelves.includes(selectedShelf) ? selectedShelf : '';
        categorySelect.value = categories.includes(selectedCategory) ? selectedCategory : '';
    },

    applyFilters() {
        this.currentPage = 0;
        this.loadProducts();
    },

    filterByTipo(btn, tipo) {
        document.querySelectorAll('.product-status-card').forEach(b => {
            b.classList.remove('active');
        });
        btn.classList.add('active');
        this.currentTipo = tipo;
        this.currentPage = 0;
        this.loadProducts();
    },

    renderPagination() {
        const container = document.getElementById('pagination-container');
        if (!container) return;

        const totalPages = Math.ceil(this.totalItems / this.itemsPerPage) || 1;
        
        // Exibindo X a Y de Z produtos
        const start = this.totalItems === 0 ? 0 : (this.currentPage * this.itemsPerPage) + 1;
        const end = Math.min((this.currentPage + 1) * this.itemsPerPage, this.totalItems);
        const text = `Exibindo ${start} de ${this.totalItems} produto(s)`;

        let html = `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 16px 24px; border: 1px solid #2a2c38; border-radius: 12px; background: #15161b; margin-top: 16px;">
                <div style="color: #9ca3af; font-size: 13px;">${text}</div>
                <div style="display: flex; gap: 16px; align-items: center;">
                    <div style="position: relative;">
                        <select onchange="Modulo_produtos.changeItemsPerPage(this.value)" style="appearance: none; background: transparent; border: 1px solid #2a2c38; border-radius: 8px; color: #e5e7eb; padding: 6px 32px 6px 12px; font-size: 13px; cursor: pointer; outline: none;">
                            <option value="10" ${this.itemsPerPage === 10 ? 'selected' : ''} style="background: #1a1b23;">10 por página</option>
                            <option value="20" ${this.itemsPerPage === 20 ? 'selected' : ''} style="background: #1a1b23;">20 por página</option>
                            <option value="50" ${this.itemsPerPage === 50 ? 'selected' : ''} style="background: #1a1b23;">50 por página</option>
                            <option value="100" ${this.itemsPerPage === 100 ? 'selected' : ''} style="background: #1a1b23;">100 por página</option>
                        </select>
                        <i class="ph ph-caret-down" style="position: absolute; right: 12px; top: 50%; transform: translateY(-50%); color: #9ca3af; pointer-events: none; font-size: 12px;"></i>
                    </div>
                    
                    <div style="display: flex; gap: 4px;">
                        <button style="background: transparent; border: 1px solid transparent; color: ${this.currentPage === 0 ? '#4b5563' : '#e5e7eb'}; padding: 6px; cursor: ${this.currentPage === 0 ? 'not-allowed' : 'pointer'}; border-radius: 6px;" ${this.currentPage === 0 ? 'disabled' : ''} onclick="Modulo_produtos.changePage(${this.currentPage - 1})">
                            <i class="ph ph-caret-left"></i>
                        </button>
                        <button style="background: #1e3a8a; border: 1px solid #3b82f6; color: #60a5fa; padding: 4px 12px; border-radius: 6px; font-weight: 600; font-size: 13px;">
                            ${this.currentPage + 1}
                        </button>
                        <button style="background: transparent; border: 1px solid transparent; color: ${this.currentPage >= totalPages - 1 ? '#4b5563' : '#e5e7eb'}; padding: 6px; cursor: ${this.currentPage >= totalPages - 1 ? 'not-allowed' : 'pointer'}; border-radius: 6px;" ${this.currentPage >= totalPages - 1 ? 'disabled' : ''} onclick="Modulo_produtos.changePage(${this.currentPage + 1})">
                            <i class="ph ph-caret-right"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
        container.innerHTML = html;
    },

    changeItemsPerPage(limit) {
        this.itemsPerPage = parseInt(limit);
        this.currentPage = 0;
        this.loadProducts();
    },

    changePage(page) {
        this.currentPage = page;
        this.loadProducts();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    },

    clearFilters() {
        const searchEl = document.getElementById('filter-search');
        const shelfEl = document.getElementById('filter-shelf-select');
        const categoryEl = document.getElementById('filter-category-select');
        const statusEl = document.getElementById('filter-status-select');

        if (searchEl) searchEl.value = '';
        if (shelfEl) shelfEl.value = '';
        if (categoryEl) categoryEl.value = '';
        if (statusEl) statusEl.value = 'ativos';

        this.currentTipo = '';
        document.querySelectorAll('#filter-tipo-container .btn-filter-tipo').forEach(b => {
            b.classList.remove('btn-primary');
            b.classList.add('btn-outline');
            if (b.dataset.filterTipo === '') {
                b.classList.remove('btn-outline');
                b.classList.add('btn-primary');
            }
        });

        this.loadProducts();
    },

    async prepareNewProduct() {
        document.getElementById('form-produto').reset();
        document.getElementById('prod-id').value = '';
        document.getElementById('product-modal-title').innerText = 'Novo Produto';

        const ftBody = document.querySelector('#table-ficha-tecnica tbody');
        if (ftBody) {
            ftBody.innerHTML = '<tr><td colspan="3" style="text-align:center">Salve o produto primeiro para habilitar a ficha tecnica.</td></tr>';
        }

        try {
            const res = await apiFetch('/configuracoes/produtos');
            if (res.ok) {
                const config = await res.json();
                
                const form = document.getElementById('form-produto');
                const setVal = (name, value) => {
                    const el = form.querySelector(`[name="${name}"]`);
                    if (el && value != null) el.value = value;
                };

                setVal('unidade_medida', config.unidade_medida_padrao || 'UN');
                setVal('origem_icms', config.origem_padrao || '0');
                if (config.ncm_padrao) setVal('ncm', config.ncm_padrao);
                
                if (config.sku_automatico) {
                    const skuInput = form.querySelector('[name="sku"]');
                    if (skuInput) {
                        skuInput.placeholder = "Deixe em branco para auto gerar";
                    }
                }
            }
        } catch (e) { console.error("Erro ao carregar configs globais", e); }

        openModal('modal-produto');
    },

    renderProducts(customList = null) {
        const list = customList ?? state.products;
        const tbody = document.querySelector('#table-produtos tbody');
        if (!tbody) return;

        if (!list.length) {
            tbody.innerHTML = `<tr><td colspan="13" style="text-align:center">${this.getProductEmptyMessage()}</td></tr>`;
            return;
        }

        // Helper para escapar HTML inline
        const _e = (str) => {
            if (!str) return '';
            const d = document.createElement('div');
            d.textContent = str;
            return d.innerHTML;
        };

        tbody.innerHTML = list.map(product => {
            const rowStyle = product.ativo ? '' : 'style="opacity: 0.5;"';
            
            const btnAcoes = product.ativo
                ? `
                    <div style="display:flex; gap:4px; align-items:center; justify-content:center;">
                        <button class="table-action-icon" onclick="Modulo_produtos.openMovModal(${product.id})" title="Movimentar"><i class="ph ph-arrows-left-right"></i></button>
                        <button class="table-action-icon" onclick="Modulo_produtos.abrirModalImpressao(${product.id})" title="Etiqueta"><i class="ph ph-printer"></i></button>
                        <button class="table-action-icon" onclick="Modulo_produtos.editProduct(${product.id})" title="Editar"><i class="ph ph-pencil"></i></button>
                        <button class="table-action-icon delete" onclick="Modulo_produtos.deleteProduct(${product.id})" title="Excluir"><i class="ph ph-trash"></i></button>
                    </div>
                `
                : `
                    <div style="display:flex; gap:4px; align-items:center; justify-content:center;">
                        <button class="table-action-icon" onclick="Modulo_produtos.reactivateProduct(${product.id})" title="Reativar"><i class="ph ph-arrow-counter-clockwise"></i></button>
                        <button class="table-action-icon delete" onclick="Modulo_produtos.deleteProductPermanently(${product.id})" title="Excluir Definitivamente"><i class="ph ph-x-circle"></i></button>
                    </div>
                `;

            const loc = `${product.posicao || ''}`.trim() || '---';
            
            const unidadeBadge = product.unidade_medida 
                ? `<span style="background: rgba(59, 130, 246, 0.1); color: #3b82f6; padding: 4px 8px; border-radius: 6px; font-size: 11px; font-weight: 600;">${_e(product.unidade_medida)}</span>`
                : '—';

            return `
                <tr ${rowStyle}>
                    <td style="text-align: center;"><input type="checkbox" class="check-item-produto" style="width:16px; height:16px; accent-color:#3b82f6;" value="${product.id}" onchange="Modulo_produtos.checkSelection()"></td>
                    <td style="text-align: center;">${btnAcoes}</td>
                    <td style="font-weight: 600; color: #fff;">${_e(product.nome)}</td>
                    <td style="color: #9ca3af;">${_e(product.sku) || '—'}</td>
                    <td style="color: #9ca3af;">${_e(product.gtin) || '—'}</td>
                    <td style="text-align: center;">${unidadeBadge}</td>
                    <td style="color: #9ca3af;">${_e(product.ncm) || '—'}</td>
                    <td style="text-align: right; color: #d1d5db;">${formatCurrency(product.preco_venda || 0).replace('R$', '').trim()}</td>
                    <td style="text-align: right; color: #d1d5db;">${formatCurrency(product.custo || 0).replace('R$', '').trim()}</td>
                    <td style="color: #9ca3af;">${_e(product.marca) || '—'}</td>
                    <td style="color: #9ca3af;">${_e(product.cod_fornecedor) || '—'}</td>
                    <td style="text-align: right; color: ${product.estoque_atual < 0 ? '#ef4444' : '#d1d5db'}">${parseFloat(product.estoque_atual).toLocaleString('pt-BR', {minimumFractionDigits: 4})}</td>
                    <td style="color: #9ca3af;">${_e(loc)}</td>
                </tr>
            `;
        }).join('');
    },

    toggleAll(masterCheckbox) {
        const checkboxes = document.querySelectorAll('.check-item-produto');
        checkboxes.forEach(cb => {
            cb.checked = masterCheckbox.checked;
        });
        this.checkSelection();
    },

    checkSelection() {
        const checkboxes = document.querySelectorAll('.check-item-produto:checked');
        const bulkBar = document.getElementById('bulk-actions-bar');
        const countSpan = document.getElementById('bulk-selected-count');
        const masterCheckbox = document.getElementById('check-all-produtos');

        if (checkboxes.length > 0) {
            bulkBar.style.display = 'flex';
            if(countSpan) countSpan.innerText = checkboxes.length;
        } else {
            bulkBar.style.display = 'none';
        }
        
        const allCheckboxes = document.querySelectorAll('.check-item-produto');
        if (masterCheckbox && allCheckboxes.length > 0) {
            masterCheckbox.checked = (checkboxes.length === allCheckboxes.length);
        }
    },

    async bulkDelete() {
        const checkboxes = document.querySelectorAll('.check-item-produto:checked');
        if (checkboxes.length === 0) return;

        if (!confirm(`Tem certeza que deseja excluir ${checkboxes.length} produto(s) selecionado(s)?`)) return;

        let successCount = 0;
        let failCount = 0;

        for (const cb of checkboxes) {
            const id = cb.value;
            try {
                const res = await apiFetch(`/produtos/${id}`, { method: 'DELETE' });
                if (res.ok) successCount++;
                else failCount++;
            } catch (e) {
                failCount++;
            }
        }

        showNotify(`Ação concluída: ${successCount} excluídos, ${failCount} falhas.`, successCount > 0 ? 'success' : 'error');
        if (window.invalidateProductCatalog) window.invalidateProductCatalog();
        
        const masterCheckbox = document.getElementById('check-all-produtos');
        if (masterCheckbox) masterCheckbox.checked = false;
        this.checkSelection();
        this.loadProducts();
        if (window.Modulo_dashboard) window.Modulo_dashboard.loadStats();
    },

    async saveProduct(e) {
        e.preventDefault();
        try {
            const id = document.getElementById('prod-id').value;
            const formData = new FormData(e.target);
            const data = Object.fromEntries(formData.entries());

            const parseNum = (value) => parseFloat(String(value).replace(',', '.')) || 0;

            data.estoque_minimo = parseNum(data.estoque_minimo);
            data.estoque_medio = parseNum(data.estoque_medio);
            data.estoque_maximo = parseNum(data.estoque_maximo);
            data.preco_venda = parseNum(data.preco_venda);
            data.markup = parseNum(data.markup);
            data.peso_liquido = parseNum(data.peso_liquido);
            data.peso_bruto = parseNum(data.peso_bruto);
            data.largura = parseNum(data.largura);
            data.altura = parseNum(data.altura);
            data.comprimento = parseNum(data.comprimento);
            data.n_volumes = parseInt(data.n_volumes) || 1;
            data.unidade_por_caixa = parseInt(data.unidade_por_caixa) || 1;
            data.dias_preparacao = parseInt(data.dias_preparacao) || 0;

            data.controlar_estoque = data.controlar_estoque === 'true';
            data.controlar_lotes = data.controlar_lotes === 'true';
            data.permitir_vendas = data.permitir_vendas === 'true';

            const method = id ? 'PUT' : 'POST';
            const url = id ? `/produtos/${id}` : `/produtos/`;

            const res = await apiFetch(url, {
                method: method,
                body: JSON.stringify(data)
            });

            if (res.ok) {
                showNotify(id ? "Produto atualizado!" : "Produto cadastrado!", "success");
                if (window.invalidateProductCatalog) window.invalidateProductCatalog();
                closeModal('modal-produto');
                this.loadProducts();
                if (window.Modulo_dashboard) window.Modulo_dashboard.loadStats();
            } else {
                const err = await res.json();
                showNotify(err.detail || "Erro ao salvar", "error");
            }
        } catch (e) {
            console.error(e);
            showNotify("Falha na conexao com servidor", "error");
        }
    },

    editProduct(id) {
        const product = state.products.find(item => item.id === id);
        if (!product) return;

        document.getElementById('prod-id').value = product.id;
        document.getElementById('product-modal-title').innerText = 'Editar Produto';
        const form = document.getElementById('form-produto');

        const setVal = (name, value) => {
            const el = form.querySelector(`[name="${name}"]`);
            if (el) el.value = value === null || value === undefined ? '' : value;
        };

        setVal('sku', product.sku);
        setVal('nome', product.nome);
        setVal('descricao', product.descricao);
        setVal('categoria', product.categoria);
        setVal('marca', product.marca);
        setVal('unidade_medida', product.unidade_medida);
        setVal('estoque_minimo', product.estoque_minimo);
        setVal('estoque_medio', product.estoque_medio);
        setVal('estoque_maximo', product.estoque_maximo);
        setVal('corredor', product.corredor);
        setVal('prateleira', product.prateleira);
        setVal('posicao', product.posicao);
        setVal('tipo_produto', product.tipo_produto || 'Simples');
        setVal('origem_icms', product.origem_icms || '0');
        setVal('ncm', product.ncm);
        setVal('preco_venda', product.preco_venda);
        setVal('custo', product.custo);
        setVal('markup', product.markup);
        setVal('peso_liquido', product.peso_liquido);
        setVal('peso_bruto', product.peso_bruto);
        setVal('tipo_embalagem', product.tipo_embalagem || 'Pacote / Caixa');
        setVal('n_volumes', product.n_volumes || 1);
        setVal('largura', product.largura);
        setVal('altura', product.altura);
        setVal('comprimento', product.comprimento);
        setVal('unidade_por_caixa', product.unidade_por_caixa || 1);
        setVal('controlar_estoque', String(product.controlar_estoque));
        setVal('controlar_lotes', String(product.controlar_lotes));
        setVal('permitir_vendas', String(product.permitir_vendas));
        setVal('dias_preparacao', product.dias_preparacao);
        
        setVal('linha_produto', product.linha_produto);
        setVal('cod_fornecedor', product.cod_fornecedor);
        setVal('garantia', product.garantia);
        setVal('observacoes_internas', product.observacoes_internas);
        setVal('codigo_anvisa', product.codigo_anvisa);
        setVal('motivo_isencao_anvisa', product.motivo_isencao_anvisa);
        setVal('ex_tipi', product.ex_tipi);

        if (product.tipo_produto === 'Composto') {
            this.loadFichaTecnica(product.id);
            this.populateComponentSelect();
        } else {
            const ftBody = document.querySelector('#table-ficha-tecnica tbody');
            if (ftBody) {
                ftBody.innerHTML = '<tr><td colspan="3" style="text-align:center">Ficha tecnica disponivel apenas para produtos "Composto/Kit"</td></tr>';
            }
        }

        openModal('modal-produto');
    },

    // --- FICHA TÉCNICA (INTEGRADA) ---
    async loadFichaTecnica(produtoId) {
        try {
            const res = await apiFetch(`/pcp/ficha_tecnica/${produtoId}`);
            const itens = await res.json();
            this.renderFichaTecnica(itens);
        } catch (e) { console.error(e); }
    },

    renderFichaTecnica(itens) {
        const tbody = document.querySelector('#table-ficha-tecnica tbody');
        if (!tbody) return;

        tbody.innerHTML = itens.map(item => `
            <tr>
                <td>${item.produto_componente ? item.produto_componente.nome : 'Componente #' + item.produto_componente_id}</td>
                <td>${item.quantidade_necessaria}</td>
                <td>
                    <button type="button" class="btn btn-sm btn-outline text-danger" onclick="Modulo_produtos.removerFichaTecnica(${item.id})">
                        <i class="ph ph-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
        
        if (itens.length === 0) {
            tbody.innerHTML = '<tr><td colspan="3" style="text-align:center">Nenhum componente adicionado.</td></tr>';
        }
    },

    populateComponentSelect() {
        const sel = document.getElementById('sel-ficha-produto');
        if (!sel) return;

        const prodId = parseInt(document.getElementById('prod-id').value);
        const componentes = state.products.filter(p => p.id !== prodId);
        
        sel.innerHTML = '<option value="">Selecione Matéria-Prima</option>' + 
                        componentes.map(p => `<option value="${p.id}">${p.nome} (${p.sku})</option>`).join('');
    },

    async adicionarFichaTecnica() {
        const prodId = document.getElementById('prod-id').value;
        if (!prodId) {
            showNotify("Salve o produto primeiro!", "warning");
            return;
        }
        
        const componenteId = document.getElementById('sel-ficha-produto').value;
        const qtd = document.getElementById('sel-ficha-qtd').value;
        
        if (!componenteId || !qtd) return showNotify("Selecione o produto e a quantidade", "warning");

        const data = {
            produto_componente_id: parseInt(componenteId),
            quantidade_necessaria: parseFloat(qtd)
        };

        try {
            const res = await apiFetch(`/pcp/ficha_tecnica/${prodId}`, {
                method: 'POST',
                body: JSON.stringify(data)
            });

            if (res.ok) {
                showNotify("Item adicionado à ficha técnica", "success");
                this.loadFichaTecnica(prodId);
                document.getElementById('sel-ficha-qtd').value = '';
            } else {
                const err = await res.json();
                showNotify(err.detail || "Erro ao adicionar item", "error");
            }
        } catch (e) { console.error(e); }
    },

    async removerFichaTecnica(id) {
        if (!confirm("Remover este item da ficha técnica?")) return;
        try {
            const res = await apiFetch(`/pcp/ficha_tecnica/${id}`, { method: 'DELETE' });
            if (res.ok) {
                showNotify("Item removido", "success");
                const prodId = document.getElementById('prod-id').value;
                this.loadFichaTecnica(prodId);
            }
        } catch (e) { console.error(e); }
    },

    async deleteProduct(id) {
        const product = state.products.find(item => item.id === id);
        const label = product ? `${product.nome} (${product.sku})` : `ID ${id}`;

        if (!confirm(`Tem certeza que deseja excluir este produto?\n\n${label}`)) return;

        try {
            const res = await apiFetch(`/produtos/${id}`, { method: 'DELETE' });
            if (res.ok) {
                if (window.invalidateProductCatalog) window.invalidateProductCatalog();
                this.loadProducts();
                showNotify("Produto excluido com sucesso!", "success");
                if (window.Modulo_dashboard) window.Modulo_dashboard.loadStats();
            } else {
                const err = await res.json();
                showNotify(err.detail || "Erro ao excluir", "error");
            }
        } catch (e) {
            console.error("Erro ao excluir produto", e);
            showNotify("Falha na conexao com servidor", "error");
        }
    },

    async reactivateProduct(id) {
        const product = state.products.find(item => item.id === id);
        const label = product ? `${product.nome} (${product.sku})` : `ID ${id}`;

        if (!confirm(`Deseja reativar este produto?\n\n${label}`)) return;

        try {
            const res = await apiFetch(`/produtos/${id}/reativar`, { method: 'PATCH' });
            if (res.ok) {
                if (window.invalidateProductCatalog) window.invalidateProductCatalog();
                this.loadProducts();
                showNotify("Produto reativado com sucesso!", "success");
                if (window.Modulo_dashboard) window.Modulo_dashboard.loadStats();
            } else {
                const err = await res.json();
                showNotify(err.detail || "Erro ao reativar", "error");
            }
        } catch (e) {
            console.error("Erro ao reativar produto", e);
            showNotify("Falha na conexao com servidor", "error");
        }
    },

    async deleteProductPermanently(id) {
        const product = state.products.find(item => item.id === id);
        const label = product ? `${product.nome} (${product.sku})` : `ID ${id}`;

        const confirmed = confirm(
            `Excluir definitivamente este produto?\n\n${label}\n\n` +
            'Esta acao remove o cadastro de forma permanente e nao pode ser desfeita.'
        );
        if (!confirmed) return;

        try {
            const res = await apiFetch(`/produtos/${id}/permanente`, { method: 'DELETE' });
            if (res.ok) {
                if (window.invalidateProductCatalog) window.invalidateProductCatalog();
                this.loadProducts();
                showNotify("Produto excluido definitivamente!", "success");
                if (window.Modulo_dashboard) window.Modulo_dashboard.loadStats();
            } else {
                const err = await res.json();
                showNotify(err.detail || "Erro ao excluir definitivamente", "error");
            }
        } catch (e) {
            console.error("Erro ao excluir definitivamente", e);
            showNotify("Falha na conexao com servidor", "error");
        }
    },

    async forcePurgeProduct(id) {
        const product = state.products.find(item => item.id === id);
        const label = product ? `${product.nome} (${product.sku})` : `ID ${id}`;

        const firstConfirm = confirm(
            `Forcar purga deste produto?\n\n${label}\n\n` +
            'Esta acao apaga o produto e tambem remove historicos relacionados.'
        );
        if (!firstConfirm) return;

        const secondConfirm = confirm(
            'Confirmacao final: a purga forcada vai remover movimentacoes, inventario, PCP, manutencao e outros vinculos do produto. Deseja continuar?'
        );
        if (!secondConfirm) return;

        try {
            const res = await apiFetch(`/produtos/${id}/purga`, { method: 'DELETE' });
            if (res.ok) {
                if (window.invalidateProductCatalog) window.invalidateProductCatalog();
                this.loadProducts();
                showNotify("Purga forcada concluida com sucesso!", "success");
                if (window.Modulo_dashboard) window.Modulo_dashboard.loadStats();
            } else {
                const err = await res.json();
                showNotify(err.detail || "Erro ao executar purga forcada", "error");
            }
        } catch (e) {
            console.error("Erro ao executar purga forcada", e);
            showNotify("Falha na conexao com servidor", "error");
        }
    },

    currentPrintProduct: null,

    async abrirModalImpressao(id) {
        const product = state.products.find(item => item.id === id);
        if (!product) return;

        this.currentPrintProduct = product;
        try {
            const res = await apiFetch(`/configuracoes/etiquetas`);
            if (!res.ok) {
                throw new Error('Falha ao carregar templates de etiqueta.');
            }

            const templates = await res.json();
            if (!templates.length) {
                showNotify('Nenhum template de etiqueta cadastrado.', 'warning');
                return;
            }

            const select = document.getElementById('print-template-id');
            if (select) {
                select.innerHTML = templates.map(template =>
                    `<option value="${template.id}" ${template.padrao ? 'selected' : ''}>${template.nome}</option>`
                ).join('');
            }

            document.getElementById('print-product-name').innerText = product.nome;
            document.getElementById('print-qty').value = 1;
            document.getElementById('print-use-stock').checked = false;
            openModal('modal-imprimir-etiqueta');
        } catch (e) {
            console.error(e);
            showNotify('Nao foi possivel abrir a impressao de etiquetas.', 'error');
        }
    },

    togglePrintStock() {
        const check = document.getElementById('print-use-stock');
        const qtyInput = document.getElementById('print-qty');
        if (check.checked && this.currentPrintProduct) {
            qtyInput.value = Math.floor(this.currentPrintProduct.estoque_atual);
            qtyInput.disabled = true;
        } else {
            qtyInput.disabled = false;
        }
    },

    async confirmarImpressao() {
        const templateId = document.getElementById('print-template-id').value;
        const qty = document.getElementById('print-qty').value;
        const token = sessionStorage.getItem('token');
        if (!templateId || !qty || !this.currentPrintProduct || !token) return;

        const htmlUrl = `${API_URL}/produtos/${this.currentPrintProduct.id}/etiqueta?token=${encodeURIComponent(token)}&template_id=${templateId}&quantidade=${qty}`;
        const zplUrl = `${API_URL}/produtos/${this.currentPrintProduct.id}/etiqueta/zpl?token=${encodeURIComponent(token)}&template_id=${templateId}&quantidade=${qty}`;
        await window.printLabelViaAgent(zplUrl, htmlUrl, {
            width: 720,
            height: 540
        });
        closeModal('modal-imprimir-etiqueta');
    },

    openMovModal(id) {
        const product = state.products.find(item => item.id === id);
        if (!product) return;
        
        document.getElementById('mov-produto-id').value = product.id;
        document.getElementById('mov-title').innerText = `Lançar Movimentação: ${product.nome}`;
        document.getElementById('mov-subtitle').innerText = `SKU: ${product.sku} | Saldo Atual: ${product.estoque_atual} ${product.unidade_medida}`;
        
        const form = document.getElementById('form-mov');
        form.reset();
        
        // Setup form submission for this module
        form.onsubmit = (e) => this.saveMovimentacao(e);
        
        openModal('modal-movimentacao');
    },

    async saveMovimentacao(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());
        data.quantidade = parseFloat(data.quantidade);

        try {
            const res = await apiFetch(`/movimentacoes/`, {
                method: 'POST',
                body: JSON.stringify(data)
            });

            if (res.ok) {
                showNotify("Movimentação registrada!", "success");
                if (window.invalidateProductCatalog) window.invalidateProductCatalog();
                closeModal('modal-movimentacao');
                this.loadProducts();
                if (window.Modulo_dashboard) window.Modulo_dashboard.loadStats();
            } else {
                const err = await res.json();
                showNotify(err.detail || "Erro ao registrar", "error");
            }
        } catch (e) {
            console.error(e);
            showNotify("Falha na conexão", "error");
        }
    },

    async loadABC() {
        const tbody = document.querySelector('#table-abc tbody');
        if (!tbody) return;
        
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding: 40px; color: var(--text-secondary);">Calculando análise...</td></tr>';

        try {
            const res = await apiFetch('/produtos/analise-abc');
            if (!res.ok) throw new Error("Falha ao carregar análise ABC");
            
            const data = await res.json();
            
            if (!data.length) {
                tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding: 40px;">Sem dados suficientes para análise.</td></tr>';
                return;
            }

            const totalGlobal = data.reduce((acc, item) => acc + item.valor_estoque, 0);

            tbody.innerHTML = data.map(item => {
                const perc = totalGlobal > 0 ? (item.valor_estoque / totalGlobal * 100) : 0;
                let classLabel = 'badge-success';
                if (item.categoria_abc === 'B') classLabel = 'badge-warning';
                if (item.categoria_abc === 'C') classLabel = 'badge-danger';

                return `
                    <tr>
                        <td><span class="badge ${classLabel}" style="width: 30px; text-align: center;">${item.categoria_abc}</span></td>
                        <td>${item.sku}</td>
                        <td><strong>${item.nome}</strong></td>
                        <td style="font-weight: 700;">${formatCurrency(item.valor_estoque)}</td>
                        <td style="color: var(--text-secondary);">${perc.toFixed(2)}%</td>
                    </tr>
                `;
            }).join('');

        } catch (e) {
            console.error(e);
            tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color: var(--danger);">Erro: ${e.message}</td></tr>`;
        }
    }
}
