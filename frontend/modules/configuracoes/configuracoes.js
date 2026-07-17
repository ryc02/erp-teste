window.Modulo_configuracoes = {
    modulos: [],
    templates: [],

    async init() {
        console.log("Modulo de Configurações inicializado");
        await this.loadModulos();
        await this.loadTemplates();
    },

    async loadModulos() {
        try {
            const res = await apiFetch('/configuracoes/modulos');
            this.modulos = await res.json();
            this.renderModulos();
        } catch (e) { console.error(e); }
    },

    renderModulos() {
        const container = document.getElementById('list-modulos-config');
        if (!container) return;

        container.innerHTML = this.modulos.map(m => `
            <div class="card" style="padding: 16px; display: flex; justify-content: space-between; align-items: center; background: rgba(255,255,255,0.01);">
                <div>
                    <div style="font-weight: 700; color: var(--accent);">${m.nome}</div>
                    <div style="font-size: 0.75rem; color: var(--text-secondary);">${m.descricao}</div>
                </div>
                <div>
                    <label class="switch">
                        <input type="checkbox" ${m.ativo ? 'checked' : ''} onchange="Modulo_configuracoes.toggleModulo(${m.id}, this.checked)">
                        <span class="slider round"></span>
                    </label>
                </div>
            </div>
        `).join('');
    },

    async toggleModulo(id, ativo) {
        try {
            const res = await apiFetch(`/configuracoes/modulos/${id}`, {
                method: 'PUT',
                body: JSON.stringify({ ativo })
            });
            if (res.ok) {
                showNotify("Configuração atualizada! Recarregue para aplicar.", "info");
            }
        } catch (e) { console.error(e); }
    },

    async loadTemplates() {
        try {
            const res = await apiFetch('/configuracoes/etiquetas');
            this.templates = await res.json();
            this.renderTemplates();
        } catch (e) { console.error(e); }
    },

    renderTemplates() {
        const tbody = document.querySelector('#table-templates tbody');
        if (!tbody) return;

        tbody.innerHTML = this.templates.map(t => `
            <tr>
                <td>${t.nome}</td>
                <td>${t.largura_mm}</td>
                <td>${t.altura_mm}</td>
                <td>${t.padrao ? '<span class="badge badge-success">Sim</span>' : 'Não'}</td>
                <td>
                    <button class="btn btn-outline btn-sm" onclick="Modulo_configuracoes.editTemplate(${t.id})">
                        <i class="ph ph-pencil"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    },

    switchTab(tabId) {
        document.querySelectorAll('#view-configuracoes .tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('onclick').includes(tabId));
        });
        document.querySelectorAll('#view-configuracoes .tab-content').forEach(content => {
            content.classList.toggle('active', content.id === tabId);
        });
    },

    async purgeAll() {
        const confirmed = await confirmAction("PURGA TOTAL?", "Esta ação APAGARÁ TUDO e não pode ser desfeita. Digite 'PURGAR' para confirmar.", { color: '#ef4444', icon: 'ph ph-warning' });
        if (!confirmed) return;
        
        const typed = prompt("Digite PURGAR para confirmar a destruição total dos dados:");
        if (typed !== 'PURGAR') return;

        try {
            const res = await apiFetch('/configuracoes/purga-total', { method: 'POST' });
            if (res.ok) {
                showNotify("Purga realizada com sucesso. O sistema foi resetado.", "success");
                window.location.reload();
            }
        } catch (e) { console.error(e); }
    },

    async importStock() {
        const fileInput = document.getElementById('import-file');
        if (!fileInput.files.length) return showNotify("Selecione um arquivo", "warning");

        const formData = new FormData();
        formData.append('file', fileInput.files[0]);

        showNotify("Iniciando importação... aguarde.", "info");
        try {
            const res = await fetch(`${API_URL}/configuracoes/importar-estoque`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${sessionStorage.getItem('token')}` },
                body: formData
            });

            if (res.ok) {
                const data = await res.json();
                showNotify(`Importação concluída! ${data.criados} criados, ${data.atualizados} atualizados.`, "success");
            } else {
                showNotify("Erro na importação", "error");
            }
        } catch (e) { console.error(e); }
    },

    newEtiqueta() {
        document.getElementById('form-template').reset();
        document.getElementById('tpl-id').value = '';
        openModal('modal-template-etiqueta');
    },

    async saveEtiqueta(e) {
        e.preventDefault();
        const id = document.getElementById('tpl-id').value;
        const payload = {
            nome: document.getElementById('tpl-nome').value,
            largura_mm: parseFloat(document.getElementById('tpl-width').value),
            altura_mm: parseFloat(document.getElementById('tpl-height').value),
            conteudo_zpl: document.getElementById('tpl-content').value,
            padrao: document.getElementById('tpl-padrao').checked
        };

        try {
            const method = id ? 'PUT' : 'POST';
            const url = id ? `/configuracoes/etiquetas/${id}` : '/configuracoes/etiquetas';
            const res = await apiFetch(url, { method, body: JSON.stringify(payload) });
            if (res.ok) {
                showNotify("Template salvo!", "success");
                closeModal('modal-template-etiqueta');
                this.loadTemplates();
            }
        } catch (e) { console.error(e); }
    }
};
