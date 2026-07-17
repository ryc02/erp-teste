// === GESTÃO DE INVENTÁRIO ===

async function loadInventario() {
    try {
        const res = await fetch(`${API_URL}/movimentacoes/inventario/sessoes`);
        const sessoes = await res.json();
        const tbody = document.querySelector('#table-inventario tbody');
        if (!tbody) return;
        tbody.innerHTML = sessoes.map(s => `
            <tr>
                <td>#${s.id}</td>
                <td>${formatDate(s.data_abertura)}</td>
                <td>${s.usuario_abertura}</td>
                <td><span class="badge ${s.status === 'ABERTO' ? 'badge-warning' : 'badge-success'}">${s.status}</span></td>
                <td>
                    ${s.status === 'ABERTO' ? `<button class="btn btn-sm btn-primary" onclick="window.location.href='/inventario.html?id=${s.id}'">Contar</button>` : '---'}
                </td>
            </tr>
        `).join('');
    } catch (e) { console.error(e); }
}

window.abrirNovoInventario = async function() {
    if (!confirm("Deseja abrir uma nova sessão de inventário?")) return;
    try {
        const res = await fetch(`${API_URL}/movimentacoes/inventario/abrir`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ usuario_abertura: state.user.username })
        });
        if (res.ok) {
            const sessao = await res.json();
            window.location.href = `/inventario.html?id=${sessao.id}`;
        }
    } catch (e) { console.error(e); }
}
