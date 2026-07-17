// === UTILITÁRIOS DE UI ===

window.switchTab = function(tabId) {
    const modal = document.querySelector('.modal.active');
    if (!modal) return;

    modal.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    modal.querySelectorAll('.tab-btn').forEach(button => button.classList.remove('active'));

    const targetContent = document.getElementById(tabId);
    if (targetContent) targetContent.classList.add('active');

    const triggerButton = modal.querySelector(`[onclick*="${tabId}"]`);
    if (triggerButton) triggerButton.classList.add('active');
};

window.openModal = function(id) {
    const modal = document.getElementById(id);
    if (!modal) return;

    modal.classList.add('active');
    if (id === 'modal-produto') switchTab('tab-geral');
};

window.closeModal = function(id) {
    const modal = document.getElementById(id);
    if (!modal) return;

    modal.classList.remove('active');
};

// ponytail: close topmost modal on Escape key
document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    const active = document.querySelector('.modal.active');
    if (active) {
        active.classList.remove('active');
        e.preventDefault();
    }
});

// ponytail: close modal on backdrop click (click on .modal itself, not .modal-content)
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal') && e.target.classList.contains('active')) {
        e.target.classList.remove('active');
    }
});

// ponytail: toast icons per type
const TOAST_ICONS = {
    success: 'ph ph-check-circle',
    error: 'ph ph-x-circle',
    warning: 'ph ph-warning',
    info: 'ph ph-info'
};

function ensureToastContainer() {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'toast-container';
        document.body.appendChild(container);
    }
    return container;
}

window.showNotify = function(message, type = 'info') {
    const container = ensureToastContainer();
    const toast = document.createElement('div');
    toast.className = `toast-item ${type}`;
    const icon = TOAST_ICONS[type] || TOAST_ICONS.info;
    // ponytail: sanitize message to prevent XSS
    const span = document.createElement('span');
    span.textContent = message;
    toast.innerHTML = `<i class="${icon}"></i>`;
    toast.appendChild(span);
    const progress = document.createElement('div');
    progress.className = 'toast-progress';
    toast.appendChild(progress);
    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('leaving');
        setTimeout(() => toast.remove(), 300);
    }, 4000);
};

// Alias global para módulos que usam window.ui.showToast
window.ui = window.ui || {};
window.ui.showToast = window.showNotify;

// Loading state helpers for buttons
window.ui.btnLoading = function(btn, text) {
    if (!btn) return;
    btn._originalText = btn.innerHTML;
    btn.classList.add('btn-loading');
    if (text) btn.innerHTML = `<span>${text}</span>`;
};

window.ui.btnReset = function(btn) {
    if (!btn) return;
    btn.classList.remove('btn-loading');
    if (btn._originalText) btn.innerHTML = btn._originalText;
};

// Empty state helper — returns an HTML string
window.ui.emptyState = function(icon, title, description, actionHtml) {
    return `
        <div class="empty-state">
            <i class="${icon || 'ph ph-tray'}"></i>
            <h4>${title || 'Nenhum item encontrado'}</h4>
            <p>${description || ''}</p>
            ${actionHtml || ''}
        </div>
    `;
};

window.logout = function() {
    if (window.redirectToLogin) {
        window.redirectToLogin();
        return;
    }

    const isDesktop = sessionStorage.getItem('venner_desktop_mode') === '1';
    sessionStorage.removeItem('token');

    if (isDesktop) {
        // No modo desktop, "Sair" significa voltar ao seletor de módulos (Hub)
        // Tentamos fechar a janela atual. O Hub já está aberto em background.
        try {
            window.close();
        } catch (e) {
            console.error("Não foi possível fechar a janela via script:", e);
        }
        
        // Se não fechou (ex: restrição do browser), redireciona para login mas avisa
        setTimeout(() => {
            if (!window.closed) {
                window.location.href = '/login.html?logout=hub';
            }
        }, 300);
    } else {
        window.location.href = '/login.html';
    }
};

