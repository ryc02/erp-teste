// ERP VENNER - CORE SYSTEM ORCHESTRATOR

// Estado Global
let state = {
    currentView: 'dashboard',
    user: null,
    products: [],
    modulos: [],
    allUsers: []
};

let charts = {
    fluxo: null,
    categorias: null
};

// Inicialização
document.addEventListener('DOMContentLoaded', async () => {
    if (!sessionStorage.getItem('token')) {
        window.location.href = '/login.html';
        return;
    }

    try {
        await loadUserProfile();
        loadModulos();
        refreshData();
        initWebSocket();
        showView('dashboard');
    } catch (e) {
        console.error("Erro na inicialização", e);
        showNotify("Erro ao carregar dados iniciais.", "error");
    }

    checkDBHealth();
    
    // Listeners Globais
    const formMov = document.getElementById('form-mov');
    if (formMov) formMov.addEventListener('submit', handleMovementSubmit);
    
    const formProd = document.getElementById('form-produto');
    if (formProd) formProd.addEventListener('submit', saveProduct);

    const formUser = document.getElementById('form-usuario');
    if (formUser) formUser.addEventListener('submit', saveUser);

    const formOP = document.getElementById('form-nova-op');
    if (formOP) formOP.addEventListener('submit', saveOP);
    
    // Auto-refresh a cada 60 segundos
    setInterval(refreshData, 60000);
});

async function loadUserProfile() {
    try {
        const res = await fetch(`${API_URL}/usuarios/me`);
        if (res.ok) {
            state.user = await res.json();
            if (state.user) {
                document.getElementById('user-name').innerText = state.user.nome_completo || state.user.username;
                const roleNome = (state.user.role && state.user.role.nome) ? state.user.role.nome : 'USUÁRIO';
                document.getElementById('user-role').innerText = roleNome;
                
                if (roleNome !== 'ADMIN') {
                    document.querySelectorAll('.admin-only').forEach(el => el.style.display = 'none');
                }
            }
        }
    } catch (e) { console.error("Erro ao carregar perfil", e); }
}

window.showView = async function(viewId) {
    const restrictedViews = ['usuarios', 'configuracoes', 'logs'];
    const userRole = (state.user && state.user.role) ? state.user.role.nome : 'OPERADOR';
    
    if (restrictedViews.includes(viewId) && userRole !== 'ADMIN') {
        showNotify("Acesso negado: Somente administradores podem acessar esta área.", "error");
        return;
    }

    const container = document.getElementById('main-content-area');
    if (!container) return;

    // Feedback visual de carregamento
    container.innerHTML = `
        <div style="display: flex; justify-content: center; align-items: center; height: 100%; color: var(--text-secondary);">
            <div style="text-align: center;">
                <div class="spinner" style="margin: 0 auto 15px;"></div>
                <p>Carregando ${viewId}...</p>
            </div>
        </div>
    `;

    try {
        const response = await fetch(`views/${viewId}.html`);
        if (!response.ok) throw new Error("Erro ao carregar template");
        
        const html = await response.json ? await response.json() : await response.text();
        container.innerHTML = html;

        state.currentView = viewId;
        const titleEl = document.getElementById('page-current-title');
        if (titleEl) {
            const titles = {
                'dashboard': 'Dashboard',
                'produtos': 'Controle de Estoque',
                'vendas': 'Vendas',
                'reservas': 'Reservas de Estoque',
                'inventario': 'Inventário',
                'relatorios': 'Relatórios & BI',
                'manutencao': 'Manutenção Industrial',
                'pcp': 'Produção (PCP)',
                'usuarios': 'Gestão de Usuários',
                'configuracoes': 'Configurações',
                'logs': 'Logs de Auditoria'
            };
            titleEl.innerText = titles[viewId] || viewId;
        }

        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('onclick')?.includes(`'${viewId}'`)) item.classList.add('active');
        });

        // Inicializar módulos após carregar o HTML
        if (viewId === 'dashboard') loadStats();
        if (viewId === 'produtos') loadProducts();
        if (viewId === 'vendas') loadVendas();
        if (viewId === 'reservas') loadReservas();
        if (viewId === 'inventario') loadInventario();
        if (viewId === 'relatorios') loadRelatorios();
        if (viewId === 'manutencao') loadManutencao();
        if (viewId === 'usuarios') loadUsers();
        if (viewId === 'configuracoes') loadTemplates();
        if (viewId === 'pcp') loadOPs();
        if (viewId === 'logs') loadAuditLogs();

    } catch (e) {
        console.error(e);
        container.innerHTML = `<div class="card" style="text-align:center; padding: 40px; color: var(--danger);">Erro ao carregar o módulo: ${viewId}</div>`;
    }
}

window.refreshData = function() {
    if (state.currentView === 'dashboard') loadStats();
    if (state.currentView === 'produtos') loadProducts();
}

async function loadModulos() {
    try {
        const res = await fetch(`${API_URL}/modulos/`);
        state.modulos = await res.json();
    } catch (e) { console.error(e); }
}

