// ERP VENNER - SHELL ORCHESTRATOR
// Shell único: controla permissões, menu lateral e lazy loading dos módulos.

window.state = window.state || {
    currentView: 'dashboard',
    user: null,
    products: [],
    productCatalog: [],
    productCatalogLoadedAt: 0,
    productCatalogPromise: null,
    modulos: [],
    allUsers: []
};
var state = window.state;

window.charts = window.charts || {
    fluxo: null,
    categorias: null
};
var charts = window.charts;

const loadedScripts = new Map();
const moduleHtmlCache = new Map();
const PRODUCT_CATALOG_MAX_AGE_MS = 30000;
// ponytail: session-stable cache buster — same value for the whole page session,
// so in-memory caches work but browser cache is busted on refresh
const CACHE_VERSION = Date.now();

document.addEventListener('DOMContentLoaded', async () => {
    console.log("ERP Venner Shell Initializing...");

    bindShellEvents();

    if (!sessionStorage.getItem('token')) {
        window.location.href = window.resolveLoginPath ? window.resolveLoginPath() : '/login.html';
        return;
    }

    try {
        await loadUserProfile();
        renderSidebarMenu();

        const initialModuleId = resolveInitialModule();
        if (initialModuleId) {
            await carregarModulo(initialModuleId);
        } else {
            renderEmptyAccessState();
        }

        if (!window.APP_DISABLE_REALTIME) {
            initWebSocket();
        }
        checkDBHealth();
    } catch (e) {
        console.error("Erro na inicialização", e);
        showNotify("Erro ao carregar dados iniciais.", "error");
    }

    setInterval(() => {
        if (window[`Modulo_${state.currentView}`]?.refresh) {
            window[`Modulo_${state.currentView}`].refresh();
        }
    }, 60000);
});

||

function handleMenuInteraction(event) {
    const menuItem = event.target.closest('[data-module]');
    if (!menuItem) return;

    carregarModulo(menuItem.dataset.module);
}

function handleMenuPrefetch(event) {
    const menuItem = event.target.closest('[data-module]');
    if (!menuItem) return;

    prefetchModuleAssets(menuItem.dataset.module, { includeScript: true });
}

async function loadUserProfile() {
    try {
        const res = await apiFetch('/usuarios/me');
        if (res.ok) {
            state.user = await res.json();
            if (state.user) {
                document.getElementById('user-name').innerText = state.user.nome_completo || state.user.username;
                document.getElementById('user-role').innerText = state.user.role?.nome || 'USUÁRIO';
            }
        } else if (res.status === 401) {
            if (window.redirectToLogin) {
                window.redirectToLogin();
            } else {
                window.location.href = '/login.html';
            }
        }
    } catch (e) {
        console.error("Erro ao carregar perfil", e);
    }
}

function normalizePermissionKey(value) {
    return String(value || '').trim().toUpperCase();
}

function getUserRoleName() {
    return normalizePermissionKey(state.user?.role?.nome || 'OPERADOR');
}

function parsePermissionPayload(rawPermissions) {
    if (!rawPermissions) return [];

    if (Array.isArray(rawPermissions)) {
        return rawPermissions.flatMap(parsePermissionPayload);
    }

    if (typeof rawPermissions === 'string') {
        const trimmed = rawPermissions.trim();
        if (!trimmed) return [];

        const looksLikeJson =
            (trimmed.startsWith('[') && trimmed.endsWith(']')) ||
            (trimmed.startsWith('{') && trimmed.endsWith('}'));

        if (looksLikeJson) {
            try {
                return parsePermissionPayload(JSON.parse(trimmed));
            } catch (e) {
                console.warn("Permissões em formato JSON inválido:", e);
            }
        }

        return trimmed
            .split(/[\n,;|]+/)
            .map(item => item.trim())
            .filter(Boolean);
    }

    if (typeof rawPermissions === 'object') {
        return Object.entries(rawPermissions)
            .filter(([, enabled]) => Boolean(enabled))
            .map(([key]) => key);
    }

    return [];
}

function getUserPermissionSet() {
    const permissions = new Set(['AUTHENTICATED', getUserRoleName()]);
    
    // 1. Permissões do cargo (Role)
    const rolePermissions = parsePermissionPayload(state.user?.role?.permissoes);
    rolePermissions
        .map(normalizePermissionKey)
        .filter(Boolean)
        .forEach(p => permissions.add(p));

    // 2. Permissões específicas do usuário (Override)
    const userPermissions = parsePermissionPayload(state.user?.permissoes);
    userPermissions
        .map(normalizePermissionKey)
        .filter(Boolean)
        .forEach(p => permissions.add(p));

    if (permissions.has('ADMIN')) {
        permissions.add('*');
    }

    return permissions;
}

