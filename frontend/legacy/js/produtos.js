// === GESTAO DE PRODUTOS ===

async function loadProducts() {
    try {
        const params = new URLSearchParams();
        params.set('status', getProductStatusFilter());

        const res = await fetch(`${API_URL}/produtos/?${params.toString()}`);
        if (!res.ok) {
            throw new Error(`Falha ao carregar produtos (${res.status})`);
        }

        state.products = await res.json();
        populateFilterOptions();
        applyFilters();
    } catch (e) {
        console.error("Erro ao carregar produtos", e);
    }
}

function getProductStatusFilter() {
    return document.getElementById('filter-status-select')?.value || 'ativos';
}

function getProductEmptyMessage() {
    const status = getProductStatusFilter();
    if (status === 'inativos') return 'Nenhum produto inativo encontrado.';
    if (status === 'todos') return 'Nenhum produto cadastrado encontrado.';
    return 'Nenhum produto ativo encontrado.';
}

function populateFilterOptions() {
    const shelfSelect = document.getElementById('filter-shelf-select');
    const categorySelect = document.getElementById('filter-category-select');
    if (!shelfSelect || !categorySelect) return;

    const selectedShelf = shelfSelect.value;
    const selectedCategory = categorySelect.value;
    const shelves = [...new Set(state.products.map(p => p.prateleira).filter(Boolean))].sort();
    const categories = [...new Set(state.products.map(p => p.categoria).filter(Boolean))].sort();

    shelfSelect.innerHTML = '<option value="">Todas as Prateleiras</option>';
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
}

window.applyFilters = function() {
    const search = document.getElementById('filter-search').value.toLowerCase();
    const shelf = document.getElementById('filter-shelf-select').value;
    const category = document.getElementById('filter-category-select').value;

    let filtered = state.products;

    if (search) {
        filtered = filtered.filter(product =>
            product.nome.toLowerCase().includes(search) ||
            product.sku.toLowerCase().includes(search)
        );
    }

    if (shelf) filtered = filtered.filter(product => product.prateleira === shelf);
    if (category) filtered = filtered.filter(product => product.categoria === category);

    renderProducts(filtered);
}

window.clearFilters = function() {
    const searchEl = document.getElementById('filter-search');
    const shelfEl = document.getElementById('filter-shelf-select');
    const categoryEl = document.getElementById('filter-category-select');
    const statusEl = document.getElementById('filter-status-select');

    if (searchEl) searchEl.value = '';
    if (shelfEl) shelfEl.value = '';
    if (categoryEl) categoryEl.value = '';
    if (statusEl) statusEl.value = 'ativos';

    loadProducts();
}

window.prepareNewProduct = function() {
    document.getElementById('form-produto').reset();
    document.getElementById('prod-id').value = '';
    document.getElementById('product-modal-title').innerText = 'Novo Produto';

    const ftBody = document.querySelector('#table-ficha-tecnica tbody');
    if (ftBody) {
        ftBody.innerHTML = '<tr><td colspan="3" style="text-align:center">Salve o produto primeiro para habilitar a ficha tecnica.</td></tr>';
    }

    openModal('modal-produto');
}

