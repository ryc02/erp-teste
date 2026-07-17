// === UTILITÁRIOS DE UI ===

window.switchTab = function(tabId) {
    const modal = document.querySelector('.modal.active');
    if (!modal) return;
    
    modal.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    modal.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    
    const targetContent = document.getElementById(tabId);
    if (targetContent) targetContent.classList.add('active');
    
    const btn = modal.querySelector(`[onclick*="${tabId}"]`);
    if (btn) btn.classList.add('active');
}

window.openModal = function(id) {
    const modal = document.getElementById(id);
    if (!modal) return;
    modal.classList.add('active');
    if (id === 'modal-produto') switchTab('tab-geral');
}

window.closeModal = function(id) {
    const modal = document.getElementById(id);
    if (!modal) return;
    modal.classList.remove('active');
}

window.showNotify = function(message, type = 'info') {
    const toast = document.createElement('div');
    toast.style.position = 'fixed';
    toast.style.bottom = '20px';
    toast.style.right = '20px';
    toast.style.padding = '12px 24px';
    toast.style.borderRadius = '8px';
    toast.style.color = 'white';
    toast.style.zIndex = '9999';
    toast.style.animation = 'fadeIn 0.3s ease-out';
    toast.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
    
    if (type === 'success') toast.style.background = 'var(--success)';
    else if (type === 'error') toast.style.background = 'var(--danger)';
    else toast.style.background = 'var(--accent)';
    
    toast.innerText = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.5s';
        setTimeout(() => toast.remove(), 500);
    }, 4000);
}

window.logout = function() {
    sessionStorage.removeItem('token');
    window.location.href = '/login.html';
}

window.formatCurrency = function(value) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);
}

window.formatDate = function(dateStr) {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleString('pt-BR');
}

window.getBadgeClass = function(tipo) {
    const normalized = String(tipo || '').toUpperCase();
    if (normalized.startsWith('ENTRADA')) return 'badge-success';
    if (normalized.startsWith('SAIDA')) return 'badge-danger';
    if (normalized === 'AJUSTE') return 'badge-warning';
    return 'badge-info';
}

window.toggleCustomSelect = function(trigger) {
    const select = trigger.closest('.custom-select');
    if (!select) return;

    document.querySelectorAll('.custom-select.active').forEach(el => {
        if (el !== select) el.classList.remove('active');
    });

    select.classList.toggle('active');
}

document.addEventListener('click', (event) => {
    const option = event.target.closest('.select-option');
    if (option) {
        const customSelect = option.closest('.custom-select');
        if (!customSelect) return;

        customSelect.querySelectorAll('.select-option').forEach(el => el.classList.remove('selected'));
        option.classList.add('selected');

        const trigger = customSelect.querySelector('.select-trigger');
        const hiddenInput = customSelect.querySelector('input[type="hidden"]');

        if (trigger) trigger.innerText = option.innerText;
        if (hiddenInput) hiddenInput.value = option.dataset.value || '';

        customSelect.classList.remove('active');
        return;
    }

    if (!event.target.closest('.custom-select')) {
        document.querySelectorAll('.custom-select.active').forEach(el => el.classList.remove('active'));
    }
});

window.openMovModal = function(id) {
    const produto = state.products.find(item => item.id === id);
    const idEl = document.getElementById('mov-produto-id');
    const titleEl = document.getElementById('mov-title');
    const subtitleEl = document.getElementById('mov-subtitle');
    const formEl = document.getElementById('form-mov');
    const tipoSelect = document.getElementById('cs-tipo-mov');

    if (formEl) formEl.reset();
    if (idEl) idEl.value = id;

    if (titleEl) titleEl.innerText = 'Lançar Movimentação';
    if (subtitleEl) {
        subtitleEl.innerText = produto
            ? `Produto selecionado: ${produto.nome} (${produto.sku})`
            : 'Selecione o tipo e informe os dados do lançamento.';
    }

    if (tipoSelect) {
        const trigger = tipoSelect.querySelector('.select-trigger');
        const hiddenInput = tipoSelect.querySelector('input[type="hidden"]');
        const defaultOption = tipoSelect.querySelector('.select-option[data-value="ENTRADA"]');

        tipoSelect.querySelectorAll('.select-option').forEach(el => el.classList.remove('selected'));
        if (defaultOption) defaultOption.classList.add('selected');
        if (trigger) trigger.innerText = defaultOption ? defaultOption.innerText : 'Entrada de Estoque';
        if (hiddenInput) hiddenInput.value = 'ENTRADA';
        tipoSelect.classList.remove('active');
    }

    openModal('modal-movimentacao');
}