function hasExplicitUserPermissions() {
    // Verifica se o usuário tem permissões individuais definidas (além das do cargo)
    return parsePermissionPayload(state.user?.permissoes).length > 0;
}

function hasModuleAccess(moduleId) {
    const moduleConfig = window.getAppModule(moduleId);
    if (!moduleConfig) return false;

    const permissions = getUserPermissionSet();
    if (permissions.has('*')) return true;

    const roleAllowed = Array.isArray(moduleConfig.roles) && moduleConfig.roles.includes(getUserRoleName());
    const permissionAllowed = Array.isArray(moduleConfig.permissionKeys) &&
        moduleConfig.permissionKeys.some(permission => permissions.has(normalizePermissionKey(permission)));

    if (!moduleConfig.roles?.length && !moduleConfig.permissionKeys?.length) {
        return true;
    }

    if (hasExplicitUserPermissions()) {
        return permissionAllowed;
    }

    return roleAllowed || permissionAllowed;
}

window.hasModuleAccess = hasModuleAccess;

function getVisibleModules() {
    return window.listAppModules().filter(moduleConfig => hasModuleAccess(moduleConfig.id));
}

// ponytail: featureGroup labels map — add new groups here
const FEATURE_GROUP_LABELS = {
    CORE: 'Geral',
    COMERCIAL: 'Comercial',
    ESTOQUE: 'Estoque',
    LOGISTICA: 'Logística',
    PRODUCAO: 'Produção',
    ADMIN: 'Administração'
};

function renderSidebarMenu() {
    const menu = document.getElementById('side-menu');
    if (!menu) return;

    const visibleModules = getVisibleModules();
    if (!visibleModules.length) {
        menu.innerHTML = `
            <div class="nav-item active" aria-disabled="true">
                <i class="ph ph-lock"></i> Sem módulos disponíveis
            </div>
        `;
        return;
    }

    // Agrupa por featureGroup preservando a ordem de cada módulo
    const groups = {};
    const groupOrder = [];
    for (const mod of visibleModules) {
        const g = mod.featureGroup || 'OUTROS';
        if (!groups[g]) {
            groups[g] = [];
            groupOrder.push(g);
        }
        groups[g].push(mod);
    }

    let html = '';
    for (const group of groupOrder) {
        const label = FEATURE_GROUP_LABELS[group] || group;
        html += `<div class="nav-group-label">${label}</div>`;
        for (const mod of groups[group]) {
            html += `
                <div
                    class="nav-item ${state.currentView === mod.id ? 'active' : ''}"
                    data-module="${mod.id}"
                    role="button"
                    tabindex="0"
                    title="${mod.pageTitle || mod.label}"
                >
                    <i class="${mod.icon}"></i> ${mod.label}
                </div>
            `;
        }
    }
    menu.innerHTML = html;
}

function queueIdleWork(callback, timeout = 1500) {
    if (typeof window.requestIdleCallback === 'function') {
        window.requestIdleCallback(callback, { timeout });
        return;
    }

    window.setTimeout(callback, 300);
}

function resolveInitialModule() {
    const requestedModule = normalizeHashModuleId(window.location.hash);
    if (requestedModule && hasModuleAccess(requestedModule)) {
        return requestedModule;
    }

    const firstVisibleModule = getVisibleModules()[0];
    return firstVisibleModule ? firstVisibleModule.id : null;
}