function renderProducts(customList = null) {
    const list = customList ?? state.products;
    const tbody = document.querySelector('#table-produtos tbody');
    if (!tbody) return;

    if (!list.length) {
        tbody.innerHTML = `<tr><td colspan="8" style="text-align:center">${getProductEmptyMessage()}</td></tr>`;
        return;
    }

    tbody.innerHTML = list.map(product => {
        const statusBadge = product.ativo ? 'badge-success' : 'badge-danger';
        const statusLabel = product.ativo ? 'Ativo' : 'Inativo';
        const minClass = product.estoque_atual <= product.estoque_minimo ? 'text-danger' : '';
        const rowStyle = product.ativo ? '' : 'style="opacity: 0.75;"';
        const actionButtons = product.ativo
            ? `
                <button class="btn btn-outline" onclick="openMovModal(${product.id})" title="Movimentar Produto">
                    <i class="ph ph-arrows-left-right"></i>
                </button>
                <button class="btn btn-outline" onclick="abrirModalImpressao(${product.id})" title="Imprimir Etiquetas">
                    <i class="ph ph-printer"></i>
                </button>
                <button class="btn btn-outline" onclick="editProduct(${product.id})" title="Editar Produto">
                    <i class="ph ph-pencil"></i>
                </button>
                <button class="btn btn-outline text-danger" onclick="deleteProduct(${product.id})" title="Excluir Produto">
                    <i class="ph ph-trash"></i>
                </button>
            `
            : `
                <button class="btn btn-outline" onclick="reactivateProduct(${product.id})" title="Reativar Produto">
                    <i class="ph ph-arrow-counter-clockwise"></i>
                </button>
                <button class="btn btn-outline text-danger" onclick="deleteProductPermanently(${product.id})" title="Excluir Definitivamente">
                    <i class="ph ph-x-circle"></i>
                </button>
                <button class="btn btn-outline text-danger" onclick="forcePurgeProduct(${product.id})" title="Forcar Purga">
                    <i class="ph ph-warning-octagon"></i>
                </button>
                <button class="btn btn-outline" onclick="editProduct(${product.id})" title="Editar Produto">
                    <i class="ph ph-pencil"></i>
                </button>
            `;

        return `
            <tr ${rowStyle}>
                <td>${product.sku}</td>
                <td><strong>${product.nome}</strong></td>
                <td><span class="badge badge-info">${product.categoria}</span></td>
                <td><span class="badge ${statusBadge}">${statusLabel}</span></td>
                <td>${product.estoque_atual} ${product.unidade_medida}</td>
                <td class="${minClass}">${product.estoque_minimo}</td>
                <td>${product.corredor || '-'}/${product.prateleira || '-'}/${product.posicao || '-'}</td>
                <td>
                    <div class="flex-gap">
                        ${actionButtons}
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

async function readErrorMessage(res, fallback) {
    try {
        const err = await res.json();
        return err.detail || fallback;
    } catch (parseError) {
        const errText = await res.text();
        return errText || fallback;
    }
}

window.saveProduct = async function(e) {
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
        data.peso_liquido = parseNum(data.peso_liquido);
        data.peso_bruto = parseNum(data.peso_bruto);
        data.largura = parseNum(data.largura);
        data.altura = parseNum(data.altura);
        data.comprimento = parseNum(data.comprimento);
        data.dias_preparacao = parseInt(data.dias_preparacao) || 0;

        data.controlar_estoque = data.controlar_estoque === 'true';
        data.controlar_lotes = data.controlar_lotes === 'true';

        const method = id ? 'PUT' : 'POST';
        const url = id ? `${API_URL}/produtos/${id}` : `${API_URL}/produtos/`;

        const res = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (res.ok) {
            showNotify(id ? "Produto atualizado!" : "Produto cadastrado!", "success");
            closeModal('modal-produto');
            loadProducts();
            if (typeof loadStats === 'function') loadStats();
        } else {
            showNotify(await readErrorMessage(res, "Erro ao salvar"), "error");
        }
    } catch (e) {
        console.error(e);
        showNotify("Falha na conexao com servidor", "error");
    }
}

window.editProduct = function(id) {
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
    setVal('peso_liquido', product.peso_liquido);
    setVal('peso_bruto', product.peso_bruto);
    setVal('tipo_embalagem', product.tipo_embalagem || 'Pacote / Caixa');
    setVal('largura', product.largura);
    setVal('altura', product.altura);
    setVal('comprimento', product.comprimento);
    setVal('controlar_estoque', String(product.controlar_estoque));
    setVal('controlar_lotes', String(product.controlar_lotes));
    setVal('dias_preparacao', product.dias_preparacao);

    if (product.tipo_produto === 'Composto') {
        if (typeof loadFichaTecnica === 'function') loadFichaTecnica(product.id);
        if (typeof populateComponentSelect === 'function') populateComponentSelect();
    } else {
        const ftBody = document.querySelector('#table-ficha-tecnica tbody');
        if (ftBody) {
            ftBody.innerHTML = '<tr><td colspan="3" style="text-align:center">Ficha tecnica disponivel apenas para produtos "Composto/Kit"</td></tr>';
        }
    }

    openModal('modal-produto');
}

window.deleteProduct = async function(id) {
    const product = state.products.find(item => item.id === id);
    const label = product ? `${product.nome} (${product.sku})` : `ID ${id}`;

    if (!confirm(`Tem certeza que deseja excluir este produto?\n\n${label}`)) return;

    try {
        const res = await fetch(`${API_URL}/produtos/${id}`, { method: 'DELETE' });
        if (res.ok) {
            const currentStatus = getProductStatusFilter();

            if (currentStatus === 'todos' && product) {
                state.products = state.products.map(item =>
                    item.id === id ? { ...item, ativo: false } : item
                );
            } else {
                state.products = state.products.filter(item => item.id !== id);
            }

            showNotify("Produto excluido com sucesso!", "success");
            populateFilterOptions();
            applyFilters();
            loadProducts();
            if (typeof loadStats === 'function') loadStats();
        } else {
            showNotify(await readErrorMessage(res, "Erro ao excluir"), "error");
        }
    } catch (e) {
        console.error("Erro ao excluir produto", e);
        showNotify("Falha na conexao com servidor", "error");
    }
}

window.reactivateProduct = async function(id) {
    const product = state.products.find(item => item.id === id);
    const label = product ? `${product.nome} (${product.sku})` : `ID ${id}`;

    if (!confirm(`Deseja reativar este produto?\n\n${label}`)) return;

    try {
        const res = await fetch(`${API_URL}/produtos/${id}/reativar`, { method: 'PATCH' });
        if (res.ok) {
            const updatedProduct = await res.json();
            const currentStatus = getProductStatusFilter();

            if (currentStatus === 'inativos') {
                state.products = state.products.filter(item => item.id !== id);
            } else {
                const exists = state.products.some(item => item.id === id);
                state.products = exists
                    ? state.products.map(item => item.id === id ? updatedProduct : item)
                    : [updatedProduct, ...state.products];
            }

            showNotify("Produto reativado com sucesso!", "success");
            populateFilterOptions();
            applyFilters();
            loadProducts();
            if (typeof loadStats === 'function') loadStats();
        } else {
            showNotify(await readErrorMessage(res, "Erro ao reativar"), "error");
        }
    } catch (e) {
        console.error("Erro ao reativar produto", e);
        showNotify("Falha na conexao com servidor", "error");
    }
}

window.deleteProductPermanently = async function(id) {
    const product = state.products.find(item => item.id === id);
    const label = product ? `${product.nome} (${product.sku})` : `ID ${id}`;

    const confirmed = confirm(
        `Excluir definitivamente este produto?\n\n${label}\n\n` +
        'Esta acao remove o cadastro de forma permanente e nao pode ser desfeita.'
    );
    if (!confirmed) return;

    try {
        const res = await fetch(`${API_URL}/produtos/${id}/permanente`, { method: 'DELETE' });
        if (res.ok) {
            state.products = state.products.filter(item => item.id !== id);
            showNotify("Produto excluido definitivamente!", "success");
            populateFilterOptions();
            applyFilters();
            loadProducts();
            if (typeof loadStats === 'function') loadStats();
        } else {
            showNotify(await readErrorMessage(res, "Erro ao excluir definitivamente"), "error");
        }
    } catch (e) {
        console.error("Erro ao excluir definitivamente", e);
        showNotify("Falha na conexao com servidor", "error");
    }
}

window.forcePurgeProduct = async function(id) {
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
        const res = await fetch(`${API_URL}/produtos/${id}/purga`, { method: 'DELETE' });
        if (res.ok) {
            state.products = state.products.filter(item => item.id !== id);
            showNotify("Purga forcada concluida com sucesso!", "success");
            populateFilterOptions();
            applyFilters();
            loadProducts();
            if (typeof loadStats === 'function') loadStats();
        } else {
            showNotify(await readErrorMessage(res, "Erro ao executar purga forcada"), "error");
        }
    } catch (e) {
        console.error("Erro ao executar purga forcada", e);
        showNotify("Falha na conexao com servidor", "error");
    }
}

let currentPrintProduct = null;

window.abrirModalImpressao = async function(id) {
    const product = state.products.find(item => item.id === id);
    if (!product) return;

    currentPrintProduct = product;
    try {
        const res = await fetch(`${API_URL}/configuracoes/etiquetas`);
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
}

window.togglePrintStock = function() {
    const check = document.getElementById('print-use-stock');
    const qtyInput = document.getElementById('print-qty');
    if (check.checked && currentPrintProduct) {
        qtyInput.value = Math.floor(currentPrintProduct.estoque_atual);
        qtyInput.disabled = true;
    } else {
        qtyInput.disabled = false;
    }
}

window.confirmarImpressao = async function() {
    const templateId = document.getElementById('print-template-id').value;
    const qty = document.getElementById('print-qty').value;
    const token = sessionStorage.getItem('token');
    if (!templateId || !qty || !currentPrintProduct || !token) return;

    const htmlUrl = `${API_URL}/produtos/${currentPrintProduct.id}/etiqueta?token=${encodeURIComponent(token)}&template_id=${templateId}&quantidade=${qty}`;
    const zplUrl = `${API_URL}/produtos/${currentPrintProduct.id}/etiqueta/zpl?token=${encodeURIComponent(token)}&template_id=${templateId}&quantidade=${qty}`;
    await window.printLabelViaAgent(zplUrl, htmlUrl, {
        width: 720,
        height: 540
    });
    closeModal('modal-imprimir-etiqueta');
}
