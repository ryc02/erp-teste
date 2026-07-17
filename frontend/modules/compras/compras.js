window.Modulo_compras = (function() {
    let ordens = [];
    let produtosCatalog = [];
    let novaOC_itens = [];

    async function init() {
        console.log("Módulo de Compras inicializado.");
        await loadOrdens();
        await loadCatalog();
    }

    async function loadCatalog() {
        try {
            const data = await apiFetch('/produtos/catalogo?status=ativos');
            produtosCatalog = data;
            const select = document.getElementById('oc-produto-select');
            if(select) {
                select.innerHTML = '<option value="">Selecione um produto...</option>';
                data.forEach(p => {
                    select.innerHTML += `<option value="${p.id}" data-preco="${p.preco_base || 0}">${p.sku} - ${p.nome}</option>`;
                });
                
                select.addEventListener('change', (e) => {
                    const opt = e.target.options[e.target.selectedIndex];
                    if(opt && opt.value) {
                        // set default cost to half the selling price or 0
                        const preco = parseFloat(opt.getAttribute('data-preco')) || 0;
                        document.getElementById('oc-produto-preco').value = (preco * 0.5).toFixed(2);
                    }
                });
            }
        } catch(e) {
            console.error("Erro ao carregar catálogo:", e);
        }
    }

    async function loadOrdens() {
        try {
            const data = await apiFetch('/compras/ordens');
            ordens = data;
            renderOrdensTable();
            updateDashboard(data);
        } catch(e) {
            console.error("Erro ao carregar ordens de compra:", e);
            document.getElementById('compras-table-body').innerHTML = `<tr><td colspan="7" style="text-align: center; color: #ef4444;">Erro ao carregar dados.</td></tr>`;
        }
    }

    function updateDashboard(lista) {
        let rascunho = 0, aguardando = 0, recebidas = 0;
        lista.forEach(o => {
            if(o.status === 'RASCUNHO') rascunho++;
            if(o.status === 'AGUARDANDO_RECEBIMENTO') aguardando++;
            if(o.status === 'RECEBIDO') recebidas++;
        });
        document.getElementById('stat-rascunho').textContent = rascunho;
        document.getElementById('stat-aguardando').textContent = aguardando;
        document.getElementById('stat-recebidas').textContent = recebidas;
    }

    function renderOrdensTable() {
        const tbody = document.getElementById('compras-table-body');
        tbody.innerHTML = '';

        if(ordens.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 20px;">Nenhuma ordem de compra encontrada.</td></tr>`;
            return;
        }

        ordens.forEach(o => {
            const tr = document.createElement('tr');
            let badgeClass = 'badge-secondary';
            if(o.status === 'AGUARDANDO_RECEBIMENTO') badgeClass = 'badge-warning';
            if(o.status === 'RECEBIDO') badgeClass = 'badge-success';
            if(o.status === 'CANCELADO') badgeClass = 'badge-danger';

            const total = (o.valor_total || 0).toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'});
            const date = new Date(o.data_emissao).toLocaleDateString('pt-BR');

            tr.innerHTML = `
                <td>#${o.id.toString().padStart(4, '0')}</td>
                <td>${o.fornecedor_nome}</td>
                <td>${date}</td>
                <td><span class="badge ${badgeClass}">${o.status.replace('_', ' ')}</span></td>
                <td>${o.itens.length}</td>
                <td>${total}</td>
                <td style="text-align: right;">
                    <button class="btn-icon" onclick="window.Modulo_compras.viewOC(${o.id})" title="Detalhes">
                        <i class="ph ph-eye"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }

    // Modal Nova OC
    function openNovaOCModal() {
        novaOC_itens = [];
        document.getElementById('oc-fornecedor').value = '';
        document.getElementById('oc-observacoes').value = '';
        document.getElementById('oc-frete').value = '0.00';
        document.getElementById('oc-desconto').value = '0.00';
        
        renderNovaOCItens();
        atualizarResumoTotais();
        switchTab('dados');
        document.getElementById('modal-nova-oc').classList.add('active');
    }

    function closeNovaOCModal() {
        document.getElementById('modal-nova-oc').classList.remove('active');
    }

    function switchTab(tabId) {
        document.querySelectorAll('#modal-nova-oc .tab-pane').forEach(el => el.style.display = 'none');
        document.getElementById('tab-content-' + tabId).style.display = 'block';
        
        document.querySelectorAll('#modal-nova-oc .tab-btn').forEach(el => {
            el.classList.remove('active');
            el.style.borderBottomColor = 'transparent';
            el.style.color = 'var(--text-secondary)';
        });
        const activeBtn = document.getElementById('tab-btn-' + tabId);
        activeBtn.classList.add('active');
        activeBtn.style.borderBottomColor = 'var(--accent)';
        activeBtn.style.color = 'var(--text-primary)';
    }

    function adicionarItem() {
        const prodSelect = document.getElementById('oc-produto-select');
        const prodId = parseInt(prodSelect.value);
        if(!prodId) {
            alert("Selecione um produto.");
            return;
        }
        
        const nome = prodSelect.options[prodSelect.selectedIndex].text;
        const qtd = parseFloat(document.getElementById('oc-produto-qtd').value) || 1;
        const preco = parseFloat(document.getElementById('oc-produto-preco').value) || 0;

        novaOC_itens.push({
            produto_id: prodId,
            nome: nome,
            quantidade: qtd,
            preco_unitario: preco
        });

        // reset
        prodSelect.value = '';
        document.getElementById('oc-produto-qtd').value = '1';
        document.getElementById('oc-produto-preco').value = '0.00';
        
        renderNovaOCItens();
        atualizarResumoTotais();
    }

    function removerItem(index) {
        novaOC_itens.splice(index, 1);
        renderNovaOCItens();
        atualizarResumoTotais();
    }

    function renderNovaOCItens() {
        const tbody = document.getElementById('oc-itens-tbody');
        tbody.innerHTML = '';
        
        if(novaOC_itens.length === 0) {
            tbody.innerHTML = `<tr id="oc-itens-empty"><td colspan="5" style="text-align: center; padding: 20px; color: var(--text-secondary);">Nenhum produto adicionado.</td></tr>`;
            return;
        }
        
        novaOC_itens.forEach((item, i) => {
            const subtotal = item.quantidade * item.preco_unitario;
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td style="padding: 12px;">${item.nome}</td>
                <td style="text-align: right; padding: 12px;">R$ ${item.preco_unitario.toFixed(2)}</td>
                <td style="text-align: right; padding: 12px;">${item.quantidade}</td>
                <td style="text-align: right; padding: 12px;">R$ ${subtotal.toFixed(2)}</td>
                <td style="text-align: center;">
                    <button class="btn-icon" style="color: var(--danger);" onclick="window.Modulo_compras.removerItem(${i})"><i class="ph ph-trash"></i></button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }

    function atualizarResumoTotais() {
        const subtotal = novaOC_itens.reduce((acc, item) => acc + (item.quantidade * item.preco_unitario), 0);
        const frete = parseFloat(document.getElementById('oc-frete').value) || 0;
        const desconto = parseFloat(document.getElementById('oc-desconto').value) || 0;
        const total = subtotal + frete - desconto;

        document.getElementById('oc-resumo-subtotal').textContent = subtotal.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'});
        document.getElementById('oc-resumo-frete').textContent = '+ ' + frete.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'});
        document.getElementById('oc-resumo-desconto').textContent = '- ' + desconto.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'});
        document.getElementById('oc-resumo-total').textContent = total.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'});
    }

    async function salvarOC() {
        const fornecedor = document.getElementById('oc-fornecedor').value.trim();
        if(!fornecedor) {
            alert("Informe o fornecedor.");
            switchTab('dados');
            return;
        }
        if(novaOC_itens.length === 0) {
            alert("Adicione pelo menos um item.");
            switchTab('itens');
            return;
        }

        const payload = {
            fornecedor_nome: fornecedor,
            valor_frete: parseFloat(document.getElementById('oc-frete').value) || 0,
            desconto_valor: parseFloat(document.getElementById('oc-desconto').value) || 0,
            observacoes: document.getElementById('oc-observacoes').value,
            status: 'RASCUNHO',
            itens: novaOC_itens.map(i => ({
                produto_id: i.produto_id,
                quantidade: i.quantidade,
                preco_unitario: i.preco_unitario
            }))
        };

        try {
            await apiFetch('/compras/ordens', 'POST', payload);
            closeNovaOCModal();
            loadOrdens();
            ui.showNotify("Ordem de Compra salva como Rascunho!");
        } catch(e) {
            alert("Erro ao salvar OC: " + e.message);
        }
    }

    // View OC
    let currentViewOC = null;
    
    async function viewOC(id) {
        try {
            currentViewOC = await apiFetch('/compras/ordens/' + id);
            
            document.getElementById('view-oc-id').textContent = currentViewOC.id.toString().padStart(4, '0');
            document.getElementById('view-oc-fornecedor').textContent = currentViewOC.fornecedor_nome;
            document.getElementById('view-oc-data').textContent = new Date(currentViewOC.data_emissao).toLocaleString('pt-BR');
            
            const statusEl = document.getElementById('view-oc-status');
            statusEl.textContent = currentViewOC.status.replace('_', ' ');
            statusEl.className = 'badge';
            if(currentViewOC.status === 'RASCUNHO') statusEl.classList.add('badge-secondary');
            if(currentViewOC.status === 'AGUARDANDO_RECEBIMENTO') statusEl.classList.add('badge-warning');
            if(currentViewOC.status === 'RECEBIDO') statusEl.classList.add('badge-success');
            
            const tbody = document.getElementById('view-oc-itens');
            tbody.innerHTML = '';
            currentViewOC.itens.forEach(i => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td style="padding: 8px;">Produto #${i.produto_id}</td>
                    <td style="text-align: right; padding: 8px;">${i.quantidade}</td>
                    <td style="text-align: right; padding: 8px;">R$ ${(i.quantidade * i.preco_unitario).toFixed(2)}</td>
                `;
                tbody.appendChild(tr);
            });
            
            document.getElementById('view-oc-total').textContent = (currentViewOC.valor_total || 0).toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'});
            
            // Render Actions
            const actionsDiv = document.getElementById('view-oc-actions');
            actionsDiv.innerHTML = '';
            
            if(currentViewOC.status === 'RASCUNHO') {
                actionsDiv.innerHTML = `
                    <button class="btn btn-primary" onclick="window.Modulo_compras.aprovarOC()"><i class="ph ph-check"></i> Aprovar Ordem (Aguardar Recebimento)</button>
                `;
            } else if (currentViewOC.status === 'AGUARDANDO_RECEBIMENTO') {
                actionsDiv.innerHTML = `
                    <button class="btn btn-success" onclick="window.Modulo_compras.receberOC()" style="background: var(--success);"><i class="ph ph-truck"></i> Receber Mercadoria (Baixa no Estoque)</button>
                `;
            }
            
            document.getElementById('modal-view-oc').classList.add('active');
        } catch(e) {
            alert("Erro ao carregar detalhes: " + e.message);
        }
    }
    
    function closeViewOCModal() {
        document.getElementById('modal-view-oc').classList.remove('active');
        currentViewOC = null;
    }
    
    async function aprovarOC() {
        if(!currentViewOC) return;
        if(!confirm("Deseja aprovar esta ordem? Ela ficará aguardando recebimento.")) return;
        try {
            await apiFetch(`/compras/ordens/${currentViewOC.id}/aprovar`, 'POST');
            ui.showNotify("OC Aprovada!");
            closeViewOCModal();
            loadOrdens();
        } catch(e) {
            alert("Erro ao aprovar: " + e.message);
        }
    }
    
    async function receberOC() {
        if(!currentViewOC) return;
        if(!confirm("Atenção: Ao confirmar, o saldo físico dos produtos no Módulo de Estoque será incrementado. Deseja continuar?")) return;
        try {
            const btn = document.querySelector('#view-oc-actions button');
            if(btn) { btn.disabled = true; btn.textContent = 'Processando...'; }
            
            await apiFetch(`/compras/ordens/${currentViewOC.id}/receber`, 'POST');
            ui.showNotify("Mercadoria recebida e estoque atualizado!");
            closeViewOCModal();
            loadOrdens();
        } catch(e) {
            alert("Erro ao receber: " + e.message);
            closeViewOCModal();
        }
    }

    return {
        init,
        loadOrdens,
        openNovaOCModal,
        closeNovaOCModal,
        switchTab,
        adicionarItem,
        removerItem,
        atualizarResumoTotais,
        salvarOC,
        viewOC,
        closeViewOCModal,
        aprovarOC,
        receberOC
    };
})();