function normalizeHashModuleId(hashValue) {
    const moduleId = String(hashValue || '').replace(/^#/, '').trim();
    return window.getAppModule(moduleId) ? moduleId : null;
}

function updatePageTitle(moduleConfig, overrideTitle = null) {
    const titleElement = document.getElementById('page-current-title');
    if (!titleElement) return;

    titleElement.innerText = overrideTitle || moduleConfig?.pageTitle || moduleConfig?.label || 'ERP Venner';
}

function updateActiveModuleUI(moduleId) {
    document.querySelectorAll('#side-menu [data-module]').forEach(menuItem => {
        menuItem.classList.toggle('active', menuItem.dataset.module === moduleId);
    });

    updatePageTitle(window.getAppModule(moduleId));
}

function renderShellCard(icon, title, message) {
    const content = document.getElementById('content');
    if (!content) return;

    content.dataset.moduleLoaded = '';
    content.innerHTML = `
        <div class="card" style="padding: 40px; text-align: center;">
            <i class="${icon}" style="font-size: 48px; color: var(--accent);"></i>
            <h3 style="margin-top: 16px;">${title}</h3>
            <p>${message}</p>
        </div>
    `;
}

function renderModuleLoading(moduleConfig) {
    renderShellCard(
        'ph ph-circle-notch animate-spin',
        `Carregando ${moduleConfig.pageTitle || moduleConfig.label}`,
        'Preparando a interface do módulo...'
    );
}

function renderAccessDenied(moduleId) {
    const moduleConfig = window.getAppModule(moduleId);
    updatePageTitle(moduleConfig, 'Sem Acesso');
    renderShellCard(
        'ph ph-shield-warning',
        'Acesso negado',
        `Você não tem permissão para acessar ${moduleConfig?.label || 'este módulo'}.`
    );
}

function renderModuleError(moduleId, message) {
    const moduleConfig = window.getAppModule(moduleId);
    updatePageTitle(moduleConfig, 'Erro ao carregar');
    renderShellCard(
        'ph ph-warning-octagon',
        'Erro ao carregar módulo',
        message || `Não foi possível carregar ${moduleConfig?.label || moduleId}.`
    );
}

function renderEmptyAccessState() {
    updatePageTitle(null, 'Sem Módulos');
    renderShellCard(
        'ph ph-lock-key',
        'Nenhum módulo disponível',
        'O seu usuário está autenticado, mas ainda não possui módulos liberados.'
    );
}

async function destroyCurrentModule() {
    const currentModule = state.currentView ? window[`Modulo_${state.currentView}`] : null;
    if (!currentModule || typeof currentModule.destroy !== 'function') return;

    try {
        await currentModule.destroy();
    } catch (e) {
        console.error(`Erro ao destruir módulo ${state.currentView}:`, e);
    }
}

function getModuleHtmlPath(moduleConfig) {
    return `modules/${moduleConfig.folder}/${moduleConfig.id}.html?v=${CACHE_VERSION}`;
}

function getModuleScriptPath(moduleConfig) {
    return `modules/${moduleConfig.folder}/${moduleConfig.id}.js?v=${CACHE_VERSION}`;
}

function ensureModuleDependencies(moduleConfig) {
    const externalScripts = Array.isArray(moduleConfig.externalScripts)
        ? moduleConfig.externalScripts
        : [];

    if (!externalScripts.length) {
        return Promise.resolve();
    }

    return Promise.all(externalScripts.map(scriptPath => loadScriptOnce(scriptPath)));
}

async function fetchModuleHtml(moduleConfig) {
    const cacheKey = moduleConfig.id;
    if (moduleHtmlCache.has(cacheKey)) {
        return moduleHtmlCache.get(cacheKey);
    }

    const htmlPromise = fetch(getModuleHtmlPath(moduleConfig))
        .then(response => {
            if (!response.ok) {
                throw new Error(`Módulo ${moduleConfig.label} não encontrado.`);
            }

            return response.text();
        })
        .catch(error => {
            moduleHtmlCache.delete(cacheKey);
            throw error;
        });

    moduleHtmlCache.set(cacheKey, htmlPromise);
    return htmlPromise;
}

function loadScriptOnce(path) {
    if (document.querySelector(`script[src="${path}"]`)) {
        return Promise.resolve();
    }

    if (loadedScripts.has(path)) {
        return loadedScripts.get(path);
    }

    const promise = new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = path;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error(`Falha ao carregar o script ${path}`));
        document.head.appendChild(script);
    });

    loadedScripts.set(path, promise);
    return promise;
}

function prefetchModuleAssets(moduleId, options = {}) {
    const moduleConfig = window.getAppModule(moduleId);
    if (!moduleConfig || !hasModuleAccess(moduleId)) return;

    fetchModuleHtml(moduleConfig).catch(() => {});
    ensureModuleDependencies(moduleConfig).catch(() => {});

    if (options.includeScript) {
        loadScriptOnce(getModuleScriptPath(moduleConfig)).catch(() => {});
    }
}

function scheduleVisibleModulePrefetch(activeModuleId) {
    const candidates = getVisibleModules()
        .filter(moduleConfig => moduleConfig.id !== activeModuleId)
        .slice(0, 4);

    if (!candidates.length) return;

    queueIdleWork(() => {
        candidates.forEach((moduleConfig, index) => {
            prefetchModuleAssets(moduleConfig.id, { includeScript: index < 2 });
        });
    });
}

