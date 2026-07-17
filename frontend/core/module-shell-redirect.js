(function redirectStandaloneModule() {
    const currentScript = document.currentScript;
    const moduleId = currentScript?.dataset?.moduleId;
    const shellName = currentScript?.dataset?.shell || 'default';

    if (!moduleId) return;

    const normalizedPath = String(window.location.pathname || '').replace(/\\/g, '/');
    const isStandaloneModule =
        window.top === window.self &&
        (window.location.protocol === 'file:' || normalizedPath.includes('/modules/'));

    if (!isStandaloneModule) return;

    const shellEntry = shellName === 'comercial' ? '/comercial/index.html' : '/index.html';
    const targetUrl = window.location.protocol === 'file:'
        ? `http://localhost:8000${shellEntry}#${moduleId}`
        : `${window.location.origin}${shellEntry}#${moduleId}`;

    if (window.location.href === targetUrl) return;

    window.location.replace(targetUrl);
})();
