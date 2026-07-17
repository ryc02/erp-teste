// === GESTÃO DE MANUTENÇÃO ===

let currentOSId = null;

async function loadManutencao() {
    try {
        const [maqRes, osRes] = await Promise.all([
            fetch(`${API_URL}/manutencao/maquinas`),
            fetch(`${API_URL}/manutencao/os`)
        ]);
        
        const maquinas = await maqRes.json();
        const ordens = await osRes.json();
        
        renderMaquinas(maquinas);
        renderOrdensServico(ordens);
        
        // Atualizar stats - Apenas as OPERANTES
        const ativas = maquinas.filter(m => m.status === 'OPERANTE').length;
        document.getElementById('stat-maquinas-total').innerText = ativas;
        document.getElementById('stat-os-abertas').innerText = ordens.filter(o => o.status === 'ABERTA').length;
        
        // Popular selects de máquinas nos modais
        populateMaquinaSelects(maquinas);
    } catch (e) { console.error(e); }
}

function populateMaquinaSelects(maqs) {
    const sel = document.getElementById('os-maquina-sel');
    if (!sel) return;
    sel.innerHTML = '<option value="">Selecione a Máquina...</option>' + 
                    maqs.map(m => `<option value="${m.id}">${m.nome} (${m.tipo})</option>`).join('');
}

function renderMaquinas(maqs) {
    const tbody = document.querySelector('#table-maquinas tbody');
    if (!tbody) return;
    tbody.innerHTML = maqs.map(m => `
        <tr>
            <td><strong>${m.nome}</strong></td>
            <td>${m.tipo || '-'}</td>
            <td>${m.capacidade || '-'}</td>
            <td><span class="badge ${m.status === 'OPERANTE' ? 'badge-success' : 'badge-danger'}">${m.status}</span></td>
            <td>
                <div class="flex-gap">
                    <button class="btn btn-sm btn-outline" onclick="abrirNovaOS(${m.id}, '${m.nome}')" title="Abrir OS">
                        <i class="ph ph-wrench"></i>
                    </button>
                    <button class="btn btn-sm btn-outline text-danger" onclick="excluirMaquina(${m.id})" title="Excluir Máquina">
                        <i class="ph ph-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

window.excluirMaquina = async function(id) {
    if (!confirm("Deseja realmente excluir esta máquina? Isso removerá o histórico de OS vinculado a ela.")) return;
    
    try {
        const res = await fetch(`${API_URL}/manutencao/maquinas/${id}`, { method: 'DELETE' });
        if (res.ok) {
            showNotify("Máquina excluída com sucesso!", "success");
            loadManutencao();
            if (typeof loadStats === 'function') loadStats();
        } else {
            const err = await res.json();
            showNotify(err.detail || "Erro ao excluir máquina.", "error");
        }
    } catch (e) { console.error(e); }
}

function renderOrdensServico(oss) {
    const tbody = document.querySelector('#table-os tbody');
    if (!tbody) return;
    
    tbody.innerHTML = oss.map(os => `
        <tr>
            <td>#${os.id}</td>
            <td>${os.maquina_id}</td>
            <td><span class="badge badge-info">${os.tipo}</span></td>
            <td><span class="badge ${os.status === 'ABERTA' ? 'badge-warning' : 'badge-success'}">${os.status}</span></td>
            <td>${formatCurrency(os.custo_total)}</td>
            <td>
                <button class="btn btn-sm btn-primary" onclick="abrirGerenciarOS(${os.id})">
                    <i class="ph ph-gear"></i> Gerenciar
                </button>
            </td>
        </tr>
    `).join('');

    if (oss.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center">Nenhuma OS encontrada.</td></tr>';
    }
}

// --- MÁQUINAS ---

window.prepareNewMaquina = function() {
    document.getElementById('maq-id').value = '';
    document.getElementById('form-maquina').reset();
    openModal('modal-maquina');
}

window.saveMaquina = async function(e) {
    e.preventDefault();
    const id = document.getElementById('maq-id').value;
    const data = {
        nome: document.getElementById('maq-nome').value,
        tipo: document.getElementById('maq-tipo').value,
        capacidade: document.getElementById('maq-cap').value
    };

    try {
        const method = id ? 'PUT' : 'POST';
        const url = id ? `${API_URL}/manutencao/maquinas/${id}` : `${API_URL}/manutencao/maquinas`;
        
        const res = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (res.ok) {
            showNotify("Máquina salva com sucesso!", "success");
            closeModal('modal-maquina');
            loadManutencao();
            if (typeof loadStats === 'function') loadStats();
        }
    } catch (e) { console.error(e); }
}

// --- ORDENS DE SERVIÇO ---

window.abrirNovaOS = function(id, nome) {
    const form = document.getElementById('form-os');
    if (form) form.reset();
    
    if (id) {
        document.getElementById('os-maquina-id').value = id;
        document.getElementById('os-maquina-sel').style.display = 'none';
        document.getElementById('os-maquina-info').style.display = 'block';
        document.getElementById('os-maquina-nome-label').innerText = nome;
    } else {
        document.getElementById('os-maquina-id').value = '';
        document.getElementById('os-maquina-sel').style.display = 'block';
        document.getElementById('os-maquina-info').style.display = 'none';
    }
    openModal('modal-os');
}

window.saveOS = async function(e) {
    e.preventDefault();
    const maquinaId = document.getElementById('os-maquina-id').value || document.getElementById('os-maquina-sel').value;
    
    if (!maquinaId) return showNotify("Selecione uma máquina.", "warning");

    const data = {
        maquina_id: parseInt(maquinaId),
        tipo: document.getElementById('os-tipo').value,
        problema_desc: document.getElementById('os-problema').value
    };

    try {
        const res = await fetch(`${API_URL}/manutencao/os`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (res.ok) {
            showNotify("Ordem de Serviço aberta!", "success");
            closeModal('modal-os');
            loadManutencao();
            if (typeof loadStats === 'function') loadStats();
        } else {
            const err = await res.json();
            showNotify(err.detail || "Erro ao abrir OS", "error");
        }
    } catch (e) { console.error(e); }
}

// --- GERENCIAMENTO DE OS ---

window.abrirGerenciarOS = async function(id) {
    currentOSId = id;
    try {
        // No backend atual só temos listar todas, mas vamos filtrar ou assumir que o schemaOrdemServico já veio
        const res = await fetch(`${API_URL}/manutencao/os`);
        const oss = await res.json();
        const os = oss.find(o => o.id === id);
        
        if (!os) return;

        document.getElementById('manage-os-title').innerText = `Gerenciar OS #${os.id}`;
        document.getElementById('manage-os-subtitle').innerText = `Máquina ID: ${os.maquina_id} | Aberta em: ${formatDate(os.data_abertura)}`;
        
        const statusEl = document.getElementById('manage-os-status');
        statusEl.innerText = os.status;
        statusEl.className = `badge ${os.status === 'ABERTA' ? 'badge-warning' : 'badge-success'}`;

        // Resetar campos
        document.getElementById('os-mao-obra').value = os.custo_mao_obra || 0;
        
        // Carregar peças (itens da OS) - assumindo que o backend retorna os itens ou precisamos de outro endpoint
        // Por enquanto vamos renderizar o que temos
        renderItensOS(os.itens || []);
        document.getElementById('os-total-valor').innerText = formatCurrency(os.custo_total);

        // Popular select de peças (usando produtos do estoque)
        populatePecaSelect();

        openModal('modal-gerenciar-os');
        switchTabOS('os-tab-pecas');
    } catch (e) { console.error(e); }
}

