const Modulo_separacao = {
    pedidos: [],
    currentStatus: '',
    pedidoAtual: null,

    async init() {
        await this.loadPedidos();
    },

    async loadPedidos() {
        try {
            const qs = this.currentStatus ? `?status_separacao=${this.currentStatus}` : '';
            const res = await apiFetch(`/separacao/pedidos${qs}`);
            if (res.ok) {
                this.pedidos = await res.json();
                this.renderPedidos();
            }
        } catch (e) {
            console.error(e);
            showNotify("Erro ao carregar pedidos para separação", "error");
        }
    },

    refresh() {
        this.loadPedidos();
        this.limparSelecao();
    },

    filtrarStatus(status) {
        this.currentStatus = status;
        
        const btns = document.querySelectorAll('#view-separacao .tabs .tab-btn');
        btns.forEach(btn => btn.classList.remove('active'));
        const activeBtn = Array.from(btns).find(b => b.getAttribute('onclick').includes(`'${status}'`));
        if (activeBtn) activeBtn.classList.add('active');
        
        this.loadPedidos();
    },

    renderPedidos() {
        const container = document.getElementById('separacao-lista-pedidos');
        if (this.pedidos.length === 0) {
            container.innerHTML = `<p class="text-center" style="color: var(--text-secondary);">Nenhum pedido nesta fila.</p>`;
            return;
        }

        container.innerHTML = this.pedidos.map(p => {
            const dataStr = p.data_pedido ? new Date(p.data_pedido).toLocaleDateString('pt-BR') : '-';
            let color = 'var(--text-color)';
            if(p.status_separacao === 'EM_SEPARACAO') color = 'var(--warning)';
            if(p.status_separacao === 'SEPARADO' || p.status_separacao === 'CONFERIDO') color = 'var(--success)';
            
            return `
                <div class="card" style="padding: 12px; margin-bottom: 10px; cursor: pointer; border: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center; background: ${this.pedidoAtual && this.pedidoAtual.id === p.id ? 'rgba(61,165,217,0.1)' : 'var(--bg-card)'};" onclick="Modulo_separacao.selecionarPedido(${p.id})">
                    <div>
                        <div style="font-weight: bold;">Pedido #${p.id}</div>
                        <div style="font-size: 0.85rem; color: var(--text-secondary);">${p.cliente_nome}</div>
                    </div>
                    <div style="text-align: right;">
                        <span class="badge" style="color: ${color}; font-size: 0.75rem;">${p.status_separacao}</span>
                        <div style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 5px;">${dataStr} • Vol: ${p.volumes}</div>
                    </div>
                </div>
            `;
        }).join('');
    },

    async selecionarPedido(id) {
        try {
            const res = await apiFetch(`/separacao/pedidos/${id}`);
            if (res.ok) {
                this.pedidoAtual = await res.json();
                this.renderPedidos(); // Update highlight
                this.renderDetalhe();
            }
        } catch(e) {
            console.error(e);
        }
    },

    limparSelecao() {
        this.pedidoAtual = null;
        document.getElementById('separacao-detalhe-empty').style.display = 'flex';
        document.getElementById('separacao-detalhe-content').style.display = 'none';
        this.renderPedidos();
    },

    renderDetalhe() {
        const p = this.pedidoAtual;
        if(!p) return;
        
        document.getElementById('separacao-detalhe-empty').style.display = 'none';
        document.getElementById('separacao-detalhe-content').style.display = 'flex';
        
        document.getElementById('separacao-pedido-title').innerText = `Pedido #${p.id}`;
        document.getElementById('separacao-pedido-cliente').innerText = p.cliente_nome;
        document.getElementById('separacao-pedido-status').innerText = p.status_separacao;
        
        // Buttons
        const btnIniciar = document.getElementById('btn-iniciar-separacao');
        const btnConcluir = document.getElementById('btn-concluir-separacao');
        const inputArea = document.getElementById('separacao-bipagem-area');
        
        if (p.status_separacao === 'AGUARDANDO_SEPARACAO' || p.status_separacao === 'PENDENTE') {
            btnIniciar.style.display = 'inline-block';
            btnConcluir.style.display = 'none';
            inputArea.style.opacity = '0.5';
            inputArea.style.pointerEvents = 'none';
        } else if (p.status_separacao === 'EM_SEPARACAO') {
            btnIniciar.style.display = 'none';
            btnConcluir.style.display = 'inline-block';
            inputArea.style.opacity = '1';
            inputArea.style.pointerEvents = 'auto';
            setTimeout(() => document.getElementById('separacao-input-bip').focus(), 100);
        } else {
            // SEPARADO / CONFERIDO
            btnIniciar.style.display = 'none';
            btnConcluir.style.display = 'none';
            inputArea.style.opacity = '0.5';
            inputArea.style.pointerEvents = 'none';
        }

        this.atualizarListaItens();
    },

    atualizarListaItens() {
        const tbody = document.getElementById('tbody-separacao-itens');
        let totalPed = 0;
        let totalBip = 0;
        
        tbody.innerHTML = this.pedidoAtual.itens.map(it => {
            totalPed += it.quantidade;
            totalBip += it.quantidade_separada;
            
            let rowColor = 'var(--bg-card)';
            let statusIcon = '<i class="ph ph-clock" style="color:var(--text-secondary)"></i> PENDENTE';
            
            if (it.quantidade_separada >= it.quantidade) {
                rowColor = 'rgba(40,167,69,0.1)';
                statusIcon = '<i class="ph ph-check-circle" style="color:var(--success)"></i> OK';
            } else if (it.quantidade_separada > 0) {
                rowColor = 'rgba(255,193,7,0.1)';
                statusIcon = '<i class="ph ph-spinner-gap animate-spin" style="color:var(--warning)"></i> PARCIAL';
            }

            return `
                <tr style="background: ${rowColor};">
                    <td>
                        <strong>${it.nome}</strong>
                    </td>
                    <td style="font-family: monospace;">${it.sku || ''}<br><small>${it.gtin || ''}</small></td>
                    <td style="font-weight: bold;">${it.quantidade}</td>
                    <td style="font-weight: bold; color: ${it.quantidade_separada >= it.quantidade ? 'var(--success)' : 'inherit'};">${it.quantidade_separada}</td>
                    <td>${statusIcon}</td>
                </tr>
            `;
        }).join('');
        
        // Atualiza progresso
        const pct = totalPed > 0 ? (totalBip / totalPed) * 100 : 0;
        document.getElementById('separacao-progresso-text').innerText = `${totalBip}/${totalPed} Itens`;
        document.getElementById('separacao-progresso-bar').style.width = `${Math.min(pct, 100)}%`;
        
        if(pct >= 100 && this.pedidoAtual.status_separacao === 'EM_SEPARACAO') {
            document.getElementById('btn-concluir-separacao').classList.add('pulse-animation'); // Imagine we have this CSS
        }
    },

    async iniciarSeparacao() {
        if(!this.pedidoAtual) return;
        try {
            const res = await apiFetch(`/separacao/pedidos/${this.pedidoAtual.id}/iniciar`, { method: 'PUT' });
            if (res.ok) {
                const data = await res.json();
                this.pedidoAtual.status_separacao = data.status_separacao;
                showNotify("Separação iniciada", "success");
                this.renderDetalhe();
                this.loadPedidos(); // update list
            }
        } catch(e) {
            console.error(e);
        }
    },

    async concluirSeparacao() {
        if(!this.pedidoAtual) return;
        
        // Verifica se todos foram bipados
        let falta = false;
        for (let it of this.pedidoAtual.itens) {
            if (it.quantidade_separada < it.quantidade) {
                falta = true; break;
            }
        }
        if (falta) {
            if(!confirm("Atenção: A quantidade bipada é menor que o pedido. Deseja fechar a separação mesmo assim?")) {
                return;
            }
        }

        try {
            const res = await apiFetch(`/separacao/pedidos/${this.pedidoAtual.id}/concluir`, { method: 'PUT' });
            if (res.ok) {
                const data = await res.json();
                this.pedidoAtual.status_separacao = data.status_separacao;
                showNotify("Separação concluída e conferida", "success");
                this.renderDetalhe();
                this.loadPedidos();
            }
        } catch(e) {
            console.error(e);
        }
    },

    biparItem() {
        if(!this.pedidoAtual || this.pedidoAtual.status_separacao !== 'EM_SEPARACAO') return;
        
        const input = document.getElementById('separacao-input-bip');
        const codigo = input.value.trim().toLowerCase();
        
        if(!codigo) return;
        
        // Procura item na lista
        let itemEncontrado = null;
        for (let it of this.pedidoAtual.itens) {
            if ((it.sku && it.sku.toLowerCase() === codigo) || 
                (it.gtin && it.gtin.toLowerCase() === codigo) ||
                (it.produto_id.toString() === codigo)) {
                
                // Se ainda precisa bipar este item, prioriza ele
                if (it.quantidade_separada < it.quantidade) {
                    itemEncontrado = it;
                    break;
                } else if (!itemEncontrado) {
                    // Guarda o primeiro caso todos já estejam bipados (excesso)
                    itemEncontrado = it;
                }
            }
        }
        
        if (itemEncontrado) {
            itemEncontrado.quantidade_separada++;
            // Play sound?
            showNotify(`Item ${itemEncontrado.nome} bipado!`, "success");
        } else {
            // Not found
            showNotify(`Código ${codigo} não pertence a este pedido!`, "error");
            // Beep error sound
        }
        
        input.value = '';
        input.focus();
        this.atualizarListaItens();
    }
};

window.Modulo_separacao = Modulo_separacao;
