// === GESTÃO DE RESERVAS (MODULAR) ===

window.Modulo_reservas = {
    init() {
        console.log("Modulo de Reservas inicializado");
        this.loadReservas();
    },

    async loadReservas() {
        try {
            const res = await apiFetch('/reservas/');
            const reservas = await res.json();
            const tbody = document.querySelector('#table-reservas tbody');
            if (!tbody) return;

            tbody.innerHTML = reservas.map(r => `
                <tr>
                    <td>#${r.pedido_id || 'N/A'}</td>
                    <td><strong>${r.produto?.nome || 'Produto #'+r.produto_id}</strong></td>
                    <td>${r.quantidade}</td>
                    <td>${formatDate(r.created_at)}</td>
                    <td><span class="badge ${r.ativa ? 'badge-info' : 'badge-success'}">${r.ativa ? 'Reservado' : 'Consumido'}</span></td>
                    <td>
                        <button class="table-action-icon text-danger" onclick="Modulo_reservas.cancelarReserva(${r.id})">
                            <i class="ph ph-x"></i> Cancelar
                        </button>
                    </td>
                </tr>
            `).join('');

            if (reservas.length === 0) {
                tbody.innerHTML = '<tr><td colspan="6" style="text-align:center">Nenhuma reserva ativa no momento.</td></tr>';
            }
        } catch (e) { console.error(e); }
    },

    async cancelarReserva(id) {
        if (!confirm("Deseja cancelar esta reserva? O saldo voltará ao estoque disponível.")) return;
        try {
            const res = await apiFetch(`/reservas/${id}/liberar`, { method: 'POST' });
            if (res.ok) {
                showNotify("Reserva cancelada!", "success");
                this.loadReservas();
            }
        } catch (e) { console.error(e); }
    }
}
