window.Modulo_pedidos_venda = {
    pedidos: [],
    filtroStatus: '',
    
    init: async function() {
        await this.carregarPedidos();
    },
    
    refresh: async function() {
        await this.carregarPedidos();
    },
    
    destroy: function() {},

    setFiltro: function(status) {
        this.filtroStatus = status;
        document.querySelectorAll('#pedidos-filters .filter-btn').forEach(btn => {
            if (btn.dataset.status === status) {
                btn.classList.add('btn-primary');
                btn.classList.remove('btn-outline');
            } else {
                btn.classList.remove('btn-primary');
                btn.classList.add('btn-outline');
            }
        });
        this.renderTabela();
    },

    carregarPedidos: async function() {
        try {
            const res = await apiFetch('/vendas/pedidos');
            if (res.ok) {
                this.pedidos = await res.json();
                this.renderTabela();
            } else {
                throw new Error('Falha ao carregar pedidos');
            }
        } catch (e) {
            console.error(e);
            document.getElementById('pedidos-table-body').innerHTML = `<tr><td colspan="6" style="text-align: center; color: red;">Erro ao carregar pedidos.</td></tr>`;
        }
    },

    getStatusBadge: function(status) {
        const cores = {
            'AGUARDANDO_GERENCIA': '#f43f5e',
            'EM_ABERTO': 'var(--text-secondary)',
            'APROVADO': 'var(--accent)',
            'PREPARANDO_ENVIO': '#eab308',
            'FATURADO': '#8b5cf6',
            'PRONTO_ENVIO': '#06b6d4',
            'ENVIADO': '#f97316',
            'ENTREGUE': '#22c55e',
            'CANCELADO': '#ef4444'
        };
        const cor = cores[status] || '#666';
        return `<span style="background: ${cor}20; color: ${cor}; padding: 4px 8px; border-radius: 12px; font-size: 0.8rem; font-weight: 600;">${status.replace('_', ' ')}</span>`;
    },

    renderTabela: function() {
        const tbody = document.getElementById('pedidos-table-body');
        
        let filtrados = this.pedidos;
        if (this.filtroStatus) {
            filtrados = this.pedidos.filter(p => p.status === this.filtroStatus);
        }

        if (filtrados.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6">${window.ui.emptyState('ph ph-receipt', 'Nenhum pedido encontrado', 'Crie um novo pedido de venda para começar.')}</td></tr>`;
            return;
        }

        tbody.innerHTML = filtrados.map(p => `
            <tr>
                <td>#${p.id}</td>
                <td>${new Date(p.data_pedido).toLocaleDateString()}</td>
                <td>${p.cliente_nome}</td>
                <td>${this.getStatusBadge(p.status)}</td>
                <td>R$ ${p.valor_total.toFixed(2)}</td>
                <td>
                    <button class="table-action-icon" onclick="Modulo_pedidos_venda.verPedido(${p.id})">Detalhes</button>
                </td>
            </tr>
        `).join('');
    },

    verPedido: function(id) {
        const pedido = this.pedidos.find(p => p.id === id);
        if (!pedido) return;

        document.getElementById('modal-pedido-title').innerText = `Pedido #${pedido.id} - ${pedido.cliente_nome}`;
        
        let acoesHtml = '';
        if (pedido.status === 'AGUARDANDO_GERENCIA') {
            acoesHtml = `<button class="btn btn-primary" onclick="Modulo_pedidos_venda.avancarStatus(${pedido.id}, 'aprovar-desconto')"><i class="ph ph-check-circle"></i> Aprovar Desconto (Gerencial)</button>`;
        } else if (pedido.status === 'EM_ABERTO') {
            acoesHtml = `<button class="btn btn-primary" onclick="Modulo_pedidos_venda.avancarStatus(${pedido.id}, 'aprovar')">Aprovar Pedido</button>`;
        } else if (pedido.status === 'APROVADO') {
            acoesHtml = `<button class="btn btn-primary" onclick="Modulo_pedidos_venda.avancarStatus(${pedido.id}, 'preparar-envio')">Preparar Envio</button>`;
        } else if (pedido.status === 'PREPARANDO_ENVIO') {
            acoesHtml = `<button class="btn btn-primary" onclick="Modulo_pedidos_venda.avancarStatus(${pedido.id}, 'faturar')">Faturar Pedido</button>`;
        } else if (pedido.status === 'FATURADO') {
            acoesHtml = `<button class="btn btn-primary" onclick="Modulo_pedidos_venda.avancarStatus(${pedido.id}, 'pronto-envio')">Pronto para Envio</button>`;
        } else if (pedido.status === 'PRONTO_ENVIO') {
            acoesHtml = `<button class="btn btn-primary" onclick="Modulo_pedidos_venda.modalEnviar(${pedido.id})">Marcar como Enviado</button>`;
        } else if (pedido.status === 'ENVIADO') {
            acoesHtml = `<button class="btn btn-primary" onclick="Modulo_pedidos_venda.avancarStatus(${pedido.id}, 'entregar')">Marcar Entregue</button>`;
        }

        if (pedido.status !== 'ENTREGUE' && pedido.status !== 'CANCELADO') {
            acoesHtml += ` <button class="btn btn-outline" style="color: red; border-color: red;" onclick="Modulo_pedidos_venda.avancarStatus(${pedido.id}, 'cancelar')">Cancelar Pedido</button>`;
        }

        let itensHtml = pedido.itens.map(i => `
            <tr>
                <td>${i.produto ? i.produto.nome : 'Produto ' + i.produto_id}</td>
                <td>${i.quantidade}</td>
                <td>R$ ${i.preco_unitario.toFixed(2)}</td>
                <td>R$ ${(i.quantidade * i.preco_unitario).toFixed(2)}</td>
            </tr>
        `).join('');

        const rastreioHtml = (pedido.codigo_rastreio) ? `
            <div style="margin-top: 15px; padding: 10px; background: var(--bg-body); border-radius: 8px;">
                <strong>Rastreio:</strong> ${pedido.codigo_rastreio} 
                ${pedido.transportadora ? `(${pedido.transportadora})` : ''}
                ${pedido.url_rastreio ? `<br><a href="${pedido.url_rastreio}" target="_blank" style="color: var(--accent);">Acompanhar Entrega</a>` : ''}
            </div>
        ` : '';

        const html = `
            <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
                <div>
                    <p><strong>Status Atual:</strong> ${this.getStatusBadge(pedido.status)}</p>
                    <p><strong>Data:</strong> ${new Date(pedido.data_pedido).toLocaleString()}</p>
                </div>
                <div style="text-align: right;">
                    <p><strong>Frete:</strong> R$ ${pedido.valor_frete.toFixed(2)}</p>
                    <p><strong>Desconto:</strong> R$ ${pedido.desconto_valor.toFixed(2)}</p>
                    <h4 style="color: var(--accent);">Total: R$ ${pedido.valor_total.toFixed(2)}</h4>
                </div>
            </div>
            
            ${rastreioHtml}

            <h4>Itens do Pedido</h4>
            <table class="data-table" style="margin-top: 10px; margin-bottom: 20px;">
                <thead>
                    <tr><th>Produto</th><th>Qtd</th><th>Preço Unit</th><th>Subtotal</th></tr>
                </thead>
                <tbody>${itensHtml}</tbody>
            </table>
            
            ${pedido.observacoes ? `<p><strong>Observações:</strong> ${pedido.observacoes}</p>` : ''}

            <div style="margin-top: 30px; display: flex; gap: 10px; justify-content: flex-end;">
                ${acoesHtml}
            </div>
        `;

        document.getElementById('modal-pedido-body').innerHTML = html;
        document.getElementById('modal-pedido').classList.add('active');
    },

    modalEnviar: function(id) {
        const html = `
            <h4>Dados de Envio</h4>
            <div class="form-group" style="margin-top: 10px;">
                <label>Código de Rastreio (Obrigatório)</label>
                <input type="text" id="envio-rastreio" required>
            </div>
            <div class="form-group">
                <label>Transportadora</label>
                <input type="text" id="envio-transp">
            </div>
            <div class="form-group">
                <label>URL de Rastreio (Opcional)</label>
                <input type="url" id="envio-url">
            </div>
            <div style="margin-top: 20px; display: flex; gap: 10px; justify-content: flex-end;">
                <button class="btn btn-primary" onclick="Modulo_pedidos_venda.confirmarEnvio(${id})">Confirmar Envio</button>
            </div>
        `;
        document.getElementById('modal-pedido-body').innerHTML = html;
    },

    confirmarEnvio: async function(id) {
        const codigo = document.getElementById('envio-rastreio').value;
        const transp = document.getElementById('envio-transp').value;
        const url = document.getElementById('envio-url').value;

        if (!codigo) {
            showNotify('Código de rastreio é obrigatório.', 'error');
            return;
        }

        try {
            const res = await apiFetch(`/vendas/pedidos/${id}/enviar`, {
                method: 'POST',
                body: JSON.stringify({
                    codigo_rastreio: codigo,
                    transportadora: transp,
                    url_rastreio: url
                })
            });
            if (res.ok) {
                showNotify('Pedido marcado como enviado!', 'success');
                this.fecharModal();
                this.carregarPedidos();
            } else {
                const err = await res.json();
                showNotify(err.detail || 'Erro ao enviar.', 'error');
            }
        } catch (e) {
            console.error(e);
            showNotify('Erro de comunicação', 'error');
        }
    },

    avancarStatus: async function(id, acao) {
        if (acao === 'cancelar' && !confirm('Tem certeza que deseja cancelar este pedido?')) return;

        try {
            const res = await apiFetch(`/vendas/pedidos/${id}/${acao}`, { method: 'POST' });
            if (res.ok) {
                showNotify(`Status atualizado com sucesso!`, 'success');
                this.fecharModal();
                this.carregarPedidos();
            } else {
                const err = await res.json();
                showNotify(err.detail || 'Erro ao atualizar status', 'error');
            }
        } catch (e) {
            console.error(e);
            showNotify('Erro ao atualizar status', 'error');
        }
    },

    novoPedido: function() {
        document.getElementById('modal-pedido-title').innerText = 'Novo Pedido Rápido';
        const html = `
            <div class="form-group">
                <label>Nome do Cliente (Venda Direta)</label>
                <input type="text" id="novo-pedido-cliente" value="Consumidor Final">
            </div>
            <div class="form-group">
                <label>ID do Produto (Catálogo)</label>
                <input type="number" id="novo-pedido-produto" placeholder="Ex: 1">
            </div>
            <div class="form-group">
                <label>Quantidade</label>
                <input type="number" id="novo-pedido-qtd" value="1">
            </div>
            <div class="form-group">
                <label>Preço Unitário (R$)</label>
                <input type="number" step="0.01" id="novo-pedido-preco" value="10.00">
            </div>
            <div class="form-group">
                <label>Desconto (R$)</label>
                <input type="number" step="0.01" id="novo-pedido-desconto" value="0.00">
            </div>
            <div style="margin-top: 20px; display: flex; justify-content: flex-end;">
                <button class="btn btn-primary" onclick="Modulo_pedidos_venda.salvarNovoPedido()">Criar Pedido</button>
            </div>
        `;
        document.getElementById('modal-pedido-body').innerHTML = html;
        document.getElementById('modal-pedido').classList.add('active');
    },

    salvarNovoPedido: async function() {
        const btn = document.querySelector('#modal-pedido .btn-primary');
        const payload = {
            tipo: "PEDIDO",
            cliente_nome: document.getElementById('novo-pedido-cliente').value,
            valor_frete: 0,
            desconto_valor: parseFloat(document.getElementById('novo-pedido-desconto').value) || 0,
            itens: [
                {
                    produto_id: parseInt(document.getElementById('novo-pedido-produto').value),
                    quantidade: parseFloat(document.getElementById('novo-pedido-qtd').value),
                    preco_unitario: parseFloat(document.getElementById('novo-pedido-preco').value)
                }
            ]
        };

        window.ui.btnLoading(btn, 'Criando...');
        try {
            const res = await apiFetch('/vendas/pedidos', {
                method: 'POST',
                body: JSON.stringify(payload)
            });
            if (res.ok) {
                showNotify('Pedido criado com sucesso!', 'success');
                this.fecharModal();
                this.carregarPedidos();
            } else {
                const err = await res.json();
                showNotify(err.detail || 'Erro ao criar', 'error');
            }
        } catch (e) {
            showNotify('Erro de comunicação', 'error');
        } finally {
            window.ui.btnReset(btn);
        }
    },

    fecharModal: function() {
        document.getElementById('modal-pedido').classList.remove('active');
    }
};