window.ensureProductCatalog = async function(options = {}) {
    const { force = false, maxAgeMs = PRODUCT_CATALOG_MAX_AGE_MS } = options;
    const now = Date.now();
    const cacheIsFresh =
        !force &&
        Array.isArray(state.productCatalog) &&
        state.productCatalog.length > 0 &&
        (now - state.productCatalogLoadedAt) < maxAgeMs;

    if (cacheIsFresh) {
        return state.productCatalog;
    }

    if (!force && state.productCatalogPromise) {
        return state.productCatalogPromise;
    }

    state.productCatalogPromise = apiFetch('/produtos/catalogo?status=todos')
        .then(async (res) => {
            if (!res.ok) {
                throw new Error(`Falha ao carregar catálogo de produtos (${res.status})`);
            }

            const products = await res.json();
            state.productCatalog = products;
            state.productCatalogLoadedAt = Date.now();
            return products;
        })
        .finally(() => {
            state.productCatalogPromise = null;
        });

    return state.productCatalogPromise;
};

window.invalidateProductCatalog = function() {
    state.productCatalogLoadedAt = 0;
    state.productCatalogPromise = null;
};

window.carregarModulo = async function(moduloId) {
    console.log(`Carregando módulo: ${moduloId}`);

    const moduleConfig = window.getAppModule(moduloId);
    const content = document.getElementById('content');

    if (!moduleConfig) {
        renderModuleError(moduloId, `Módulo ${moduloId} não está registrado no shell.`);
        return;
    }

    if (!hasModuleAccess(moduloId)) {
        renderAccessDenied(moduloId);
        return;
    }

    if (moduloId === state.currentView && content?.dataset.moduleLoaded === moduloId) {
        updateActiveModuleUI(moduloId);
        if (window[`Modulo_${moduloId}`]?.refresh) {
            window[`Modulo_${moduloId}`].refresh();
        }
        return;
    }

    renderModuleLoading(moduleConfig);

    try {
        await destroyCurrentModule();

        const [html] = await Promise.all([
            fetchModuleHtml(moduleConfig),
            ensureModuleDependencies(moduleConfig),
            loadScriptOnce(getModuleScriptPath(moduleConfig))
        ]);

        if (!content) return;

        content.innerHTML = html;
        content.dataset.moduleLoaded = moduloId;

        const viewSection = content.querySelector('.view-section');
        if (viewSection) viewSection.classList.add('active');

        const moduleName = `Modulo_${moduloId}`;
        if (window[moduleName] && typeof window[moduleName].init === 'function') {
            await window[moduleName].init();
        }

        state.currentView = moduloId;
        updateActiveModuleUI(moduloId);
        scheduleVisibleModulePrefetch(moduloId);

        if (window.location.hash !== `#${moduloId}`) {
            window.location.hash = moduloId;
        }
    } catch (e) {
        console.error(`Erro ao carregar módulo ${moduloId}:`, e);
        renderModuleError(moduloId, e.message);
    }
};

window.showView = window.carregarModulo;

window.addEventListener('hashchange', () => {
    const targetModule = normalizeHashModuleId(window.location.hash);
    if (!targetModule || targetModule === state.currentView) return;
    if (!hasModuleAccess(targetModule)) return;

    carregarModulo(targetModule);
});

// WebSocket Integration
function initWebSocket() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const socket = new WebSocket(wsUrl);

    socket.onmessage = (event) => {
        try {
            const data = JSON.parse(event.data);
            if (data.type === 'LOW_STOCK' || data.type === 'MACHINE_STATUS') {
                showNotify(`${data.title}: ${data.message}`, data.severity === 'warning' ? 'error' : 'info');
                // Avisar módulo ativo se ele tiver listener
                if (window[`Modulo_${state.currentView}`]?.onWebSocketMessage) {
                    window[`Modulo_${state.currentView}`].onWebSocketMessage(data);
                }
            }
        } catch (e) { console.error("WS Error:", e); }
    };

    socket.onclose = () => setTimeout(initWebSocket, 5000);
}

// Health Check
async function checkDBHealth() {
    try {
        const res = await apiFetch('/configuracoes/db-health');
        const data = await res.json();
        const indicator = document.getElementById('db-status-dot');
        const text = document.getElementById('db-status-text');
        
        if (data.status === 'healthy') {
            if (indicator) indicator.style.background = '#10b981';
            if (text) text.innerText = 'Banco Online';
        } else {
            if (indicator) indicator.style.background = '#ef4444';
            if (text) text.innerText = 'Erro no Banco';
        }
    } catch (e) {
        const indicator = document.getElementById('db-status-dot');
        const text = document.getElementById('db-status-text');
        if (indicator) indicator.style.background = '#ef4444';
        if (text) text.innerText = 'Banco Offline';
    }
}
setInterval(checkDBHealth, 30000);
