// === GESTÃO DE USUÁRIOS ===

async function loadUsers() {
    try {
        const [usersRes, rolesRes] = await Promise.all([
            fetch(`${API_URL}/usuarios`),
            fetch(`${API_URL}/usuarios/roles/all`)
        ]);
        
        const users = await usersRes.json();
        state.allUsers = users;
        const roles = await rolesRes.json();
        
        const tbody = document.querySelector('#table-usuarios tbody');
        const roleSel = document.getElementById('user-role-sel');
        
        if (roleSel) roleSel.innerHTML = roles.map(r => `<option value="${r.id}">${r.nome}</option>`).join('');

        if (tbody) {
            if (!users.length) {
                tbody.innerHTML = '<tr><td colspan="6" style="text-align:center">Nenhum usuário encontrado.</td></tr>';
                return;
            }

            tbody.innerHTML = users.map(u => `
                <tr>
                    <td class="user-col-username"><strong>${u.username}</strong></td>
                    <td class="user-col-name">${u.nome_completo}</td>
                    <td class="user-col-email">${u.email}</td>
                    <td class="user-col-role"><span class="badge badge-info">${u.role ? u.role.nome : '---'}</span></td>
                    <td class="user-col-status"><span class="badge ${u.ativo ? 'badge-success' : 'badge-danger'}">${u.ativo ? 'Ativo' : 'Inativo'}</span></td>
                    <td class="user-col-actions">
                        <div class="user-actions">
                            <button class="btn btn-outline" onclick="editUser(${u.id})" title="Editar Usuário">
                                <i class="ph ph-pencil"></i>
                            </button>
                            <button class="btn btn-outline text-danger" onclick="deleteUser(${u.id})" title="Excluir Usuário">
                                <i class="ph ph-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `).join('');
        }
    } catch (e) { console.error("Erro ao carregar usuários", e); }
}

window.prepareNewUser = function() {
    const form = document.getElementById('form-usuario');
    const passwordInput = document.getElementById('user-password');
    const usernameInput = document.getElementById('user-username');

    form.reset();
    document.getElementById('user-id').value = '';
    document.getElementById('user-modal-title').innerText = 'Cadastrar Usuário';
    document.getElementById('user-ativo').checked = true;
    usernameInput.readOnly = false;
    passwordInput.required = true;
    openModal('modal-usuario');
}

window.editUser = function(id) {
    const u = state.allUsers.find(x => x.id === id);
    if (!u) return;

    document.getElementById('user-id').value = u.id;
    document.getElementById('user-username').value = u.username;
    document.getElementById('user-email').value = u.email;
    document.getElementById('user-nome').value = u.nome_completo;
    document.getElementById('user-role-sel').value = u.role_id;
    document.getElementById('user-ativo').checked = u.ativo;
    document.getElementById('user-password').value = '';
    document.getElementById('user-password').required = false;
    document.getElementById('user-username').readOnly = true;
    document.getElementById('user-modal-title').innerText = 'Editar Usuário';
    openModal('modal-usuario');
}

window.saveUser = async function(e) {
    e.preventDefault();
    const id = document.getElementById('user-id').value;
    const activeInput = document.getElementById('user-ativo');
    const passwordInput = document.getElementById('user-password');
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    data.ativo = activeInput ? activeInput.checked : true;

    if (!id && !data.password) {
        showNotify('Informe uma senha para o novo usuário.', 'error');
        passwordInput?.focus();
        return;
    }

    if (id) {
        delete data.username;
        if (!data.password) delete data.password;
    }

    try {
        const url = id ? `${API_URL}/usuarios/${id}` : `${API_URL}/usuarios/`;
        const method = id ? 'PUT' : 'POST';
        const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (res.ok) {
            showNotify(id ? "Usuário atualizado!" : "Usuário criado!", "success");
            closeModal('modal-usuario');
            loadUsers();
        } else {
            const err = await res.json();
            showNotify(err.detail || "Erro ao salvar usuário", "error");
        }
    } catch (e) { console.error(e); }
}

async function deleteUser(id) {
    console.log("Iniciando processo de exclusão para o ID:", id);
    
    // Criar modal de confirmação customizado (Aesthetics)
    const modalHtml = `
        <div id="modal-confirm-delete" class="modal active" style="z-index: 9999;">
            <div class="modal-content card" style="max-width: 400px; text-align: center; padding: 40px;">
                <div style="width: 70px; height: 70px; background: rgba(239, 68, 68, 0.1); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px;">
                    <i class="ph ph-warning" style="font-size: 35px; color: #ef4444;"></i>
                </div>
                <h3 style="margin-bottom: 15px; font-size: 1.4rem;">Excluir Usuário?</h3>
                <p style="color: var(--text-secondary); margin-bottom: 30px; line-height: 1.5;">Esta ação não pode ser desfeita. O usuário será removido permanentemente do sistema.</p>
                <div style="display: flex; gap: 15px; justify-content: center;">
                    <button class="btn btn-outline" onclick="closeConfirmDelete()" style="flex: 1;">Cancelar</button>
                    <button class="btn btn-primary" onclick="executeDeleteUser(${id})" style="background: #ef4444; flex: 1;">Excluir</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHtml);
}

window.closeConfirmDelete = function() {
    const modal = document.getElementById('modal-confirm-delete');
    if (modal) modal.remove();
}

window.executeDeleteUser = async function(id) {
    console.log("Executando DELETE na API para o usuário:", id);
    window.closeConfirmDelete();
    
    try {
        const res = await fetch(`${API_URL}/usuarios/${id}`, {
            method: 'DELETE'
        });

        if (res.ok) {
            showNotify("Usuário excluído com sucesso!", "success");
            loadUsers();
        } else {
            const err = await res.json();
            console.error("Erro retornado pela API:", err);
            showNotify(err.detail || "Erro ao excluir usuário", "error");
        }
    } catch (e) {
        console.error("Falha catastrófica na requisição:", e);
        showNotify("Falha na conexão com o servidor", "error");
    }
}

// Exportar para o escopo global
window.deleteUser = deleteUser;
window.loadUsers = loadUsers;
window.prepareNewUser = prepareNewUser;
window.editUser = editUser;
window.saveUser = saveUser;

async function loadAuditLogs() {
    const tbody = document.querySelector('#table-audit tbody');
    if (!tbody) return;

    try {
        const res = await fetch(`${API_URL}/usuarios/logs/audit`);
        if (!res.ok) throw new Error("Falha ao carregar logs");
        
        const logs = await res.json();
        
        if (!logs.length) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align:center">Nenhum log encontrado.</td></tr>';
            return;
        }

        tbody.innerHTML = logs.map(l => `
            <tr>
                <td style="white-space: nowrap; font-size: 0.85rem; color: var(--text-secondary);">${formatDate(l.created_at)}</td>
                <td><strong>${l.usuario}</strong></td>
                <td><span class="badge badge-info">${l.modulo}</span></td>
                <td><span class="badge ${l.acao === 'DELETE' ? 'badge-danger' : (l.acao === 'CREATE' ? 'badge-success' : 'badge-warning')}">${l.acao}</span></td>
                <td style="font-size: 0.9rem;">${l.detalhes}</td>
                <td style="font-size: 0.85rem; color: var(--text-secondary);">${l.ip_address || '-'}</td>
            </tr>
        `).join('');
    } catch (e) {
        console.error(e);
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; color: var(--danger)">Erro ao carregar logs de auditoria.</td></tr>';
    }
}

window.loadAuditLogs = loadAuditLogs;
