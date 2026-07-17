// === GESTÃO DE USUÁRIOS (MODULAR) ===

window.Modulo_usuarios = {
    init() {
        console.log("Modulo de Usuários inicializado");
        this.loadUsers();
    },

    async loadUsers() {
        try {
            const [usersRes, rolesRes] = await Promise.all([
                apiFetch('/usuarios'),
                apiFetch('/usuarios/roles/all')
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
                                <button class="btn btn-outline" onclick="Modulo_usuarios.editUser(${u.id})" title="Editar Usuário">
                                    <i class="ph ph-pencil"></i>
                                </button>
                                <button class="btn btn-outline text-danger" onclick="Modulo_usuarios.deleteUser(${u.id})" title="Excluir Usuário">
                                    <i class="ph ph-trash"></i>
                                </button>
                            </div>
                        </td>
                    </tr>
                `).join('');
            }
        } catch (e) { console.error("Erro ao carregar usuários", e); }
    },

    prepareNewUser() {
        console.log("Preparando novo usuário...");
        const form = document.getElementById('form-usuario');
        const passwordInput = document.getElementById('user-password');
        const usernameInput = document.getElementById('user-username');

        if (!form) {
            console.error("ERRO: Formulário #form-usuario não encontrado no DOM!");
            showNotify("Erro interno: formulário não encontrado.", "error");
            return;
        }

        form.reset();
        document.getElementById('user-id').value = '';
        document.getElementById('user-modal-title').innerText = 'Cadastrar Usuário';
        document.getElementById('user-ativo').checked = true;
        document.querySelectorAll('input[name="perm-module"]').forEach(cb => cb.checked = false);
        usernameInput.readOnly = false;
        passwordInput.required = true;
        openModal('modal-usuario');
    },

    editUser(id) {
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
        
        // Carrega permissões
        const userPerms = u.permissoes ? u.permissoes.split(',') : [];
        document.querySelectorAll('input[name="perm-module"]').forEach(cb => {
            cb.checked = userPerms.includes(cb.value);
        });

        openModal('modal-usuario');
    },

    async saveUser(e) {
        e.preventDefault();
        const id = document.getElementById('user-id').value;
        const activeInput = document.getElementById('user-ativo');
        const passwordInput = document.getElementById('user-password');
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());
        data.ativo = activeInput ? activeInput.checked : true;

        // Coleta permissões
        const permCbs = document.querySelectorAll('input[name="perm-module"]:checked');
        data.permissoes = Array.from(permCbs).map(cb => cb.value).join(',');

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
            const url = id ? `/usuarios/${id}` : `/usuarios/`;
            const method = id ? 'PUT' : 'POST';
            const res = await apiFetch(url, {
                method,
                body: JSON.stringify(data)
            });

            console.log("Resposta saveUser:", res.status);

            if (res.ok) {
                showNotify(id ? "Usuário atualizado!" : "Usuário criado!", "success");
                closeModal('modal-usuario');
                this.loadUsers();
            } else {
                const err = await res.json();
                showNotify(err.detail || "Erro ao salvar usuário", "error");
            }
        } catch (e) { console.error(e); }
    },

    async deleteUser(id) {
        const u = state.allUsers.find(x => x.id === id);
        const name = u ? (u.nome_completo || u.username) : `#${id}`;

        const confirmed = await confirmAction("Excluir Usuário?", `Deseja realmente excluir ${name}? Esta ação não pode ser desfeita.`, { color: '#ef4444', icon: 'ph ph-user-minus' });
        if (!confirmed) return;

        this.executeDeleteUser(id);
    },

    async executeDeleteUser(id) {
        try {
            const res = await apiFetch(`/usuarios/${id}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                showNotify("Usuário excluído com sucesso!", "success");
                this.loadUsers();
            } else {
                const err = await res.json();
                showNotify(err.detail || "Erro ao excluir usuário", "error");
            }
        } catch (e) {
            console.error(e);
            showNotify("Falha na conexão com o servidor", "error");
        }
    }
}

window.prepareNewUser = function() {
    if (window.Modulo_usuarios) {
        window.Modulo_usuarios.prepareNewUser();
    }
};