function populatePecaSelect() {
    const sel = document.getElementById('os-peca-sel');
    if (!sel) return;
    // state.products vem do app.js
    sel.innerHTML = '<option value="">Selecione Peça/Insumo...</option>' + 
                    state.products.map(p => `<option value="${p.id}">${p.nome} (Estoque: ${p.estoque_fisico})</option>`).join('');
}

function renderItensOS(itens) {
    const tbody = document.querySelector('#table-os-pecas tbody');
    if (!tbody) return;
    tbody.innerHTML = itens.map(item => `
        <tr>
            <td>${item.produto ? item.produto.nome : 'Produto #' + item.produto_id}</td>
            <td>${item.quantidade}</td>
            <td>${formatCurrency(item.custo_unitario)}</td>
            <td>${formatCurrency(item.quantidade * item.custo_unitario)}</td>
        </tr>
    `).join('');
}

window.adicionarPecaOS = async function() {
    const pecaId = document.getElementById('os-peca-sel').value;
    const qtd = document.getElementById('os-peca-qtd').value;
    
    if (!pecaId || !qtd) return showNotify("Selecione a peça e a quantidade.", "warning");

    // Buscar custo unitário do produto no state
    const produto = state.products.find(p => p.id == pecaId);
    const custo = produto ? (produto.preco_venda * 0.7) : 0; // Mock de custo se não tiver campo específico

    const data = {
        produto_id: parseInt(pecaId),
        quantidade: parseFloat(qtd),
        custo_unitario: custo
    };

    try {
        const res = await fetch(`${API_URL}/manutencao/os/${currentOSId}/adicionar-item`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (res.ok) {
            showNotify("Item adicionado e estoque baixado!", "success");
            document.getElementById('os-peca-qtd').value = '';
            abrirGerenciarOS(currentOSId); // Recarregar modal
            if (typeof loadProducts === 'function') loadProducts(); // Atualizar lista de produtos se visível
        } else {
            const err = await res.json();
            showNotify(err.detail || "Erro ao adicionar item", "error");
        }
    } catch (e) { console.error(e); }
}

window.finalizarOS = async function() {
    if (!confirm("Confirmar a finalização desta OS? A máquina voltará ao status OPERANTE.")) return;

    try {
        const res = await fetch(`${API_URL}/manutencao/os/${currentOSId}/finalizar`, { method: 'POST' });
        if (res.ok) {
            showNotify("Ordem de Serviço finalizada!", "success");
            closeModal('modal-gerenciar-os');
            loadManutencao();
            if (typeof loadStats === 'function') loadStats();
        }
    } catch (e) { console.error(e); }
}

window.switchTabOS = function(tabId) {
    document.querySelectorAll('.tab-content-os').forEach(t => t.style.display = 'none');
    document.querySelectorAll('#modal-gerenciar-os .tab-btn').forEach(b => b.classList.remove('active'));
    
    document.getElementById(tabId).style.display = 'block';
    // Encontrar o botão correspondente
    const btnIdx = tabId === 'os-tab-pecas' ? 0 : 1;
    document.querySelectorAll('#modal-gerenciar-os .tab-btn')[btnIdx].classList.add('active');
}
