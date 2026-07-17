// === CONFIGURAÇÕES E IMPORTAÇÃO ===

async function loadTemplates() {
    try {
        const res = await fetch(`${API_URL}/configuracoes/etiquetas`);
        const templates = await res.json();
        const tbody = document.querySelector('#table-templates tbody');
        if (!tbody) return;
        tbody.innerHTML = templates.map(t => `
            <tr>
                <td>${t.nome} ${t.padrao ? '<span class="badge badge-success">Padrão</span>' : ''}</td>
                <td>${t.largura_mm}x${t.altura_mm} mm</td>
                <td>${formatDate(t.created_at)}</td>
                <td>
                    <div class="flex-gap">
                        <button class="btn btn-outline" onclick="editTemplateVisual(${t.id})"><i class="ph ph-pencil"></i></button>
                        <button class="btn btn-outline text-danger" onclick="deleteTemplate(${t.id})"><i class="ph ph-trash"></i></button>
                    </div>
                </td>
            </tr>
        `).join('');
    } catch (e) { console.error(e); }
}

window.doImportStock = async function() {
    const fileInput = document.getElementById('import-file');
    if (!fileInput || fileInput.files.length === 0) return;

    const btn = document.getElementById('btn-do-import');
    btn.disabled = true;
    btn.innerHTML = '<i class="ph ph-circle-notch animate-spin"></i> Processando...';

    const formData = new FormData();
    formData.append('file', fileInput.files[0]);

    try {
        const res = await fetch(`${API_URL}/configuracoes/importar-estoque`, {
            method: 'POST',
            body: formData
        });
        const result = await res.json();
        if (res.ok) {
            showNotify("Importação concluída!", "success");
            renderImportResults(result);
            if (typeof refreshData === 'function') refreshData();
        } else {
            showNotify(result.detail || "Erro na importação", "error");
        }
    } catch (e) { console.error(e); } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="ph ph-check"></i> Processar Importação';
    }
}

function renderImportResults(data) {
    const resultsArea = document.getElementById('import-results');
    if (!resultsArea) return;
    resultsArea.style.display = 'block';
    document.getElementById('import-stats').innerHTML = `
        <div class="card-stats" style="border-left: 4px solid var(--success);">
            <small>SUCESSO</small><h3>${data.sucesso}</h3>
        </div>
        <div class="card-stats" style="border-left: 4px solid var(--danger);">
            <small>ERROS</small><h3>${data.erros}</h3>
        </div>
    `;
    const details = document.getElementById('import-details');
    if (data.detalhes && data.detalhes.length > 0) {
        details.innerHTML = data.detalhes.map(d => `<div>• ${d}</div>`).join('');
        details.style.display = 'block';
    }
}

window.switchConfigTab = function(tabName) {
    document.querySelectorAll('.btn-tab').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('onclick').includes(tabName));
    });

    document.querySelectorAll('.config-tab-content').forEach(content => {
        content.style.display = 'none';
        content.classList.remove('active');
    });

    const target = document.getElementById(`config-${tabName}`);
    if (target) {
        target.style.display = 'block';
        target.classList.add('active');
    }
};

window.prepareNewTemplate = function() {
    editorState = {
        id: null,
        nome: '',
        width_mm: 100,
        height_mm: 40,
        fields: [],
        selectedId: null,
        dragging: null,
        resizing: null,
        dragOffset: { x: 0, y: 0 }
    };
    
    // Resetar inputs do modal
    const nomeInput = document.getElementById('tpl-nome');
    if (nomeInput) nomeInput.value = '';
    
    const wInput = document.getElementById('tpl-w');
    if (wInput) wInput.value = 100;
    
    const hInput = document.getElementById('tpl-h');
    if (hInput) hInput.value = 40;
    
    const padraoInput = document.getElementById('tpl-padrao');
    if (padraoInput) padraoInput.checked = false;

    if (typeof initVisualEditor === 'function') initVisualEditor();
    openModal('modal-template');
}

window.downloadImportTemplate = function() {
    const csvContent = "\uFEFFsku;quantidade\nEXEMPLO-001;100\nEXEMPLO-002;50";
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "modelo_importacao_estoque.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

window.handleFileSelected = function() {
    const fileInput = document.getElementById('import-file');
    const label = document.getElementById('selected-filename');
    const btn = document.getElementById('btn-do-import');
    
    if (fileInput && fileInput.files.length > 0) {
        label.innerText = `Arquivo selecionado: ${fileInput.files[0].name}`;
        btn.disabled = false;
    } else {
        if (label) label.innerText = '';
        if (btn) btn.disabled = true;
    }
};

window.deleteTemplate = async function(id) {
    if (!confirm("Deseja realmente excluir este template de etiqueta?")) return;

    try {
        const res = await fetch(`${API_URL}/configuracoes/etiquetas/${id}`, {
            method: 'DELETE'
        });

        if (res.ok) {
            showNotify("Template removido com sucesso!", "success");
            loadTemplates();
        } else {
            const err = await res.json();
            showNotify(err.detail || "Erro ao remover template", "error");
        }
    } catch (e) { console.error(e); }
};
