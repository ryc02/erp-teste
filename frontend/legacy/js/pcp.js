// === PCP / PRODUÇÃO ===

async function loadOPs() {
    try {
        const res = await fetch(`${API_URL}/pcp/ordens`);
        const ops = await res.json();
        
        // Atualizar Stats
        const total = ops.length;
        const emAndamento = ops.filter(o => o.status === 'EM_ANDAMENTO').length;
        const concluidas = ops.filter(o => o.status === 'CONCLUIDA');
        
        let eficienciaMedia = 0;
        if (concluidas.length > 0) {
            const soma = concluidas.reduce((acc, curr) => {
                const ef = (curr.quantidade_produzida / curr.quantidade_planejada) * 100;
                return acc + ef;
            }, 0);
            eficienciaMedia = soma / concluidas.length;
        }

        document.getElementById('stat-pcp-total').innerText = total;
        document.getElementById('stat-pcp-andamento').innerText = emAndamento;
        document.getElementById('stat-pcp-eficiencia').innerText = eficienciaMedia.toFixed(1) + '%';

        const tbody = document.querySelector('#table-op tbody');
        if (!tbody) return;

        tbody.innerHTML = ops.map(op => {
            return `
                <tr>
                    <td>#${op.id}</td>
                    <td><strong>${op.produto ? op.produto.nome : 'Produto #' + op.produto_id}</strong></td>
                    <td>${op.quantidade_planejada}</td>
                    <td><span class="badge ${getOPStatusBadge(op.status)}">${op.status}</span></td>
                    <td>${formatDate(op.created_at)}</td>
                    <td>
                        <div class="flex-gap">
                            <button class="btn btn-outline" onclick="window.openDocumentViaAgent('${API_URL}/relatorios/ordem_producao/${op.id}/pdf?token=' + sessionStorage.getItem('token'), { preferAppMode: true, width: 1280, height: 900, documentKind: 'pdf' })" title="Gerar PDF">
                                <i class="ph ph-file-pdf"></i>
                            </button>
                            ${op.status === 'PLANEJADA' ? `
                                <button class="btn btn-sm btn-primary" onclick="iniciarOP(${op.id})">
                                    <i class="ph ph-play"></i> Iniciar
                                </button>
                            ` : ''}
                            ${op.status === 'EM_ANDAMENTO' ? `
                                <button class="btn btn-sm btn-success" onclick="concluirOPPrompt(${op.id}, ${op.quantidade_planejada})">
                                    <i class="ph ph-check"></i> Concluir
                                </button>
                            ` : ''}
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
        
        if (ops.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align:center">Nenhuma ordem de produção encontrada.</td></tr>';
        }
    } catch (e) { console.error(e); }
}

function getOPStatusBadge(status) {
    if (status === 'PLANEJADA') return 'badge-info';
    if (status === 'EM_ANDAMENTO') return 'badge-warning';
    if (status === 'CONCLUIDA') return 'badge-success';
    if (status === 'CANCELADA') return 'badge-danger';
    return 'badge-info';
}

window.saveOP = async function(e) {
    e.preventDefault();
    const data = {
        produto_id: parseInt(document.getElementById('op-produto-sel').value),
        quantidade_planejada: parseFloat(document.getElementById('op-qtd').value)
    };

    try {
        const res = await fetch(`${API_URL}/pcp/ordens`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (res.ok) {
            showNotify("Ordem de Produção criada!", "success");
            closeModal('modal-nova-op');
            loadOPs();
        } else {
            const err = await res.json();
            showNotify(err.detail || "Erro ao criar OP. Verifique se o produto tem ficha técnica.", "error");
        }
    } catch (e) { console.error(e); }
}

window.iniciarOP = async function(id) {
    if (!confirm("Deseja iniciar esta produção? O estoque das matérias-primas será baixado.")) return;
    try {
        const res = await fetch(`${API_URL}/pcp/ordens/${id}/iniciar`, { method: 'POST' });
        if (res.ok) {
            showNotify("Produção Iniciada!", "success");
            loadOPs();
            if (typeof loadProducts === 'function') loadProducts();
        } else {
            const err = await res.json();
            showNotify(err.detail || "Erro ao iniciar OP", "error");
        }
    } catch (e) { console.error(e); }
}

window.concluirOPPrompt = function(id, planejada) {
    const qtd = prompt("Quantidade produzida final:", planejada);
    if (qtd !== null) {
        concluirOP(id, parseFloat(qtd));
    }
}

async function concluirOP(id, quantidade) {
    try {
        const res = await fetch(`${API_URL}/pcp/ordens/${id}/concluir?quantidade_produzida=${quantidade}`, { 
            method: 'POST' 
        });
        if (res.ok) {
            showNotify("Produção Concluída! Produto final adicionado ao estoque.", "success");
            loadOPs();
            if (typeof loadProducts === 'function') loadProducts();
        } else {
            const err = await res.json();
            showNotify(err.detail || "Erro ao concluir OP", "error");
        }
    } catch (e) { console.error(e); }
}

// === FICHA TÉCNICA ===
async function loadFichaTecnica(produtoId) {
    try {
        const res = await fetch(`${API_URL}/pcp/ficha_tecnica/${produtoId}`);
        const itens = await res.json();
        renderFichaTecnica(itens);
    } catch (e) { console.error(e); }
}

function renderFichaTecnica(itens) {
    const tbody = document.querySelector('#table-ficha-tecnica tbody');
    if (!tbody) return;

    tbody.innerHTML = itens.map(item => `
        <tr>
            <td>${item.produto_componente ? item.produto_componente.nome : 'Componente #' + item.produto_componente_id}</td>
            <td>${item.quantidade_necessaria}</td>
            <td>
                <button type="button" class="btn btn-sm btn-outline text-danger" onclick="removerFichaTecnica(${item.id})">
                    <i class="ph ph-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
    
    if (itens.length === 0) {
        tbody.innerHTML = '<tr><td colspan="3" style="text-align:center">Nenhum componente adicionado.</td></tr>';
    }
}

window.populateComponentSelect = function() {
    const sel = document.getElementById('sel-ficha-produto');
    if (!sel) return;

    const prodId = parseInt(document.getElementById('prod-id').value);
    const componentes = state.products.filter(p => p.id !== prodId);
    
    sel.innerHTML = '<option value="">Selecione Matéria-Prima</option>' + 
                    componentes.map(p => `<option value="${p.id}">${p.nome} (${p.sku})</option>`).join('');
}

window.adicionarFichaTecnica = async function() {
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
        const res = await fetch(`${API_URL}/pcp/ficha_tecnica/${prodId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (res.ok) {
            showNotify("Item adicionado à ficha técnica", "success");
            loadFichaTecnica(prodId);
            document.getElementById('sel-ficha-qtd').value = '';
        } else {
            const err = await res.json();
            showNotify(err.detail || "Erro ao adicionar item", "error");
        }
    } catch (e) { console.error(e); }
}

window.removerFichaTecnica = async function(id) {
    if (!confirm("Remover este item da ficha técnica?")) return;
    try {
        const res = await fetch(`${API_URL}/pcp/ficha_tecnica/${id}`, { method: 'DELETE' });
        if (res.ok) {
            showNotify("Item removido", "success");
            const prodId = document.getElementById('prod-id').value;
            loadFichaTecnica(prodId);
        }
    } catch (e) { console.error(e); }
}
