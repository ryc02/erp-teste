// === LOGS DE AUDITORIA (MODULAR) ===

window.Modulo_auditoria = {
    allLogs: [],

    init() {
        console.log("Modulo de Auditoria inicializado");
        this.loadAuditLogs();
    },

    async loadAuditLogs() {
        const tbody = document.querySelector('#table-audit tbody');
        if (!tbody) return;

        try {
            const res = await apiFetch('/usuarios/logs/audit');
            if (!res.ok) throw new Error("Falha ao carregar logs");
            
            this.allLogs = await res.json();
            this.renderLogs(this.allLogs);
        } catch (e) {
            console.error(e);
            tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; color: var(--danger)">Erro ao carregar logs de auditoria.</td></tr>';
        }
    },

    applyFilter() {
        const term = document.getElementById('audit-filter').value.toLowerCase();
        if (!term) {
            this.renderLogs(this.allLogs);
            return;
        }

        const filtered = this.allLogs.filter(l => 
            l.usuario.toLowerCase().includes(term) ||
            l.modulo.toLowerCase().includes(term) ||
            l.acao.toLowerCase().includes(term) ||
            l.detalhes.toLowerCase().includes(term)
        );
        this.renderLogs(filtered);
    },

    renderLogs(logs) {
        const tbody = document.querySelector('#table-audit tbody');
        if (!tbody) return;

        if (!logs.length) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align:center">Nenhum log encontrado.</td></tr>';
            return;
        }

        tbody.innerHTML = logs.map(l => `
            <tr>
                <td style="white-space: nowrap; font-size: 0.85rem; color: var(--text-secondary);">${formatDate(l.created_at)}</td>
                <td><strong>${l.usuario}</strong></td>
                <td><span class="badge badge-info">${l.modulo}</span></td>
                <td><span class="badge ${l.acao === 'DELETE' || l.acao === 'PURGE' ? 'badge-danger' : (l.acao === 'CREATE' || l.acao === 'IMPORT' ? 'badge-success' : 'badge-warning')}">${l.acao}</span></td>
                <td style="font-size: 0.9rem;">${l.detalhes}</td>
                <td style="font-size: 0.85rem; color: var(--text-secondary);">${l.ip_address || '-'}</td>
            </tr>
        `).join('');
    }
}
