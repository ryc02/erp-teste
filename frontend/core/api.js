window.API_URL = '/api/v1';

window.resolveLoginPath = function() {
    return window.APP_LOGIN_PATH || sessionStorage.getItem('app_login_path') || '/login.html';
};

window.isDesktopAgentEnabled = function() {
    return sessionStorage.getItem('venner_desktop_mode') === '1';
};

window.resolveAgentUrl = function() {
    const configured = sessionStorage.getItem('venner_agent_url') || '';
    return configured.replace(/\/$/, '');
};

window.resolveAuthorizationHeader = function() {
    const token = sessionStorage.getItem('token') || '';
    return token ? `Bearer ${token}` : '';
};

window.resolveAbsoluteUrl = function(url) {
    return new URL(url, window.location.origin).toString();
};

window.callAgentAction = async function(actionPath, payload, fallbackActionPath = '') {
    const agentUrl = window.resolveAgentUrl();
    const send = async (path) => {
        const response = await fetch(`${agentUrl}${path}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            let detail = `Agent respondeu com status ${response.status}`;
            try {
                const data = await response.json();
                detail = data.detail || detail;
            } catch (error) {}

            const failure = new Error(detail);
            failure.status = response.status;
            throw failure;
        }

        try {
            return await response.json();
        } catch (error) {
            return { status: 'ok' };
        }
    };

    try {
        return await send(actionPath);
    } catch (error) {
        if (fallbackActionPath && error.status === 404) {
            return send(fallbackActionPath);
        }
        throw error;
    }
};

window.redirectToLogin = function() {
    sessionStorage.removeItem('token');
    window.location.href = window.resolveLoginPath();
};

window.openDocumentViaAgent = async function(url, options = {}) {
    const absoluteUrl = window.resolveAbsoluteUrl(url);
    const target = options.target || '_blank';

    if (!window.isDesktopAgentEnabled() || !window.resolveAgentUrl()) {
        window.open(absoluteUrl, target);
        return true;
    }

    const placeholderWindow = window.open('', target);
    const authorization = window.resolveAuthorizationHeader();

    try {
        await window.callAgentAction('/actions/open-document', {
            url: absoluteUrl,
            authorization,
            prefer_app_mode: options.preferAppMode !== false,
            width: options.width || null,
            height: options.height || null,
            document_kind: options.documentKind || 'auto'
        }, '/actions/open-url');

        if (placeholderWindow && !placeholderWindow.closed) {
            placeholderWindow.close();
        }
        return true;
    } catch (error) {
        console.error('Falha ao usar o Venner Agent para abrir documento:', error);

        if (placeholderWindow && !placeholderWindow.closed) {
            placeholderWindow.location.href = absoluteUrl;
        } else {
            window.open(absoluteUrl, target);
        }

        if (window.showNotify) {
            window.showNotify('Agent indisponível. Abrindo documento pelo navegador.', 'warning');
        }
        return false;
    }
};

window.printDocumentViaAgent = async function(url, options = {}) {
    const absoluteUrl = window.resolveAbsoluteUrl(url);
    const authorization = window.resolveAuthorizationHeader();

    if (!window.isDesktopAgentEnabled() || !window.resolveAgentUrl()) {
        window.open(absoluteUrl, '_blank');
        return true;
    }

    try {
        await window.callAgentAction('/actions/print-document', {
            url: absoluteUrl,
            authorization,
            width: options.width || null,
            height: options.height || null,
            document_kind: options.documentKind || 'auto',
            prefer_browser_print: options.preferBrowserPrint === true
        }, '/actions/print-url');

        if (!options.suppressNotify && window.showNotify) {
            window.showNotify('Documento enviado para impressão pelo Agent.', 'success');
        }
        return true;
    } catch (error) {
        console.error('Falha ao usar o Venner Agent para imprimir documento:', error);
        window.open(absoluteUrl, '_blank');
        if (!options.suppressNotify && window.showNotify) {
            window.showNotify('Agent indisponível. Abrindo visualização de impressão no navegador.', 'warning');
        }
        return false;
    }
};

window.printLabelViaAgent = async function(zplUrl, htmlUrl, options = {}) {
    const absoluteZplUrl = window.resolveAbsoluteUrl(zplUrl);
    const absoluteHtmlUrl = window.resolveAbsoluteUrl(htmlUrl);
    const authorization = window.resolveAuthorizationHeader();

    if (!window.isDesktopAgentEnabled() || !window.resolveAgentUrl()) {
        window.open(absoluteHtmlUrl, '_blank');
        return true;
    }

    try {
        await window.callAgentAction('/actions/print-zpl', {
            url: absoluteZplUrl,
            authorization
        });

        if (window.showNotify) {
            window.showNotify('Etiqueta enviada para a impressora ZPL pelo Agent.', 'success');
        }
        return true;
    } catch (error) {
        console.error('Falha ao usar a bridge ZPL do Venner Agent:', error);
        const fallbackPrinted = await window.printDocumentViaAgent(absoluteHtmlUrl, {
            width: options.width || null,
            height: options.height || null,
            documentKind: 'label',
            preferBrowserPrint: true,
            suppressNotify: true
        });

        if (window.showNotify) {
            window.showNotify('Impressora ZPL indisponível no Agent. Usando impressão HTML como fallback.', 'warning');
        }
        return fallbackPrinted;
    }
};

window.apiFetch = async function(endpoint, options = {}) {
    const token = sessionStorage.getItem('token');
    const headers = new Headers(options.headers || {});

    if (token) {
        headers.set('Authorization', `Bearer ${token}`);
    }

    if (options.body && !(options.body instanceof FormData) && !headers.has('Content-Type')) {
        headers.set('Content-Type', 'application/json');
    }

    let url = endpoint;
    if (!endpoint.startsWith('http')) {
        url = endpoint.startsWith('/api')
            ? endpoint
            : `${window.API_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
    }

    const response = await fetch(url, {
        ...options,
        headers
    });

    if (response.status === 401 && !window.location.pathname.endsWith('/login.html')) {
        window.redirectToLogin();
    }

    if (!response.ok) {
        const contentType = response.headers.get("content-type");
        let errorMessage = "Erro na requisição";
        try {
            if (contentType && contentType.indexOf("application/json") !== -1) {
                const errData = await response.clone().json();
                errorMessage = errData.detail || errorMessage;
            }
        } catch (e) {}
        
        if (window.showNotify) {
            window.showNotify(errorMessage, "error");
        }
    }

    return response;
};
