window.Modulo_expedicao_painel = {
    pedidos: [],
    filtroStatus: '',
    
    init: async function() {
        await this.carregarPedidos();
    },
    
    refresh: async function() {
        await this.carregarPedidos();
    },
    
    destroy: function() {},

    carregarPedidos: async function() {
        try {
            const res = await window.apiFetch('/expedicao/pendentes');
            if (res.ok) {
                this.pedidos = await res.json();
                this.renderizarTabela();
            } else {
                throw new Error('Erro na requisição');
            }
        } catch (error) {
            console.error(error);
            window.ui.showNotify('Erro ao carregar expedição', 'error');
        }
    },

    setFiltro: function(status) {
        this.filtroStatus = status;
        document.querySelectorAll('.filters .filter-btn').forEach(btn => {
            btn.classList.remove('active', 'btn-primary');
            btn.classList.add('btn-outline');
            if (btn.dataset.status === status) {
                btn.classList.add('active', 'btn-primary');
                btn.classList.remove('btn-outline');
            }
        });
        this.renderizarTabela();
    },

    renderizarTabela: function() {
        const tbody = document.getElementById('expedicao-table-body');
        let html = '';

        const filtrados = this.filtroStatus 
            ? this.pedidos.filter(p => p.status === this.filtroStatus)
            : this.pedidos;

        if (filtrados.length === 0) {
            html = `<tr><td colspan="6">${window.ui.emptyState('ph ph-package', 'Nenhum pedido pendente', 'Pedidos aprovados e faturados aparecerão aqui para separação e envio.')}</td></tr>`;
        } else {
            filtrados.forEach(p => {
                const dataStr = p.data_pedido ? new Date(p.data_pedido).toLocaleDateString() : '';
                html += `
                    <tr>
                        <td><input type="checkbox" class="check-pedido" value="${p.id}"></td>
                        <td>#${p.id}</td>
                        <td>${dataStr}</td>
                        <td>${p.cliente_nome}</td>
                        <td><span class="badge ${this.getBadgeClass(p.status)}">${p.status}</span></td>
                        <td>${p.qtd_itens}</td>
                    </tr>
                `;
            });
        }
        tbody.innerHTML = html;
        document.getElementById('check-todos-pedidos').checked = false;
    },

    getBadgeClass: function(status) {
        switch(status) {
            case 'PREPARANDO_ENVIO': return 'bg-warning';
            case 'SEPARADO': return 'bg-info';
            case 'FATURADO': return 'bg-info';
            case 'PRONTO_ENVIO': return 'bg-primary';
            case 'ENVIADO': return 'bg-success';
            default: return 'bg-secondary';
        }
    },

    toggleTodos: function() {
        const isChecked = document.getElementById('check-todos-pedidos').checked;
        document.querySelectorAll('.check-pedido').forEach(cb => {
            cb.checked = isChecked;
        });
    },

    getSelecionados: function() {
        const selecionados = [];
        document.querySelectorAll('.check-pedido:checked').forEach(cb => {
            selecionados.push(parseInt(cb.value));
        });
        return selecionados;
    },

    imprimirPicking: async function() {
        const ids = this.getSelecionados();
        if (ids.length === 0) return window.ui.showNotify('Selecione ao menos um pedido', 'warning');
        
        try {
            const res = await window.apiFetch('/expedicao/picking', { 
                method: 'POST', 
                body: JSON.stringify({ pedido_ids: ids }) 
            });
            if (!res.ok) throw new Error('Erro na requisição');
            const data = await res.json();
            
            // Gerar UI em nova janela
            let html = `<h2>Picking List (Separação)</h2><ul>`;
            data.itens.forEach(i => {
                html += `<li><b>[${i.localizacao}]</b> - ${i.nome} (SKU: ${i.codigo_sku}) - <b>Qtd: ${i.quantidade_total}</b></li>`;
            });
            html += `</ul><button onclick="window.print()">Imprimir</button>`;
            
            const win = window.open('', '_blank');
            win.document.write(html);
            win.document.close();
            
        } catch (error) {
            console.error(error);
            window.ui.showNotify('Erro ao gerar picking list', 'error');
        }
    },

    imprimirEtiquetas: async function() {
        const ids = this.getSelecionados();
        if (ids.length === 0) return window.ui.showNotify('Selecione ao menos um pedido', 'warning');

        try {
            const res = await window.apiFetch('/expedicao/gerar-etiquetas', { 
                method: 'POST', 
                body: JSON.stringify({ pedido_ids: ids }) 
            });
            if (!res.ok) throw new Error('Erro na requisição');
            const data = await res.text();
            
            const win = window.open('', '_blank');
            win.document.write(data);
            win.document.close();
        } catch (error) {
            console.error(error);
            // ui.showNotify already handles apiFetch errors if they are not OK, but we can keep this for safety
        }
    },

    imprimirDCE: async function() {
        const ids = this.getSelecionados();
        if (ids.length === 0) return window.ui.showNotify('Selecione ao menos um pedido', 'warning');

        try {
            const res = await window.apiFetch('/expedicao/gerar-dce', { 
                method: 'POST', 
                body: JSON.stringify({ pedido_ids: ids }) 
            });
            if (!res.ok) throw new Error('Erro na requisição');
            const data = await res.text();
            
            const win = window.open('', '_blank');
            win.document.write(data);
            win.document.close();
        } catch (error) {
            console.error(error);
        }
    },

    separarPedidos: async function() {
        const ids = this.getSelecionados();
        if (ids.length === 0) return window.ui.showNotify('Selecione ao menos um pedido para marcar como Separado', 'warning');

        try {
            const res = await window.apiFetch('/expedicao/acao-massa/separar', {
                method: 'POST',
                body: JSON.stringify({ pedido_ids: ids })
            });
            if (res.ok) {
                window.ui.showNotify('Pedidos marcados como Separado!', 'success');
                this.refresh();
            }
        } catch (error) {
            console.error(error);
        }
    },

    embalarPedidos: async function() {
        const ids = this.getSelecionados();
        if (ids.length === 0) return window.ui.showNotify('Selecione ao menos um pedido para marcar como Embalado (Pronto para Envio)', 'warning');

        try {
            const res = await window.apiFetch('/expedicao/acao-massa/embalar', {
                method: 'POST',
                body: JSON.stringify({ pedido_ids: ids })
            });
            if (res.ok) {
                window.ui.showNotify('Pedidos embalados com sucesso!', 'success');
                this.refresh();
            }
        } catch (error) {
            console.error(error);
        }
    },

    modalDespachar: function() {
        const ids = this.getSelecionados();
        if (ids.length === 0) return window.ui.showNotify('Selecione ao menos um pedido', 'warning');
        
        document.getElementById('despacho-transportadora').value = '';
        document.getElementById('modal-despachar').style.display = 'flex';
    },

    fecharModal: function() {
        document.getElementById('modal-despachar').style.display = 'none';
    },

    confirmarDespacho: async function() {
        const ids = this.getSelecionados();
        const transportadora = document.getElementById('despacho-transportadora').value;
        const btn = document.querySelector('#modal-despachar .btn-primary');

        window.ui.btnLoading(btn, 'Despachando...');
        try {
            const res = await window.apiFetch('/expedicao/acao-massa/enviar', {
                method: 'POST',
                body: JSON.stringify({
                    pedido_ids: ids,
                    transportadora: transportadora
                })
            });
            if (res.ok) {
                window.ui.showNotify('Pedidos despachados com sucesso!', 'success');
                this.fecharModal();
                this.refresh();
            }
        } catch (error) {
            console.error(error);
        } finally {
            window.ui.btnReset(btn);
        }
    }
};
