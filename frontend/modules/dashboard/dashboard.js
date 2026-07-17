// === DASHBOARD (MODULAR) ===

// Paleta unificada — usada por sparklines e gráficos principais
const DASH_PALETTE = {
    blue:   '#3b82f6',
    green:  '#10b981',
    red:    '#ef4444',
    yellow: '#f59e0b',
    purple: '#a855f7',
    cyan:   '#06b6d4',
    pink:   '#ec4899',
};

// Opções de tooltip padrão reutilizadas em todos os gráficos
const DASH_TOOLTIP = {
    backgroundColor: 'rgba(15, 23, 42, 0.92)',
    padding: 12,
    cornerRadius: 8,
    borderColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    titleColor: '#f4f6f8',
    bodyColor: 'rgba(255,255,255,0.7)',
};

window.Modulo_dashboard = {

    charts: {},

    async init() {
        this.loadStats();
    },

    refresh() {
        this.loadStats();
    },

    // ─── Utilitários ──────────────────────────────────────────────────────────

    escapeHtml(valor) {
        return String(valor ?? '')
            .replaceAll('&', '&amp;')
            .replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;')
            .replaceAll('"', '&quot;')
            .replaceAll("'", '&#039;');
    },

    /**
     * Anima um número de 0 até o valor final em ~600 ms.
     * @param {HTMLElement} el
     * @param {number} target
     * @param {string} suffix  e.g. '%' ou ''
     */
    animateCounter(el, target, suffix = '') {
        if (!el) return;
        const duration = 600;
        const start = performance.now();
        const from = parseFloat(el.textContent) || 0;
        const step = (now) => {
            const t = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
            el.textContent = Math.round(from + (target - from) * eased) + suffix;
            if (t < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
    },

    // ─── Carregamento principal ───────────────────────────────────────────────

    async loadStats() {
        try {
            const statsPromise  = apiFetch('/dashboard/stats');
            const chartsPromise = apiFetch('/dashboard/charts');

            // Registrar filtros uma única vez
            const filterQuery = document.getElementById('filter-mov-query');
            const filterTipo  = document.getElementById('filter-mov-tipo');

            if (filterQuery && !filterQuery.dataset.bound) {
                filterQuery.dataset.bound = true;
                let debounce;
                filterQuery.addEventListener('input', () => {
                    clearTimeout(debounce);
                    debounce = setTimeout(() => this.loadStats(), 500);
                });
            }
            if (filterTipo && !filterTipo.dataset.bound) {
                filterTipo.dataset.bound = true;
                filterTipo.addEventListener('change', () => this.loadStats());
            }

            const queryParams = new URLSearchParams();
            if (filterQuery?.value) queryParams.append('query', filterQuery.value);
            if (filterTipo?.value)  queryParams.append('tipo',  filterTipo.value);

            const recentPromise = apiFetch(`/dashboard/recent-movements?${queryParams}`);

            // Skeleton na tabela enquanto carrega
            const tbody = document.querySelector('#table-recent-mov tbody');
            if (tbody && window.renderSkeletonLoaders) {
                tbody.innerHTML = window.renderSkeletonLoaders(5, 5);
            }

            // ── Stats ──
            const statsRes = await statsPromise;
            if (!statsRes.ok) throw new Error(`Falha ao carregar stats (${statsRes.status})`);
            const stats = await statsRes.json();

            this._setKpi('stat-total-produtos', stats.total_produtos);
            this._setKpi('stat-alertas',        stats.alertas_estoque);
            this._setKpi('stat-mov-hoje',        stats.movimentacoes_hoje);
            this._setKpi('stat-reservas',        stats.reservas_ativas);
            this._setKpi('stat-maquinas-dash',   stats.maquinas_ativas);
            this._setKpi('stat-os-dash',         stats.os_abertas);

            // Atualiza badge de alertas na topbar global
            if (window.updateAlertBadge) window.updateAlertBadge(stats.alertas_estoque);

            this.animateCounter(document.getElementById('kpi-vendas'),    stats.total_vendas);
            this.animateCounter(document.getElementById('kpi-produzidos'), stats.total_produzidos);

            this.atualizarProgressoProducao(stats.total_vendas, stats.total_produzidos);

            // ── Gráficos (não bloqueiam a UI) ──
            chartsPromise
                .then(async (chartsRes) => {
                    if (!chartsRes.ok) return;
                    const chartData = await chartsRes.json();

                    if (chartData.fluxo?.labels)      this.renderFluxoChart(chartData.fluxo);
                    if (chartData.vendas_prod)         this.renderStatusProducaoChart(chartData.vendas_prod);
                    if (chartData.top_clientes?.labels) {
                        const clientes = chartData.top_clientes.labels.map((nome, i) => ({
                            nome,
                            volume: chartData.top_clientes.values[i],
                        }));
                        this.renderizarTopClientes(clientes);
                    }

                    if (chartData.sparklines) {
                        const s = chartData.sparklines;
                        this.renderSparkline('spark-produtos',  DASH_PALETTE.blue,   s.produtos);
                        this.renderSparkline('spark-alertas',   DASH_PALETTE.red,    s.alertas);
                        this.renderSparkline('spark-mov',       DASH_PALETTE.green,  s.movimentos);
                        this.renderSparkline('spark-reservas',  DASH_PALETTE.cyan,   s.reservas);
                        this.renderSparkline('spark-maquinas',  DASH_PALETTE.yellow, s.maquinas);
                        this.renderSparkline('spark-os',        DASH_PALETTE.purple, s.os);
                    }
                })
                .catch((err) => console.error('[Dashboard] Erro nos gráficos:', err));

            // ── Movimentações recentes ──
            recentPromise
                .then(async (recentRes) => {
                    if (!recentRes.ok) {
                        this._tableError(tbody);
                        return;
                    }
                    this.renderRecentMovements(await recentRes.json());
                })
                .catch(() => this._tableError(tbody));

        } catch (err) {
            console.error('[Dashboard] Erro geral:', err);
        }
    },

    /** Atualiza um span de KPI sem animação de counter (valores inteiros de texto). */
    _setKpi(id, value) {
        const el = document.getElementById(id);
        if (el) el.textContent = value ?? '—';
    },

    _tableError(tbody) {
        if (!tbody) return;
        if (window.renderEmptyState) {
            tbody.innerHTML = window.renderEmptyState(5, 'ph ph-warning', 'Erro ao carregar', 'Não foi possível carregar as movimentações.');
        }
    },

    // ─── Sparklines ───────────────────────────────────────────────────────────

    renderSparkline(canvasId, colorHex, data = []) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;

        if (this.sparklines?.[canvasId]) {
            this.sparklines[canvasId].destroy();
        }
        if (!this.sparklines) this.sparklines = {};

        const maxVal = Math.max(...data, 1);

        this.sparklines[canvasId] = new Chart(canvas.getContext('2d'), {
            type: 'line',
            data: {
                labels: data.map((_, i) => i),
                datasets: [{
                    data,
                    borderColor: colorHex,
                    borderWidth: 2,
                    pointRadius: 0,
                    pointHoverRadius: 0,
                    cubicInterpolationMode: 'monotone',
                    fill: true,
                    backgroundColor: (ctx) => {
                        const g = ctx.chart.ctx.createLinearGradient(0, 0, 0, 60);
                        const [r, gr, b] = [
                            parseInt(colorHex.slice(1, 3), 16),
                            parseInt(colorHex.slice(3, 5), 16),
                            parseInt(colorHex.slice(5, 7), 16),
                        ];
                        g.addColorStop(0, `rgba(${r},${gr},${b},0.28)`);
                        g.addColorStop(1, `rgba(${r},${gr},${b},0)`);
                        return g;
                    },
                }],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false }, tooltip: { enabled: false } },
                scales: {
                    x: { display: false },
                    // ponytail: min fixo em 0 para evitar que valores zerados colapsen o gráfico
                    y: { display: false, min: 0, max: maxVal * 1.25 },
                },
                layout: { padding: 0 },
                animation: { duration: 1200, easing: 'easeOutQuart' },
            },
        });
    },

    // ─── Gráfico de Fluxo de Estoque ─────────────────────────────────────────

    renderFluxoChart(data) {
        const canvas = document.getElementById('chart-fluxo');
        if (!canvas) return;
        if (this.charts.fluxo) this.charts.fluxo.destroy();

        const makeGradient = (ctx, r, g, b) => {
            const grad = ctx.createLinearGradient(0, 0, 0, 300);
            grad.addColorStop(0, `rgba(${r},${g},${b},0.4)`);
            grad.addColorStop(1, `rgba(${r},${g},${b},0)`);
            return grad;
        };

        this.charts.fluxo = new Chart(canvas.getContext('2d'), {
            type: 'line',
            data: {
                labels: data.labels,
                datasets: [
                    {
                        label: 'Entradas',
                        data: data.entradas,
                        borderColor: DASH_PALETTE.blue,
                        backgroundColor: (ctx) => makeGradient(ctx.chart.ctx, 59, 130, 246),
                        fill: true,
                        cubicInterpolationMode: 'monotone',
                        borderWidth: 2.5,
                        pointBackgroundColor: '#1e293b',
                        pointBorderColor: DASH_PALETTE.blue,
                        pointBorderWidth: 2,
                        pointRadius: 4,
                        pointHoverRadius: 6,
                    },
                    {
                        label: 'Saídas',
                        data: data.saidas,
                        borderColor: DASH_PALETTE.pink,
                        backgroundColor: (ctx) => makeGradient(ctx.chart.ctx, 236, 72, 153),
                        fill: true,
                        cubicInterpolationMode: 'monotone',
                        borderWidth: 2.5,
                        pointBackgroundColor: '#1e293b',
                        pointBorderColor: DASH_PALETTE.pink,
                        pointBorderWidth: 2,
                        pointRadius: 4,
                        pointHoverRadius: 6,
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: { duration: 900, easing: 'easeOutQuart' },
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                        align: 'end',
                        labels: { color: 'rgba(255,255,255,0.6)', boxWidth: 10, boxHeight: 10, borderRadius: 3, usePointStyle: true },
                    },
                    tooltip: DASH_TOOLTIP,
                },
                scales: {
                    x: {
                        grid: { display: false },
                        ticks: { color: 'rgba(255,255,255,0.5)', font: { family: 'Inter', size: 11 } },
                    },
                    y: {
                        beginAtZero: true,
                        grid: { color: 'rgba(255,255,255,0.05)', drawBorder: false },
                        ticks: { color: 'rgba(255,255,255,0.5)', font: { family: 'Inter', size: 11 }, padding: 8 },
                    },
                },
            },
        });
    },

    // ─── Gráfico de Status da Produção (doughnut) ─────────────────────────────

    /**
     * Substitui o antigo bar chart de "Vendas vs Produção" por um doughnut
     * mostrando a distribuição de status das Ordens de Produção.
     * Usa `data.producao` que o backend já retorna como { status: count }.
     */
    renderStatusProducaoChart(data) {
        const canvas = document.getElementById('chart-status-prod');
        if (!canvas) return;
        if (this.charts.statusProd) this.charts.statusProd.destroy();

        const STATUS_CONFIG = {
            PLANEJADA:     { label: 'Planejadas',    color: DASH_PALETTE.blue },
            EM_ANDAMENTO:  { label: 'Em andamento',  color: DASH_PALETTE.yellow },
            CONCLUIDA:     { label: 'Concluídas',    color: DASH_PALETTE.green },
            CANCELADA:     { label: 'Canceladas',    color: DASH_PALETTE.red },
        };

        const entries = Object.entries(data.producao || {}).filter(([, v]) => v > 0);

        if (entries.length === 0) {
            // Estado vazio: mostrar placeholder
            const container = canvas.closest('.dash-chart-canvas');
            if (container) {
                container.innerHTML = `
                    <div class="dash-empty-state" style="height:100%">
                        <i class="ph ph-chart-donut"></i>
                        <strong>Sem ordens de produção</strong>
                        <span>Crie ordens para visualizar a distribuição.</span>
                    </div>`;
            }
            return;
        }

        const labels = entries.map(([k]) => STATUS_CONFIG[k]?.label ?? k);
        const values = entries.map(([, v]) => v);
        const colors = entries.map(([k]) => STATUS_CONFIG[k]?.color ?? DASH_PALETTE.purple);

        this.charts.statusProd = new Chart(canvas.getContext('2d'), {
            type: 'doughnut',
            data: {
                labels,
                datasets: [{
                    data: values,
                    backgroundColor: colors,
                    borderWidth: 0,
                    borderRadius: 4,
                    spacing: 3,
                    hoverOffset: 6,
                }],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '72%',
                animation: { animateScale: true, animateRotate: true, duration: 1000, easing: 'easeOutQuart' },
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: 'rgba(255,255,255,0.7)',
                            boxWidth: 10,
                            boxHeight: 10,
                            borderRadius: 3,
                            usePointStyle: true,
                            padding: 16,
                            font: { family: 'Inter', size: 12 },
                        },
                    },
                    tooltip: {
                        ...DASH_TOOLTIP,
                        callbacks: {
                            label: (ctx) => {
                                const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
                                const pct = total > 0 ? ((ctx.parsed / total) * 100).toFixed(1) : 0;
                                return ` ${ctx.label}: ${ctx.parsed} (${pct}%)`;
                            },
                        },
                    },
                },
            },
        });
    },

    // ─── Top Clientes ─────────────────────────────────────────────────────────

    renderizarTopClientes(clientes = []) {
        const container = document.getElementById('top-clientes-container');
        if (!container) return;

        if (!Array.isArray(clientes) || clientes.length === 0) {
            container.innerHTML = `
                <div class="dash-empty-state">
                    <i class="ph ph-users"></i>
                    <strong>Nenhum cliente encontrado</strong>
                    <span>Não existem pedidos no período selecionado.</span>
                </div>`;
            return;
        }

        const ordenados = [...clientes]
            .sort((a, b) => Number(b.volume) - Number(a.volume))
            .slice(0, 5);

        const maiorVolume = Math.max(...ordenados.map(c => Number(c.volume) || 0), 1);

        container.innerHTML = ordenados.map((cliente, i) => {
            const volume = Number(cliente.volume) || 0;
            const pct    = (volume / maiorVolume) * 100;

            return `
                <div class="dash-client-row">
                    <div class="dash-client-name" title="${this.escapeHtml(cliente.nome)}">
                        <span class="dash-client-rank">${i + 1}º</span>
                        ${this.escapeHtml(cliente.nome)}
                    </div>
                    <div class="dash-client-track">
                        <div class="dash-client-bar" style="width:${pct.toFixed(2)}%"></div>
                    </div>
                    <div class="dash-client-value">${volume.toLocaleString('pt-BR')}</div>
                </div>`;
        }).join('');
    },

    // ─── Movimentações Recentes ───────────────────────────────────────────────

    renderRecentMovements(movs) {
        const tbody = document.querySelector('#table-recent-mov tbody');
        if (!tbody) return;

        if (!movs?.length) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" class="dash-empty-cell">
                        <div class="dash-empty-state">
                            <i class="ph ph-warning-circle"></i>
                            <strong>Nenhuma movimentação encontrada</strong>
                            <span>As entradas, saídas e ajustes de estoque aparecerão aqui.</span>
                        </div>
                    </td>
                </tr>`;
            return;
        }

        tbody.innerHTML = movs.map(m => `
            <tr>
                <td class="text-truncate" style="max-width:200px" title="${this.escapeHtml(m.produto)}">${this.escapeHtml(m.produto)}</td>
                <td><span class="badge ${getBadgeClass(m.tipo)}">${m.tipo}</span></td>
                <td>${m.quantidade}</td>
                <td>${formatDate(m.data_hora)}</td>
                <td class="text-truncate" style="max-width:150px" title="${this.escapeHtml(m.usuario || 'Sistema')}">${this.escapeHtml(m.usuario || 'Sistema')}</td>
            </tr>
        `).join('');
    },

    // ─── Barra de Progresso da Produção ──────────────────────────────────────

    atualizarProgressoProducao(vendas, produzidos) {
        const totalVendas    = Math.max(0, Number(vendas)    || 0);
        const totalProduzidos = Math.min(Math.max(0, Number(produzidos) || 0), totalVendas);
        const totalPendentes  = totalVendas - totalProduzidos;

        const pctProduzido = totalVendas > 0 ? (totalProduzidos / totalVendas) * 100 : 0;
        const pctPendente  = totalVendas > 0 ? 100 - pctProduzido : 0;

        const elProduzidos  = document.getElementById('progress-produzidos');
        const elPendentes   = document.getElementById('progress-pendentes');
        const elLabel       = document.getElementById('progress-percent-label');
        const elTotal       = document.getElementById('progress-total-vendas');
        const elTrack       = document.getElementById('production-progress-track');
        const elVazio       = document.getElementById('progress-empty-hint');

        if (elProduzidos) elProduzidos.style.width = `${pctProduzido.toFixed(2)}%`;
        if (elPendentes)  elPendentes.style.width  = `${pctPendente.toFixed(2)}%`;
        if (elLabel)      elLabel.textContent       = `${Math.round(pctProduzido)}% concluído`;
        if (elTotal)      elTotal.textContent       = totalVendas.toLocaleString('pt-BR');
        if (elTrack)      elTrack.setAttribute('aria-valuenow', Math.round(pctProduzido));

        // Hint visual quando não há vendas
        if (elVazio) elVazio.style.display = totalVendas === 0 ? '' : 'none';

        this.animateCounter(document.getElementById('kpi-pendentes'),  totalPendentes);
        this.animateCounter(document.getElementById('kpi-eficiencia'), Math.round(pctProduzido), '%');
    },
};