window.confirmAction = function(title, message, options = {}) {
    return new Promise((resolve) => {
        const modalId = 'modal-confirm-custom';
        let existing = document.getElementById(modalId);
        if (existing) existing.remove();

        const confirmText = options.confirmText || 'Confirmar';
        const cancelText = options.cancelText || 'Cancelar';
        const color = options.color || 'var(--accent)';
        const icon = options.icon || 'ph ph-warning';

        const html = `
            <div id="${modalId}" class="modal active" style="z-index: 10000;">
                <div class="modal-content card" style="max-width: 400px; text-align: center; padding: 40px; animation: modalIn 0.3s ease-out;">
                    <div style="width: 70px; height: 70px; background: rgba(255,255,255,0.05); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; border: 2px solid ${color};">
                        <i class="${icon}" style="font-size: 35px; color: ${color};"></i>
                    </div>
                    <h3 style="margin-bottom: 15px; font-size: 1.4rem; font-family: 'Michroma', sans-serif;">${title}</h3>
                    <p style="color: var(--text-secondary); margin-bottom: 30px; line-height: 1.5; font-size: 0.95rem;">${message}</p>
                    <div style="display: flex; gap: 15px; justify-content: center;">
                        <button class="btn btn-outline" id="confirm-btn-cancel" style="flex: 1;">${cancelText}</button>
                        <button class="btn btn-primary" id="confirm-btn-ok" style="background: ${color}; flex: 1; border-color: ${color};">${confirmText}</button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', html);

        const modal = document.getElementById(modalId);
        const okBtn = document.getElementById('confirm-btn-ok');
        const cancelBtn = document.getElementById('confirm-btn-cancel');

        const cleanup = (result) => {
            modal.remove();
            resolve(result);
        };

        okBtn.onclick = () => cleanup(true);
        cancelBtn.onclick = () => cleanup(false);
        modal.onclick = (e) => { if (e.target === modal) cleanup(false); };
    });
};

window.formatCurrency = function(value) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value || 0);
};

window.formatDate = function(dateStr) {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleString('pt-BR');
};

window.getBadgeClass = function(tipo) {
    const normalized = String(tipo || '').toUpperCase();
    if (normalized.startsWith('ENTRADA')) return 'badge-success';
    if (normalized.startsWith('SAIDA')) return 'badge-danger';
    if (normalized === 'AJUSTE') return 'badge-warning';
    return 'badge-info';
};

window.toggleCustomSelect = function(trigger) {
    const select = trigger.closest('.custom-select');
    if (!select) return;

    document.querySelectorAll('.custom-select.active').forEach(item => {
        if (item !== select) item.classList.remove('active');
    });

    select.classList.toggle('active');
};

document.addEventListener('click', (event) => {
    const option = event.target.closest('.select-option');
    if (option) {
        const customSelect = option.closest('.custom-select');
        if (!customSelect) return;

        customSelect.querySelectorAll('.select-option').forEach(item => item.classList.remove('selected'));
        option.classList.add('selected');

        const trigger = customSelect.querySelector('.select-trigger');
        const hiddenInput = customSelect.querySelector('input[type="hidden"]');

        if (trigger) trigger.innerText = option.innerText;
        if (hiddenInput) hiddenInput.value = option.dataset.value || '';

        customSelect.classList.remove('active');
        return;
    }

    if (!event.target.closest('.custom-select')) {
        document.querySelectorAll('.custom-select.active').forEach(select => select.classList.remove('active'));
    }
});



window.renderModernPagination = function(containerId, currentPage, itemsPerPage, totalItems, changePageModuleStr, changeLimitModuleStr) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
    
    // Exibindo X a Y de Z produtos
    const start = totalItems === 0 ? 0 : (currentPage * itemsPerPage) + 1;
    const end = Math.min((currentPage + 1) * itemsPerPage, totalItems);
    const text = Exibindo  + start +  de  + totalItems +  registro(s);

    let html = 
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 16px 24px; border: 1px solid #2a2c38; border-radius: 12px; background: #15161b; margin-top: 16px; flex-wrap: wrap; gap: 12px;">
            <div style="color: #9ca3af; font-size: 13px;"> + text + </div>
            <div style="display: flex; gap: 16px; align-items: center; flex-wrap: wrap;">
                <div style="position: relative;">
                    <select onchange=" + changeLimitModuleStr + (this.value)" style="appearance: none; background: transparent; border: 1px solid #2a2c38; border-radius: 8px; color: #e5e7eb; padding: 6px 32px 6px 12px; font-size: 13px; cursor: pointer; outline: none;">
                        <option value="10"  + (itemsPerPage === 10 ? 'selected' : '') +  style="background: #1a1b23;">10 por p�gina</option>
                        <option value="20"  + (itemsPerPage === 20 ? 'selected' : '') +  style="background: #1a1b23;">20 por p�gina</option>
                        <option value="50"  + (itemsPerPage === 50 ? 'selected' : '') +  style="background: #1a1b23;">50 por p�gina</option>
                        <option value="100"  + (itemsPerPage === 100 ? 'selected' : '') +  style="background: #1a1b23;">100 por p�gina</option>
                    </select>
                    <i class="ph ph-caret-down" style="position: absolute; right: 12px; top: 50%; transform: translateY(-50%); color: #9ca3af; pointer-events: none; font-size: 12px;"></i>
                </div>
                
                <div style="display: flex; gap: 4px;">
                    <button style="background: transparent; border: 1px solid transparent; color:  + (currentPage === 0 ? '#4b5563' : '#e5e7eb') + ; padding: 6px; cursor:  + (currentPage === 0 ? 'not-allowed' : 'pointer') + ; border-radius: 6px;"  + (currentPage === 0 ? 'disabled' : '') +  onclick=" + changePageModuleStr + ( + (currentPage - 1) + )">
                        <i class="ph ph-caret-left"></i>
                    </button>
                    <button style="background: #1e3a8a; border: 1px solid #3b82f6; color: #60a5fa; padding: 4px 12px; border-radius: 6px; font-weight: 600; font-size: 13px;">
                         + (currentPage + 1) + 
                    </button>
                    <button style="background: transparent; border: 1px solid transparent; color:  + (currentPage >= totalPages - 1 ? '#4b5563' : '#e5e7eb') + ; padding: 6px; cursor:  + (currentPage >= totalPages - 1 ? 'not-allowed' : 'pointer') + ; border-radius: 6px;"  + (currentPage >= totalPages - 1 ? 'disabled' : '') +  onclick=" + changePageModuleStr + ( + (currentPage + 1) + )">
                        <i class="ph ph-caret-right"></i>
                    </button>
                </div>
            </div>
        </div>
    ;
    container.innerHTML = html;
};

window.renderSkeletonLoaders = function(columnsCount, rowsCount = 3) {
    let rows = '';
    for (let i = 0; i < rowsCount; i++) {
        let cols = '';
        for (let j = 0; j < columnsCount; j++) {
            cols += '<td><span class="skeleton-loader" style="width: ' + Math.max(40, Math.random() * 100) + '%;"></span></td>';
        }
        rows += '<tr>' + cols + '</tr>';
    }
    return rows;
};

window.renderEmptyState = function(columnsCount, icon, title, message, actionHtml = '') {
    return '<tr><td colspan="' + columnsCount + '"><div class="empty-state"><i class="' + icon + ' empty-state-icon"></i><div class="empty-state-title">' + title + '</div><div class="empty-state-desc">' + message + '</div>' + (actionHtml ? '<div class="empty-state-action">' + actionHtml + '</div>' : '') + '</div></td></tr>';
};
