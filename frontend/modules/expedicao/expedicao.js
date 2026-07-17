window.Modulo_expedicao = {
    pedidosPendentes: [],
    selecionados: new Set(),

    async init() {
        console.log("Módulo Expedição inicializado.");
        await this.loadPendentes();
    },

    refresh() {
        this.loadPendentes();
    },

    async loadPendentes() {
        try {
            const res = await apiFetch('/expedicao/pendentes');
            if (res.ok) {
                this.pedidosPendentes = await res.json();
                this.selecionados.clear();
                this.updateSelectionUI();
                this.renderTable();
            }
        } catch (e) {
            console.error("Erro ao carregar expedição:", e);
        }
    },

    renderTable() {
        const tbody = document.querySelector('#table-expedicao-pendentes tbody');
        if (!this.pedidosPendentes || this.pedidosPendentes.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding: 30px;">Nenhum pedido aguardando expedição. 🎉</td></tr>';
            return;
        }

        tbody.innerHTML = this.pedidosPendentes.map(p => {
            const dataFmt = p.data_pedido ? new Date(p.data_pedido).toLocaleDateString('pt-BR') : '-';
            const isChecked = this.selecionados.has(p.id) ? 'checked' : '';
            
            let statusColor = 'var(--text-primary)';
            if (p.status === 'APROVADO') statusColor = 'var(--success)';
            if (p.status === 'FATURADO') statusColor = 'var(--info)';
            if (p.status === 'SEPARACAO') statusColor = 'var(--warning)';

            return `
                <tr class="${isChecked ? 'row-selected' : ''}" onclick="Modulo_expedicao.toggleRowSelection(event, ${p.id})">
                    <td style="text-align: center;" onclick="event.stopPropagation()">
                        <input type="checkbox" class="expedicao-row-cb" value="${p.id}" ${isChecked} onchange="Modulo_expedicao.toggleSelection(${p.id}, this.checked)" style="width: 18px; height: 18px; cursor: pointer;">
                    </td>
                    <td style="font-weight: 700;">#${p.id}</td>
                    <td>${dataFmt}</td>
                    <td>${p.cliente_nome || 'Consumidor Final'}</td>
                    <td style="color: ${statusColor}; font-weight: 600;">${p.status}</td>
                    <td>${p.qtd_itens} item(ns)</td>
                    <td style="font-weight: 700; color: var(--accent);">${formatCurrency(p.valor_total)}</td>
                </tr>
            `;
        }).join('');
    },

    toggleRowSelection(event, id) {
        // Ignora se clicou direto no checkbox para evitar duplo toggle
        if (event.target.tagName.toLowerCase() === 'input') return;
        
        const isSelected = this.selecionados.has(id);
        this.toggleSelection(id, !isSelected);
        this.renderTable();
    },

    toggleSelection(id, checked) {
        if (checked) {
            this.selecionados.add(id);
        } else {
            this.selecionados.delete(id);
        }
        this.updateSelectionUI();
    },

    toggleSelectAll(checkbox) {
        if (checkbox.checked) {
            this.pedidosPendentes.forEach(p => this.selecionados.add(p.id));
        } else {
            this.selecionados.clear();
        }
        this.updateSelectionUI();
        this.renderTable();
    },

    updateSelectionUI() {
        const count = this.selecionados.size;
        document.getElementById('expedicao-selected-count').innerText = count;
        
        const hasSelection = count > 0;
        document.getElementById('btn-picking').disabled = !hasSelection;
        document.getElementById('btn-etiquetas').disabled = !hasSelection;
        document.getElementById('btn-enviar').disabled = !hasSelection;

        const selectAllCb = document.getElementById('expedicao-select-all');
        if (count === 0) {
            selectAllCb.checked = false;
            selectAllCb.indeterminate = false;
        } else if (this.pedidosPendentes.length > 0 && count === this.pedidosPendentes.length) {
            selectAllCb.checked = true;
            selectAllCb.indeterminate = false;
        } else {
            selectAllCb.checked = false;
            selectAllCb.indeterminate = true;
        }
    },

    async gerarPickingList() {
        if (this.selecionados.size === 0) return;

        try {
            const payload = { pedido_ids: Array.from(this.selecionados) };
            const res = await apiFetch('/expedicao/picking', {
                method: 'POST',
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                const data = await res.json();
                this.renderPickingListModal(data);
                openModal('modal-expedicao-picking');
            }
        } catch (e) {
            console.error("Erro ao gerar picking list", e);
        }
    },

    renderPickingListModal(data) {
        const container = document.getElementById('picking-list-content');
        
        const headerHtml = `
            <div style="border-bottom: 2px solid #ccc; padding-bottom: 10px; margin-bottom: 20px;">
                <h2 style="margin: 0; color: #333;">Ordem de Separação (Picking List)</h2>
                <p style="margin: 5px 0 0 0; color: #666;">Data: ${new Date().toLocaleString('pt-BR')}</p>
                <p style="margin: 5px 0 0 0; color: #666;">Pedidos contemplados: ${data.pedidos_selecionados.join(', ')}</p>
            </div>
        `;

        const tableHtml = `
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                <thead>
                    <tr style="background: #f3f4f6; color: #374151; text-align: left;">
                        <th style="padding: 12px; border: 1px solid #d1d5db;">Localização</th>
                        <th style="padding: 12px; border: 1px solid #d1d5db;">SKU</th>
                        <th style="padding: 12px; border: 1px solid #d1d5db;">Produto</th>
                        <th style="padding: 12px; border: 1px solid #d1d5db; text-align: center;">Qtd a Separar</th>
                        <th style="padding: 12px; border: 1px solid #d1d5db; text-align: center;">Check</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.itens.map(item => `
                        <tr>
                            <td style="padding: 12px; border: 1px solid #d1d5db; font-weight: bold; color: #1f2937;">${item.localizacao}</td>
                            <td style="padding: 12px; border: 1px solid #d1d5db;">${item.codigo_sku}</td>
                            <td style="padding: 12px; border: 1px solid #d1d5db;">${item.nome}</td>
                            <td style="padding: 12px; border: 1px solid #d1d5db; text-align: center; font-size: 1.2rem; font-weight: bold;">${item.quantidade_total}</td>
                            <td style="padding: 12px; border: 1px solid #d1d5db; text-align: center;">
                                <div style="width: 24px; height: 24px; border: 2px solid #9ca3af; border-radius: 4px; display: inline-block;"></div>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;

        container.innerHTML = headerHtml + tableHtml;
    },

    async imprimirEtiquetas() {
        // MVP: Exibe alerta de sucesso
        showNotify(`Gerando etiquetas para ${this.selecionados.size} pedidos...`, 'info');
        setTimeout(() => {
            showNotify('Etiquetas enviadas para a impressora configurada!', 'success');
        }, 1500);
    },

    abrirModalEnvio() {
        if (this.selecionados.size === 0) return;
        document.getElementById('expedicao-enviar-qtd').innerText = this.selecionados.size;
        document.getElementById('expedicao-rastreio').value = '';
        openModal('modal-expedicao-enviar');
    },

    async confirmarEnvio() {
        try {
            const rastreio = document.getElementById('expedicao-rastreio').value.trim();
            const ids = Array.from(this.selecionados);
            
            showNotify("Atualizando status...", "info");
            
            // Em massa, chama o PUT individual ou cria um bulk endpoint.
            // Para simplicidade, vamos chamar o endpoint individual para cada pedido com o mesmo rastreio se preenchido.
            // Se fossem muitos pedidos, o ideal seria o endpoint /acao-massa/enviar receber rastreios, mas faremos promessas paralelas
            
            const promises = ids.map(id => apiFetch(`/expedicao/${id}/status`, {
                method: 'PUT',
                body: JSON.stringify({
                    status: 'ENVIADO',
                    codigo_rastreio: rastreio || null
                })
            }));

            await Promise.all(promises);
            
            showNotify(`${ids.length} pedidos marcados como ENVIADOS com sucesso!`, 'success');
            closeModal('modal-expedicao-enviar');
            this.refresh();
        } catch (e) {
            console.error("Erro ao atualizar envio", e);
            showNotify("Erro ao atualizar status dos pedidos", "error");
        }
    }
};