async function loadStats() {
    try {
        const res = await fetch(`${API_URL}/dashboard/stats`);
        const stats = await res.json();
        
        document.getElementById('stat-total-produtos').innerText = stats.total_produtos;
        document.getElementById('stat-alertas').innerText = stats.alertas_estoque;
        document.getElementById('stat-mov-hoje').innerText = stats.movimentacoes_hoje;
        document.getElementById('stat-reservas').innerText = stats.reservas_ativas;
        document.getElementById('stat-maquinas-dash').innerText = stats.maquinas_ativas;
        document.getElementById('stat-os-dash').innerText = stats.os_abertas;
        document.getElementById('alert-count').innerText = stats.alertas_estoque;
        
        loadCharts();
        loadRecentMovements();
    } catch (e) { console.error(e); }
}

async function loadCharts() {
    try {
        const res = await fetch(`${API_URL}/dashboard/charts`);
        const data = await res.json();
        renderFluxoChart(data.fluxo);
        renderCategoriasChart(data.categorias);
    } catch (e) { console.error(e); }
}

function getChartCommonOptions() {
    return {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
            duration: 950,
            easing: 'easeOutQuart'
        },
        plugins: {
            legend: {
                labels: {
                    color: 'rgba(255, 255, 255, 0.7)',
                    usePointStyle: true,
                    pointStyle: 'circle',
                    padding: 18
                }
            }
        }
    };
}

function getChartStaggerDelay(ctx, extraDelay = 0) {
    if (ctx.type !== 'data') return 0;
    return (ctx.dataIndex * 70) + (ctx.datasetIndex * 140) + extraDelay;
}

function renderFluxoChart(data) {
    const ctx = document.getElementById('chart-fluxo');
    if (!ctx) return;
    if (charts.fluxo) charts.fluxo.destroy();

    const commonOptions = getChartCommonOptions();
    charts.fluxo = new Chart(ctx.getContext('2d'), {
        type: 'line',
        data: {
            labels: data.labels,
            datasets: [
                {
                    label: 'Entradas',
                    data: data.entradas,
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.16)',
                    fill: true,
                    tension: 0.36,
                    borderWidth: 3,
                    pointRadius: 3,
                    pointHoverRadius: 5,
                    pointBackgroundColor: '#60a5fa'
                },
                {
                    label: 'Saídas',
                    data: data.saidas,
                    borderColor: '#ef4444',
                    backgroundColor: 'rgba(239, 68, 68, 0.12)',
                    fill: true,
                    tension: 0.36,
                    borderWidth: 3,
                    pointRadius: 3,
                    pointHoverRadius: 5,
                    pointBackgroundColor: '#f87171'
                }
            ]
        },
        options: {
            ...commonOptions,
            interaction: {
                mode: 'index',
                intersect: false
            },
            scales: {
                x: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.04)'
                    },
                    ticks: {
                        color: 'rgba(255, 255, 255, 0.55)'
                    }
                },
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(255, 255, 255, 0.05)'
                    },
                    ticks: {
                        color: 'rgba(255, 255, 255, 0.55)'
                    }
                }
            },
            animations: {
                x: {
                    type: 'number',
                    easing: 'easeOutCubic',
                    duration: 700,
                    from: NaN,
                    delay(ctx) {
                        return getChartStaggerDelay(ctx);
                    }
                },
                y: {
                    type: 'number',
                    easing: 'easeOutQuart',
                    duration: 900,
                    from: 0,
                    delay(ctx) {
                        return getChartStaggerDelay(ctx, 80);
                    }
                }
            }
        }
    });
}

