// === PCP / PRODUÇÃO (MODULAR) ===

window.Modulo_pcp = {
    ops: [],
    highlightTimeoutId: null,

    async init() {
        console.log("Modulo de PCP inicializado");
        try {
            await ensureProductCatalog();
        } catch(e) { console.error(e); }
        this.loadOPs();
        this.populateOPProductSelect();
    },

    switchTab(tabId) {
        document.querySelectorAll('#view-pcp .tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('onclick').includes(tabId));
        });
        document.querySelectorAll('#view-pcp .tab-content').forEach(content => {
            content.classList.toggle('active', content.id === tabId);
        });
        if (tabId === 'pcp-tab-timeline') {
            this.renderTimeline();
        }
    },

    refresh() {
        this.loadOPs();
    },

    async loadOPs() {
        try {
            const res = await apiFetch('/pcp/ordens');
            const ops = await res.json();
            this.ops = ops;
            
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

            if (document.getElementById('stat-pcp-total')) document.getElementById('stat-pcp-total').innerText = total;
            if (document.getElementById('stat-pcp-andamento')) document.getElementById('stat-pcp-andamento').innerText = emAndamento;
            if (document.getElementById('stat-pcp-eficiencia')) document.getElementById('stat-pcp-eficiencia').innerText = eficienciaMedia.toFixed(1) + '%';

            const tbody = document.querySelector('#table-op tbody');
            if (!tbody) return;

            tbody.innerHTML = ops.map(op => {
                return `
                    <tr data-op-id="${op.id}">
                        <td>#${op.id}</td>
                        <td>
                            <strong>${op.produto ? op.produto.nome : 'Produto #' + op.produto_id}</strong>
                            <small style="display: block; color: var(--text-secondary); margin-top: 4px;">
                                Criada em ${formatDate(op.created_at)}
                            </small>
                        </td>
                        <td>${op.quantidade_planejada}</td>
                        <td>${op.quantidade_produzida || 0}</td>
                        <td><span class="badge ${this.getOPStatusBadge(op.status)}">${op.status}</span></td>
                        <td>
                            <div class="flex-gap">
                                <button class="btn btn-outline" onclick="window.openDocumentViaAgent('${API_URL}/relatorios/ordem_producao/${op.id}/pdf?token=' + sessionStorage.getItem('token'), { preferAppMode: true, width: 1280, height: 900, documentKind: 'pdf' })" title="Gerar PDF">
                                    <i class="ph ph-file-pdf"></i>
                                </button>
                                ${op.status === 'PLANEJADA' ? `
                                    <button class="btn btn-sm btn-primary" onclick="Modulo_pcp.iniciarOP(${op.id})">
                                        <i class="ph ph-play"></i> Iniciar
                                    </button>
                                ` : ''}
                                ${op.status === 'EM_ANDAMENTO' ? `
                                    <button class="btn btn-sm btn-success" onclick="Modulo_pcp.concluirOPPrompt(${op.id}, ${op.quantidade_planejada})">
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

            this.renderTimeline();
        } catch (e) { console.error(e); }
    },

    getOPStatusBadge(status) {
        if (status === 'PLANEJADA') return 'badge-info';
        if (status === 'EM_ANDAMENTO') return 'badge-warning';
        if (status === 'CONCLUIDA') return 'badge-success';
        if (status === 'CANCELADA') return 'badge-danger';
        return 'badge-info';
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

    focusOP(id) {
        this.switchTab('pcp-tab-lista');
        this.highlightRow(`#table-op tbody tr[data-op-id="${id}"]`);
    },

    renderTimeline() {
        const container = document.getElementById('pcp-gantt-container');
        if (!container) return;

        if (this.ops.length === 0) {
            container.innerHTML = '<p style="text-align:center; padding: 40px; color: var(--text-secondary);">Sem Ordens de Produção para exibir no cronograma.</p>';
            return;
        }

        // Simulação de Timeline Premium
        const sorted = [...this.ops].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        
        container.innerHTML = `
            <div class="timeline-wrapper" style="display: flex; flex-direction: column; gap: 16px;">
                ${sorted.map(op => {
                    const progress = ((op.quantidade_produzida || 0) / op.quantidade_planejada) * 100;
                    const dateStr = formatDate(op.created_at);
                    return `
                        <div class="timeline-item card" style="padding: 16px; border-left: 4px solid var(${op.status === 'EM_ANDAMENTO' ? '--warning' : (op.status === 'CONCLUIDA' ? '--success' : '--info')});">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                                <div>
                                    <span style="font-weight: 800; color: var(--accent);">OP #${op.id}</span>
                                    <span style="margin-left: 12px; font-weight: 600;">${op.produto ? op.produto.nome : 'Produto #' + op.produto_id}</span>
                                </div>
                                <span class="badge ${this.getOPStatusBadge(op.status)}">${op.status}</span>
                            </div>
                            <div style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 8px;">
                                <i class="ph ph-calendar"></i> Criada em ${dateStr} | Qtd: ${op.quantidade_planejada}
                            </div>
                            <div class="progress-container" style="height: 10px; background: rgba(255,255,255,0.05); border-radius: 5px; overflow: hidden;">
                                <div class="progress-bar" style="width: ${progress}%; height: 100%; background: var(--accent); transition: width 0.5s ease;"></div>
                            </div>
                            <div style="text-align: right; font-size: 0.75rem; color: var(--text-secondary); margin-top: 4px;">
                                ${progress.toFixed(0)}% Concluído
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    },

    async saveOP(e) {
        e.preventDefault();
        const data = {
            produto_id: parseInt(document.getElementById('op-produto-sel').value),
            quantidade_planejada: parseFloat(document.getElementById('op-qtd').value)
        };

        try {
            const res = await apiFetch('/pcp/ordens', {
                method: 'POST',
                body: JSON.stringify(data)
            });

            if (res.ok) {
                showNotify("Ordem de Produção criada!", "success");
                closeModal('modal-nova-op');
                this.loadOPs();
            } else {
                const err = await res.json();
                showNotify(err.detail || "Erro ao criar OP. Verifique se o produto tem ficha técnica.", "error");
            }
        } catch (e) { console.error(e); }
    },

    async iniciarOP(id) {
        const confirmed = await confirmAction("Iniciar Produção?", "Deseja iniciar esta produção? O estoque das matérias-primas será baixado.", { icon: 'ph ph-play-circle', color: 'var(--primary)' });
        if (!confirmed) return;
        try {
            const res = await apiFetch(`/pcp/ordens/${id}/iniciar`, { method: 'POST' });
            if (res.ok) {
                showNotify("Produção Iniciada!", "success");
                if (window.invalidateProductCatalog) window.invalidateProductCatalog();
                this.loadOPs();
                if (window.Modulo_produtos) window.Modulo_produtos.loadProducts();
            } else {
                const err = await res.json();
                showNotify(err.detail || "Erro ao iniciar OP", "error");
            }
        } catch (e) { console.error(e); }
    },

    concluirOPPrompt(id, planejada) {
        const qtd = prompt("Quantidade produzida final:", planejada);
        if (qtd !== null) {
            this.concluirOP(id, parseFloat(qtd));
        }
    },

    async concluirOP(id, quantidade) {
        try {
            const res = await apiFetch(`/pcp/ordens/${id}/concluir?quantidade_produzida=${quantidade}`, { 
                method: 'POST' 
            });
            if (res.ok) {
                showNotify("Produção Concluída! Produto final adicionado ao estoque.", "success");
                if (window.invalidateProductCatalog) window.invalidateProductCatalog();
                this.loadOPs();
                if (window.Modulo_produtos) window.Modulo_produtos.loadProducts();
            } else {
                const err = await res.json();
                showNotify(err.detail || "Erro ao concluir OP", "error");
            }
        } catch (e) { console.error(e); }
    },

    // === FICHA TÉCNICA ===
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
                    <button type="button" class="table-action-icon text-danger" onclick="Modulo_pcp.removerFichaTecnica(${item.id})">
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
        const componentes = state.productCatalog.filter(p => p.id !== prodId);
        
        sel.innerHTML = '<option value="">Selecione Matéria-Prima</option>' + 
                        componentes.map(p => `<option value="${p.id}">${p.nome} (${p.sku})</option>`).join('');
    },

    populateOPProductSelect() {
        const sel = document.getElementById('op-produto-sel');
        if (!sel) return;

        // Apenas produtos compostos podem ter OP
        const compostos = state.productCatalog.filter(p => p.tipo_produto === 'Composto');
        sel.innerHTML = compostos.map(p => `<option value="${p.id}">${p.nome}</option>`).join('');
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
        const confirmed = await confirmAction("Remover Componente?", "Deseja remover este item da ficha técnica?", { icon: 'ph ph-trash', color: '#ef4444' });
        if (!confirmed) return;
        try {
            const res = await apiFetch(`/pcp/ficha_tecnica/${id}`, { method: 'DELETE' });
            if (res.ok) {
                showNotify("Item removido", "success");
                const prodId = document.getElementById('prod-id').value;
                this.loadFichaTecnica(prodId);
            }
        } catch (e) { console.error(e); }
    }
}
