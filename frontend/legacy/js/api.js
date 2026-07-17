const API_URL = '/api/v1';

// Interceptor de Fetch para Autenticação
const originalFetch = window.fetch;
window.fetch = async (...args) => {
    const token = sessionStorage.getItem('token');
    if (token) {
        if (!args[1]) args[1] = {};
        if (!args[1].headers) args[1].headers = {};
        
        if (args[1].body && !(args[1].body instanceof FormData)) {
            if (!args[1].headers['Content-Type']) {
                args[1].headers['Content-Type'] = 'application/json';
            }
        }
        args[1].headers['Authorization'] = `Bearer ${token}`;
    }
    const response = await originalFetch(...args);
    if (response.status === 401 && !window.location.href.includes('login.html')) {
        sessionStorage.removeItem('token');
        window.location.href = '/login.html';
    }
    return response;
};
