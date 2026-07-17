const RelatoriosFinanceiros = {
    async init() {
        console.log("Módulo Relatórios Financeiros inicializado.");
        
        // Define default dates (current month)
        const date = new Date();
        const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).toISOString().split('T')[0];
        const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString().split('T')[0];
        
        document.getElementById('relDataInicio').value = firstDay;
        document.getElementById('relDataFim').value = lastDay;

        await this.loadContasBancarias();
        await this.refresh();
    },

    switchTab(tabName) {
        const btns = document.querySelectorAll('#relatorios-fin-tabs-container .tab-btn');
        btns.forEach(btn => btn.classList.remove('active'));
        
        const activeBtn = Array.from(btns).find(b => b.dataset.tab === tabName);
        if (activeBtn) activeBtn.classList.add('active');
        
        document.getElementById('tab-dre').style.display = 'none';
        document.getElementById('tab-fluxo').style.display = 'none';
        
        const target = document.getElementById(`tab-${tabName}`);
        if (target) target.style.display = 'block';
    },

    // ponytail: html escape helper
    _esc(str) {
        if (!str) return '';
        const d = document.createElement('div');
        d.textContent = str;
        return d.innerHTML;
    },

    async loadContasBancarias() {
        try {
            const res = await window.apiFetch('/financeiro/contas-bancarias');
            if (res.ok) {
                const contas = await res.json();
                const selectCb = document.getElementById('fluxoContaBancaria');
                contas.forEach(c => {
                    const opt = document.createElement('option');
                    opt.value = c.id;
                    opt.textContent = c.descricao;
                    selectCb.appendChild(opt);
                });
            }
        } catch (e) {
            console.error("Erro ao carregar contas bancárias:", e);
        }
    },

    async refresh() {
        await this.loadDRE();
        await this.loadFluxoCaixa();
    },

    getQueryParams() {
        const inicio = document.getElementById('relDataInicio').value;
        const fim = document.getElementById('relDataFim').value;
        let query = '';
        if (inicio) query += `?data_inicio=${inicio}T00:00:00Z`;
        if (fim) query += `${query ? '&' : '?'}data_fim=${fim}T23:59:59Z`;
        return query;
    },

    async loadDRE() {
        try {
            const query = this.getQueryParams();
            const res = await window.apiFetch(`/financeiro/dre${query}`);
            if (res.ok) {
                const data = await res.json();
                
                const format = (v) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
                
                document.getElementById('dre-receita-bruta').innerText = format(data.receita_bruta);
                document.getElementById('dre-deducoes').innerText = format(data.deducoes);
                document.getElementById('dre-receita-liquida').innerText = format(data.receita_liquida);
                document.getElementById('dre-custos').innerText = format(data.custos);
                document.getElementById('dre-lucro-bruto').innerText = format(data.lucro_bruto);
                document.getElementById('dre-despesas-op').innerText = format(data.despesas_operacionais);
                document.getElementById('dre-resultado-liquido').innerText = format(data.resultado_liquido);
                
                const resLiqEl = document.getElementById('dre-resultado-liquido');
                if (data.resultado_liquido < 0) {
                    resLiqEl.className = 'text-end fw-bold text-danger';
                } else if (data.resultado_liquido > 0) {
                    resLiqEl.className = 'text-end fw-bold text-success';
                } else {
                    resLiqEl.className = 'text-end fw-bold';
                }
            }
        } catch (error) {
            console.error('Erro ao carregar DRE:', error);
            window.showNotify('Erro ao carregar DRE', 'error');
        }
    },

    async loadFluxoCaixa() {
        try {
            let query = this.getQueryParams();
            const contaId = document.getElementById('fluxoContaBancaria').value;
            if (contaId) {
                query += `${query ? '&' : '?'}conta_bancaria_id=${contaId}`;
            }

            const res = await window.apiFetch(`/financeiro/fluxo-caixa${query}`);
            if (res.ok) {
                const fluxo = await res.json();
                this.renderFluxoCaixa(fluxo);
            }
        } catch (error) {
            console.error('Erro ao carregar Fluxo de Caixa:', error);
            window.showNotify('Erro ao carregar Fluxo de Caixa', 'error');
        }
    },

    renderFluxoCaixa(fluxo) {
        const tbody = document.getElementById('fluxoTableBody');
        if (fluxo.length === 0) {
            tbody.innerHTML = `<tr><td colspan="4" class="text-center text-muted py-4">Nenhuma movimentação no período.</td></tr>`;
            return;
        }

        const format = (v) => v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

        tbody.innerHTML = fluxo.map(f => {
            const dateStr = new Date(f.data).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
            return `
                <tr>
                    <td style="font-weight: 600; color: #fff;">${dateStr}</td>
                    <td style="text-align: right; color: var(--success);">${format(f.entradas)}</td>
                    <td style="text-align: right; color: var(--danger);">${format(f.saidas)}</td>
                    <td style="text-align: right; font-weight: 700; color: ${f.saldo_dia < 0 ? 'var(--danger)' : 'var(--info)'}">${format(f.saldo_dia)}</td>
                </tr>
            `;
        }).join('');
    }
};

document.addEventListener('DOMContentLoaded', () => {
    RelatoriosFinanceiros.init();
});