function renderCategoriasChart(data) {
    const ctx = document.getElementById('chart-categorias');
    if (!ctx) return;
    if (charts.categorias) charts.categorias.destroy();

    const labels = Array.isArray(data?.labels) ? data.labels : [];
    const values = Array.isArray(data?.values) ? data.values : [];
    const hasData = values.some(value => Number(value) > 0);

    const palette = ['#3DA5D9', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#14b8a6'];
    const chartData = hasData
        ? {
            labels,
            datasets: [{
                data: values,
                backgroundColor: labels.map((_, index) => palette[index % palette.length]),
                borderColor: 'rgba(10, 14, 20, 0.9)',
                borderWidth: 3,
                hoverOffset: 10
            }]
        }
        : {
            labels: ['Sem dados'],
            datasets: [{
                data: [1],
                backgroundColor: ['rgba(255, 255, 255, 0.10)'],
                borderColor: 'rgba(255, 255, 255, 0.08)',
                borderWidth: 2,
                hoverOffset: 0
            }]
        };

    const commonOptions = getChartCommonOptions();
    charts.categorias = new Chart(ctx.getContext('2d'), {
        type: 'doughnut',
        data: chartData,
        options: {
            ...commonOptions,
            cutout: '64%',
            plugins: {
                ...commonOptions.plugins,
                legend: {
                    display: hasData,
                    position: 'bottom',
                    labels: {
                        color: 'rgba(255, 255, 255, 0.72)',
                        usePointStyle: true,
                        pointStyle: 'circle',
                        padding: 16
                    }
                },
                tooltip: {
                    enabled: hasData
                }
            },
            animations: {
                rotate: {
                    duration: 1100,
                    easing: 'easeOutQuart'
                },
                scale: {
                    duration: 900,
                    easing: 'easeOutBack'
                }
            }
        }
    });
}

function formatRecentAction(mov) {
    const badge = getBadgeClass(mov.tipo);
    const acao = mov.acao || mov.tipo || '-';
    return `<span class="badge ${badge}">${acao}</span>`;
}

function formatRecentQuantity(value, tipo) {
    const number = Number(value || 0);
    const normalized = String(tipo || '').toUpperCase();
    const prefix = normalized.startsWith('SAIDA') ? '-' : '+';
    return `${prefix}${number}`;
}

async function loadRecentMovements() {
    const tbody = document.querySelector('#table-recent-mov tbody');
    if (!tbody) return;

    try {
        const res = await fetch(`${API_URL}/dashboard/recent-movements`);
        if (!res.ok) {
            throw new Error(`Falha ao carregar ultimas movimentacoes (${res.status})`);
        }

        const movimentacoes = await res.json();
        if (!movimentacoes.length) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align:center">Nenhuma movimentacao recente encontrada.</td></tr>';
            return;
        }

        tbody.innerHTML = movimentacoes.map(mov => `
            <tr>
                <td>${mov.produto}</td>
                <td>${formatRecentAction(mov)}</td>
                <td>${formatRecentQuantity(mov.quantidade, mov.tipo)}</td>
                <td>${formatDate(mov.data_hora)}</td>
                <td>${mov.usuario || 'Sistema'}</td>
            </tr>
        `).join('');
    } catch (e) {
        console.error('Erro ao carregar ultimas movimentacoes', e);
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center">Nao foi possivel carregar as ultimas movimentacoes.</td></tr>';
    }
}

let dbHealthRequest = null;

function setDBHealthStatus(color, text) {
    const indicator = document.getElementById('db-status-indicator') || document.getElementById('db-status-dot');
    const statusText = document.getElementById('db-status-text');

    if (indicator) indicator.style.background = color;
    if (statusText) statusText.innerText = text;
}

async function checkDBHealth() {
    if (dbHealthRequest) return dbHealthRequest;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    setDBHealthStatus('#666', 'Verificando BD...');

    dbHealthRequest = (async () => {
        try {
            const res = await fetch(`${API_URL}/configuracoes/db-health`, {
                cache: 'no-store',
                signal: controller.signal
            });

            let data = null;
            try {
                data = await res.json();
            } catch (parseError) {
                data = null;
            }

            if (res.ok && data?.status === 'healthy') {
                setDBHealthStatus('#10b981', 'Banco Online');
                return;
            }

            console.error('Falha na verificação do banco', {
                status: res.status,
                body: data
            });
            setDBHealthStatus('#ef4444', 'Erro no Banco');
        } catch (e) {
            if (e.name === 'AbortError') {
                console.error('Tempo esgotado ao consultar a saúde do banco.');
                setDBHealthStatus('#ef4444', 'Banco sem resposta');
                return;
            }

            console.error('Erro ao consultar a saúde do banco', e);
            setDBHealthStatus('#ef4444', 'Banco Offline');
        } finally {
            clearTimeout(timeoutId);
            dbHealthRequest = null;
        }
    })();

    return dbHealthRequest;
}

// Check DB health every 30 seconds
setInterval(checkDBHealth, 30000);

async function handleMovementSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    data.quantidade = parseFloat(data.quantidade);
    data.usuario = state.user?.username || 'Sistema';

    try {
        const res = await fetch(`${API_URL}/movimentacoes/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (res.ok) {
            showNotify("Movimentação realizada!", "success");
            closeModal('modal-movimentacao');
            refreshData();
            return;
        }

        const err = await res.json();
        showNotify(err.detail || "Erro ao lançar movimentação.", "error");
    } catch (e) { console.error(e); }
}

function initWebSocket() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const socket = new WebSocket(wsUrl);

    socket.onmessage = (event) => {
        try {
            const data = JSON.parse(event.data);
            if (data.type === 'LOW_STOCK' || data.type === 'MACHINE_STATUS') {
                showRealtimeNotify(data);
                if (state.currentView === 'produtos' && data.type === 'LOW_STOCK') {
                    if (typeof loadProducts === 'function') loadProducts();
                }
            }
        } catch (e) {
            console.error("Erro ao processar mensagem WS:", e);
        }
    };

    socket.onclose = () => {
        console.log("WebSocket desconectado. Tentando reconectar em 5s...");
        setTimeout(initWebSocket, 5000);
    };
}

function showRealtimeNotify(data) {
    const type = data.severity === 'warning' ? 'error' : 'info';
    showNotify(`${data.title}: ${data.message}`, type);
}

