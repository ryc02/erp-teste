window.Modulo_resultados_comerciais = {
    init: async function() {
        this.setupTabs();
        await this.loadPerformance();
        await this.loadCurvaABC();
        await this.loadComissoes();
    },

    destroy: function() {},

    setupTabs: function() {
        const btns = document.querySelectorAll('#module-content .tab-btn');
        const contents = document.querySelectorAll('#module-content .tab-content');

        btns.forEach(btn => {
            btn.addEventListener('click', () => {
                btns.forEach(b => b.classList.remove('active'));
                contents.forEach(c => c.style.display = 'none');
                
                btn.classList.add('active');
                document.getElementById(btn.dataset.tab).style.display = 'block';
            });
        });
    },

    formatCurrency: function(val) {
        return 'R$ ' + parseFloat(val).toFixed(2).replace('.', ',');
    },

    loadPerformance: async function() {
        try {
            const res = await apiFetch('/vendas/resultados/performance');
            if (res.ok) {
                const data = await res.json();
                document.getElementById('perf-total-faturado').innerText = this.formatCurrency(data.total_faturado);
                document.getElementById('perf-qtd-pedidos').innerText = data.qtd_pedidos;
                document.getElementById('perf-ticket-medio').innerText = this.formatCurrency(data.ticket_medio);

                const tbody = document.getElementById('perf-vendedores-body');
                if (data.top_vendedores.length === 0) {
                    tbody.innerHTML = `<tr><td colspan="3" style="text-align:center;">Sem dados no período</td></tr>`;
                } else {
                    tbody.innerHTML = data.top_vendedores.map(tv => `
                        <tr>
                            <td>${tv.nome}</td>
                            <td>${tv.qtd}</td>
                            <td>${this.formatCurrency(tv.total)}</td>
                        </tr>
                    `).join('');
                }
            }
        } catch (e) {
            console.error(e);
        }
    },

    loadCurvaABC: async function() {
        try {
            const res = await apiFetch('/vendas/resultados/curva-abc');
            if (res.ok) {
                const data = await res.json();
                const tbody = document.getElementById('abc-table-body');
                
                if (data.length === 0) {
                    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;">Sem vendas registradas</td></tr>`;
                    return;
                }

                tbody.innerHTML = data.map(item => {
                    let color = 'var(--text-secondary)';
                    if (item.classe === 'A') color = '#22c55e'; // Green
                    if (item.classe === 'B') color = '#eab308'; // Yellow

                    return `
                        <tr>
                            <td><span style="background: ${color}20; color: ${color}; padding: 4px 12px; border-radius: 12px; font-weight: bold;">${item.classe}</span></td>
                            <td>${item.nome} ${item.sku ? `(${item.sku})` : ''}</td>
                            <td>${item.qtd_vendida}</td>
                            <td>${this.formatCurrency(item.valor_total)}</td>
                            <td>${item.percentual_acumulado.toFixed(2)}%</td>
                        </tr>
                    `;
                }).join('');
            }
        } catch (e) {
            console.error(e);
        }
    },

    loadComissoes: async function() {
        try {
            const res = await apiFetch('/vendas/resultados/comissoes');
            if (res.ok) {
                const data = await res.json();
                const tbody = document.getElementById('comissoes-table-body');
                
                if (data.length === 0) {
                    tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;">Sem representantes cadastrados</td></tr>`;
                    return;
                }

                tbody.innerHTML = data.map(rep => `
                    <tr>
                        <td>${rep.nome}</td>
                        <td>${rep.percentual_comissao}%</td>
                        <td>${this.formatCurrency(rep.total_vendas)}</td>
                        <td style="font-weight: bold; color: var(--accent);">${this.formatCurrency(rep.valor_comissao)}</td>
                    </tr>
                `).join('');
            }
        } catch (e) {
            console.error(e);
        }
    }
};
