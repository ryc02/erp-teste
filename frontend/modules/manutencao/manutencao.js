// === GESTÃO DE MANUTENÇÃO (MODULAR) ===

window.Modulo_manutencao = {
    currentOSId: null,
    maquinas: [],
    ordensServico: [],
    highlightTimeoutId: null,

    async init() {
        console.log("Modulo de Manutenção inicializado");
        try {
            await ensureProductCatalog();
        } catch(e) { console.error(e); }
        this.loadManutencao();
    },

    refresh() {
        this.loadManutencao();
    },

    async loadManutencao() {
        try {
            const [maqRes, osRes] = await Promise.all([
                apiFetch('/manutencao/maquinas'),
                apiFetch('/manutencao/os')
            ]);
            
            const maquinas = await maqRes.json();
            const ordens = await osRes.json();

            this.maquinas = maquinas;
            this.ordensServico = ordens;
            
            this.renderMaquinas(maquinas);
            this.renderOrdensServico(ordens);
            
            // Atualizar stats - Apenas as OPERANTES
            const ativas = maquinas.filter(m => m.status === 'OPERANTE').length;
            if (document.getElementById('stat-maquinas-total')) document.getElementById('stat-maquinas-total').innerText = ativas;
            if (document.getElementById('stat-os-abertas')) document.getElementById('stat-os-abertas').innerText = ordens.filter(o => o.status === 'ABERTA').length;
            
            // Popular selects de máquinas nos modais
            this.populateMaquinaSelects(maquinas);
        } catch (e) { console.error(e); }
    },

    populateMaquinaSelects(maqs) {
        const sel = document.getElementById('os-maquina-sel');
        if (!sel) return;
        sel.innerHTML = '<option value="">Selecione a Máquina...</option>' + 
                        maqs.map(m => `<option value="${m.id}">${m.nome} (${m.tipo})</option>`).join('');
    },

    renderMaquinas(maqs) {
        const tbody = document.querySelector('#table-maquinas tbody');
        if (!tbody) return;
        tbody.innerHTML = maqs.map(m => `
            <tr data-maquina-id="${m.id}">
                <td><strong>${m.nome}</strong></td>
                <td>${m.tipo || '-'}</td>
                <td>${m.capacidade || '-'}</td>
                <td><span class="badge ${m.status === 'OPERANTE' ? 'badge-success' : 'badge-danger'}">${m.status}</span></td>
                <td>
                    <div class="flex-gap">
                        <button class="table-action-icon" onclick="Modulo_manutencao.abrirNovaOS(${m.id})" title="Abrir OS">
                            <i class="ph ph-wrench"></i>
                        </button>
                        <button class="table-action-icon text-danger" onclick="Modulo_manutencao.excluirMaquina(${m.id})" title="Excluir Máquina">
                            <i class="ph ph-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    },

    async excluirMaquina(id) {
        console.log("Excluindo máquina ID:", id);
        if (!id) { console.error("ID inválido"); return; }
        
        const confirmed = await confirmAction("Excluir Máquina?", "Deseja realmente excluir esta máquina? Isso removerá o histórico de OS vinculado a ela.", { color: '#ef4444', icon: 'ph ph-trash' });
        if (!confirmed) return;
        
        try {
            const res = await apiFetch(`/manutencao/maquinas/${id}`, { method: 'DELETE' });
            if (res.ok) {
                showNotify("Máquina excluída com sucesso!", "success");
                this.loadManutencao();
                if (window.Modulo_dashboard) window.Modulo_dashboard.loadStats();
            } else {
                const err = await res.json();
                showNotify(err.detail || "Erro ao excluir máquina.", "error");
            }
        } catch (e) { console.error(e); }
    },

    renderOrdensServico(oss) {
        const tbody = document.querySelector('#table-os tbody');
        if (!tbody) return;
        
        tbody.innerHTML = oss.map(os => `
            <tr data-os-id="${os.id}">
                <td>#${os.id}</td>
                <td>
                    <strong>${os.maquina?.nome || (os.maquina_id ? `Máquina #${os.maquina_id}` : 'Máquina removida')}</strong>
                    <small style="display: block; color: var(--text-secondary); margin-top: 4px;">
                        ${os.maquina?.tipo || 'Sem tipo informado'}
                    </small>
                </td>
                <td><span class="badge badge-info">${os.tipo}</span></td>
                <td><span class="badge ${os.status === 'ABERTA' ? 'badge-warning' : 'badge-success'}">${os.status}</span></td>
                <td>${formatCurrency(os.custo_total)}</td>
                <td>
                    <div class="flex-gap">
                        <button class="btn btn-sm btn-primary" onclick="Modulo_manutencao.abrirGerenciarOS(${os.id})">
                            <i class="ph ph-gear"></i> Gerenciar
                        </button>
                        <button class="table-action-icon text-danger" onclick="Modulo_manutencao.excluirOS(${os.id})">
                            <i class="ph ph-trash"></i> Excluir
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');

        if (oss.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align:center">Nenhuma OS encontrada.</td></tr>';
        }
    },

    prepareNewMaquina() {
        document.getElementById('maq-id').value = '';
        document.getElementById('form-maquina').reset();
        openModal('modal-maquina');
    },

    highlightRow(selector) {
        const row = document.querySelector(selector);
        if (!row) return;

        row.scrollIntoView({ behavior: 'smooth', block: 'center' });
        row.classList.add('row-highlight');

        if (this.highlightTimeoutId) {
            clearTimeout(this.highlightTimeoutId);
        }

        this.highlightTimeoutId = window.setTimeout(() => {
            row.classList.remove('row-highlight');
        }, 2200);
    },

    focusMaquina(id) {
        this.highlightRow(`#table-maquinas tbody tr[data-maquina-id="${id}"]`);
    },

    focusOS(id) {
        this.highlightRow(`#table-os tbody tr[data-os-id="${id}"]`);
    },

    async excluirOS(id) {
        console.log("Excluindo OS:", id);
        const os = this.ordensServico.find(item => item.id == id);
        if (!os) {
            console.error("OS não encontrada no estado local:", id, this.ordensServico);
        }

        const maquinaNome = os?.maquina?.nome || (os?.maquina_id ? `Máquina #${os.maquina_id}` : 'máquina removida');
        const descricao = os?.tipo ? `${os.tipo} - ${maquinaNome}` : maquinaNome;

        const confirmed = await confirmAction(`Excluir Ordem de Serviço?`, `#${id} - ${descricao}`, { color: '#ef4444', icon: 'ph ph-trash' });
        if (!confirmed) return;

        try {
            const res = await apiFetch(`/manutencao/os/${id}`, { method: 'DELETE' });

            if (res.ok) {
                showNotify("OS excluída com sucesso!", "success");

                if (this.currentOSId == id) {
                    this.currentOSId = null;
                    closeModal('modal-gerenciar-os');
                }

                await this.loadManutencao();
                if (window.Modulo_dashboard) window.Modulo_dashboard.loadStats();
                if (window.Modulo_gestao_fabrica) window.Modulo_gestao_fabrica.loadCockpit();
            } else {
                const err = await res.json();
                showNotify(err.detail || "Erro ao excluir OS.", "error");
            }
        } catch (e) {
            console.error(e);
            showNotify("Falha na conexão ao excluir OS.", "error");
        }
    },

    async excluirOSAtual() {
        if (!this.currentOSId) {
            showNotify("Nenhuma OS selecionada para exclusão.", "warning");
            return;
        }

        await this.excluirOS(this.currentOSId);
    },

    async saveMaquina(e) {
        console.log("Salvando máquina...");
        e.preventDefault();
        const id = document.getElementById('maq-id').value;
        const data = {
            nome: document.getElementById('maq-nome').value,
            tipo: document.getElementById('maq-tipo').value,
            capacidade: document.getElementById('maq-cap').value
        };

        try {
            const method = id ? 'PUT' : 'POST';
            const url = id ? `/manutencao/maquinas/${id}` : `/manutencao/maquinas`;
            
            const res = await apiFetch(url, {
                method: method,
                body: JSON.stringify(data)
            });

            if (res.ok) {
                showNotify("Máquina salva com sucesso!", "success");
                closeModal('modal-maquina');
                this.loadManutencao();
                if (window.Modulo_dashboard) window.Modulo_dashboard.loadStats();
            } else {
                const err = await res.json();
                showNotify(err.detail || "Erro ao salvar máquina.", "error");
            }
        } catch (e) {
            console.error(e);
            showNotify("Falha na conexão ao salvar a máquina.", "error");
        }
    },

    abrirNovaOS(id, nome = null) {
        const form = document.getElementById('form-os');
        if (form) form.reset();
        
        if (id) {
            const maquina = this.maquinas.find(item => item.id === id);
            const nomeExibicao = nome || maquina?.nome || `Máquina #${id}`;
            document.getElementById('os-maquina-id').value = id;
            document.getElementById('os-maquina-sel').style.display = 'none';
            document.getElementById('os-maquina-info').style.display = 'block';
            document.getElementById('os-maquina-nome-label').innerText = nomeExibicao;
        } else {
            document.getElementById('os-maquina-id').value = '';
            document.getElementById('os-maquina-sel').style.display = 'block';
            document.getElementById('os-maquina-info').style.display = 'none';
        }
        openModal('modal-os');
    },

    async saveOS(e) {
        e.preventDefault();
        const maquinaId = document.getElementById('os-maquina-id').value || document.getElementById('os-maquina-sel').value;
        
        if (!maquinaId) return showNotify("Selecione uma máquina.", "warning");

        const data = {
            maquina_id: parseInt(maquinaId),
            tipo: document.getElementById('os-tipo').value,
            problema_desc: document.getElementById('os-problema').value
        };

        try {
            const res = await apiFetch('/manutencao/os', {
                method: 'POST',
                body: JSON.stringify(data)
            });

            if (res.ok) {
                showNotify("Ordem de Serviço aberta!", "success");
                closeModal('modal-os');
                this.loadManutencao();
                if (window.Modulo_dashboard) window.Modulo_dashboard.loadStats();
            } else {
                const err = await res.json();
                showNotify(err.detail || "Erro ao abrir OS", "error");
            }
        } catch (e) { console.error(e); }
    },

    async abrirGerenciarOS(id) {
        this.currentOSId = id;
        try {
            const res = await apiFetch('/manutencao/os');
            const oss = await res.json();
            const os = oss.find(o => o.id == id);
            
            if (!os) return;

            this.ordensServico = oss;

            document.getElementById('manage-os-title').innerText = `Gerenciar OS #${os.id}`;
            document.getElementById('manage-os-subtitle').innerText = `${os.maquina?.nome || (os.maquina_id ? `Máquina #${os.maquina_id}` : 'Máquina removida')} | Aberta em: ${formatDate(os.data_abertura)}`;
            
            const statusEl = document.getElementById('manage-os-status');
            statusEl.innerText = os.status;
            statusEl.className = `badge ${os.status === 'ABERTA' ? 'badge-warning' : 'badge-success'}`;

            document.getElementById('os-mao-obra').value = os.custo_mao_obra || 0;
            
            this.renderItensOS(os.itens || []);
            document.getElementById('os-total-valor').innerText = formatCurrency(os.custo_total);

            this.populatePecaSelect();

            openModal('modal-gerenciar-os');
            this.switchTabOS('os-tab-pecas');
            this.focusOS(id);
        } catch (e) { console.error(e); }
    },

    populatePecaSelect() {
        const sel = document.getElementById('os-peca-sel');
        if (!sel) return;
        sel.innerHTML = '<option value="">Selecione Peça/Insumo...</option>' + 
                        state.productCatalog.map(p => `<option value="${p.id}">${p.nome} (Estoque: ${p.estoque_atual})</option>`).join('');
    },

    renderItensOS(itens) {
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
    },

    async adicionarPecaOS() {
        const pecaId = document.getElementById('os-peca-sel').value;
        const qtd = document.getElementById('os-peca-qtd').value;
        
        if (!pecaId || !qtd) return showNotify("Selecione a peça e a quantidade.", "warning");

        const produto = state.productCatalog.find(p => p.id == pecaId);
        const custo = produto ? (produto.preco_venda * 0.7) : 0; 

        const data = {
            produto_id: parseInt(pecaId),
            quantidade: parseFloat(qtd),
            custo_unitario: custo
        };

        try {
            const res = await apiFetch(`/manutencao/os/${this.currentOSId}/adicionar-item`, {
                method: 'POST',
                body: JSON.stringify(data)
            });

            if (res.ok) {
                showNotify("Item adicionado e estoque baixado!", "success");
                if (window.invalidateProductCatalog) window.invalidateProductCatalog();
                document.getElementById('os-peca-qtd').value = '';
                this.abrirGerenciarOS(this.currentOSId); 
                if (window.Modulo_produtos) window.Modulo_produtos.loadProducts();
            } else {
                const err = await res.json();
                showNotify(err.detail || "Erro ao adicionar item", "error");
            }
        } catch (e) { console.error(e); }
    },

    async finalizarOS() {
        const confirmed = await confirmAction("Finalizar OS?", "Confirmar a finalização desta OS? A máquina voltará ao status OPERANTE.", { color: 'var(--success)', icon: 'ph ph-check-circle' });
        if (!confirmed) return;

        const custoMaoObra = parseFloat(document.getElementById('os-mao-obra').value) || 0;

        try {
            const res = await apiFetch(`/manutencao/os/${this.currentOSId}/finalizar`, {
                method: 'POST',
                body: JSON.stringify({ custo_mao_obra: custoMaoObra })
            });
            if (res.ok) {
                showNotify("Ordem de Serviço finalizada!", "success");
                closeModal('modal-gerenciar-os');
                this.loadManutencao();
                if (window.Modulo_dashboard) window.Modulo_dashboard.loadStats();
            }
        } catch (e) { console.error(e); }
    },

    switchTabOS(tabId) {
        document.querySelectorAll('.tab-content-os').forEach(t => t.style.display = 'none');
        document.querySelectorAll('#modal-gerenciar-os .tab-btn').forEach(b => b.classList.remove('active'));
        
        document.getElementById(tabId).style.display = 'block';
        const btnIdx = tabId === 'os-tab-pecas' ? 0 : 1;
        document.querySelectorAll('#modal-gerenciar-os .tab-btn')[btnIdx].classList.add('active');
    }
}

window.prepareNewMaquina = function() {
    if (window.Modulo_manutencao) {
        window.Modulo_manutencao.prepareNewMaquina();
    }
};
