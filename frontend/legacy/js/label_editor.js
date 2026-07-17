// === EDITOR VISUAL DE ETIQUETAS (VANILLA JS) ===

const MM_TO_PX = 3.2;
const FIELD_TYPES = [
  { type: "sku", label: "SKU", icon: "#", defaultW: 120, defaultH: 32, fontSize: 14, bold: true },
  { type: "name", label: "Nome do Produto", icon: "T", defaultW: 200, defaultH: 40, fontSize: 10, bold: false },
  { type: "barcode", label: "Código de Barras", icon: "▮▯▮", defaultW: 160, defaultH: 60, fontSize: 9, bold: false },
  { type: "location", label: "Localização", icon: "⊙", defaultW: 90, defaultH: 32, fontSize: 12, bold: true },
  { type: "logo", label: "Logo Venner", icon: "V", defaultW: 80, defaultH: 36, fontSize: 10, bold: true },
  { type: "custom", label: "Texto Livre", icon: "Aa", defaultW: 100, defaultH: 28, fontSize: 11, bold: false },
  { type: "descricao", label: "Descrição", icon: "≡", defaultW: 200, defaultH: 40, fontSize: 9, bold: false },
];

let editorState = {
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

const sampleData = {
    sku: "TEST-001", 
    name: "KIT VARÃO DE CORTINA 1 METRO AÇO REVESTIDO",
    location: "p1/a/01", 
    custom: "Texto livre",
    descricao: "Produto de alta qualidade para cortinas residenciais."
};

window.initVisualEditor = function() {
    renderEditorComponents();
    renderWorkspace();
    setupEditorListeners();
    updateEditorUI();
};

function renderEditorComponents() {
    const container = document.getElementById('editor-components');
    if (!container) return;
    
    container.innerHTML = FIELD_TYPES.map(ft => `
        <button class="btn btn-sm btn-outline" style="justify-content: flex-start; text-align: left; gap: 10px;" onclick="addFieldToEditor('${ft.type}')">
            <div style="width: 24px; height: 24px; background: #1e2a3a; display: flex; align-items: center; justify-content: center; border-radius: 4px; color: #4a9eff; font-weight: 900; font-size: 10px;">
                ${ft.icon}
            </div>
            ${ft.label}
        </button>
    `).join('');
}

window.addFieldToEditor = function(type) {
    const ft = FIELD_TYPES.find(f => f.type === type);
    const newField = {
        id: Date.now(),
        type: type,
        label: ft.label,
        x: 5,
        y: 5,
        w: ft.defaultW / MM_TO_PX,
        h: ft.defaultH / MM_TO_PX,
        fontSize: ft.fontSize,
        bold: ft.bold,
        align: "flex-start",
        wrap: false,
        customText: ""
    };
    editorState.fields.push(newField);
    editorState.selectedId = newField.id;
    renderWorkspace();
    renderProperties();
};

function renderWorkspace() {
    const workspace = document.getElementById('label-workspace');
    if (!workspace) return;

    workspace.style.width = (editorState.width_mm * MM_TO_PX) + 'px';
    workspace.style.height = (editorState.height_mm * MM_TO_PX) + 'px';

    // Limpar campos existentes (mantendo o grid se quiser, mas aqui vamos redesenhar tudo)
    const grid = workspace.firstElementChild; // O grid está lá
    workspace.innerHTML = '';
    workspace.appendChild(grid);

    editorState.fields.forEach(f => {
        const fieldEl = document.createElement('div');
        fieldEl.className = `editor-field ${editorState.selectedId === f.id ? 'selected' : ''}`;
        fieldEl.style.left = (f.x * MM_TO_PX) + 'px';
        fieldEl.style.top = (f.y * MM_TO_PX) + 'px';
        fieldEl.style.width = (f.w * MM_TO_PX) + 'px';
        fieldEl.style.height = (f.h * MM_TO_PX) + 'px';
        fieldEl.dataset.id = f.id;

        // Content Preview
        fieldEl.innerHTML = getFieldPreviewHTML(f);

        // Selection / Resize handles
        if (editorState.selectedId === f.id) {
            const handle = document.createElement('div');
            handle.className = 'resize-handle';
            handle.onmousedown = (e) => startResizing(e, f.id);
            fieldEl.appendChild(handle);
            
            const info = document.createElement('div');
            info.className = 'field-info-badge';
            info.innerText = `${Math.round(f.w)}x${Math.round(f.h)}mm`;
            fieldEl.appendChild(info);
        }

        fieldEl.onmousedown = (e) => {
            if (e.target.className === 'resize-handle') return;
            startDragging(e, f.id);
        };

        workspace.appendChild(fieldEl);
    });

    updateZPLPreview();
}

function getFieldPreviewHTML(f) {
    const val = sampleData[f.type] || f.customText || f.label;
    const style = `
        width: 100%; height: 100%; display: flex; align-items: center;
        justify-content: ${f.align || "flex-start"};
        padding: 2px 4px; box-sizing: border-box; overflow: hidden;
        font-size: ${f.fontSize}px;
        font-weight: ${f.bold ? "700" : "400"};
        font-family: ${f.type === "barcode" ? "monospace" : "Arial, sans-serif"};
        color: #111; line-height: 1.2;
    `;

    if (f.type === "barcode") {
        return `<div style="${style}">
            <svg width="100%" height="100%" preserveAspectRatio="none" viewBox="0 0 100 40">
                <rect x="5" y="5" width="2" height="30" fill="black" />
                <rect x="10" y="5" width="4" height="30" fill="black" />
                <rect x="18" y="5" width="1" height="30" fill="black" />
                <rect x="22" y="5" width="3" height="30" fill="black" />
                <rect x="30" y="5" width="2" height="30" fill="black" />
                <rect x="35" y="5" width="5" height="30" fill="black" />
                <rect x="45" y="5" width="2" height="30" fill="black" />
                <rect x="52" y="5" width="4" height="30" fill="black" />
                <rect x="60" y="5" width="1" height="30" fill="black" />
                <rect x="65" y="5" width="3" height="30" fill="black" />
                <text x="50" y="38" text-anchor="middle" font-size="6" font-family="monospace">TEST001</text>
            </svg>
        </div>`;
    }

    if (f.type === "logo") {
        return `<div style="${style} flex-direction: column; justify-content: center; gap: 1px;">
            <span style="font-size: ${f.fontSize + 2}px; font-weight: 900; letter-spacing: 1px;">VENNER</span>
            <span style="font-size: 6px; color: #666; letter-spacing: 0.5px;">METALÚRGICA</span>
        </div>`;
    }

    return `<div style="${style}">
        <span style="overflow: hidden; text-overflow: ellipsis; white-space: ${f.wrap ? "normal" : "nowrap"};">
            ${val}
        </span>
    </div>`;
}

function startDragging(e, id) {
    e.stopPropagation();
    editorState.selectedId = id;
    editorState.dragging = id;
    
    const field = editorState.fields.find(f => f.id === id);
    const rect = e.currentTarget.getBoundingClientRect();
    editorState.dragOffset = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
    };
    
    renderWorkspace();
    renderProperties();
}

function startResizing(e, id) {
    e.stopPropagation();
    editorState.resizing = id;
    editorState.selectedId = id;
}

function setupEditorListeners() {
    window.addEventListener('mousemove', (e) => {
        if (editorState.dragging !== null) {
            const container = document.getElementById('label-workspace');
            const rect = container.getBoundingClientRect();
            const field = editorState.fields.find(f => f.id === editorState.dragging);
            
            let newX = (e.clientX - rect.left - editorState.dragOffset.x) / MM_TO_PX;
            let newY = (e.clientY - rect.top - editorState.dragOffset.y) / MM_TO_PX;
            
            // Constrain
            newX = Math.max(0, Math.min(newX, editorState.width_mm - field.w));
            newY = Math.max(0, Math.min(newY, editorState.height_mm - field.h));
            
            field.x = newX;
            field.y = newY;
            
            renderWorkspace();
            updatePropertiesInputs();
        }
        
        if (editorState.resizing !== null) {
            const container = document.getElementById('label-workspace');
            const rect = container.getBoundingClientRect();
            const field = editorState.fields.find(f => f.id === editorState.resizing);
            
            let newW = (e.clientX - rect.left) / MM_TO_PX - field.x;
            let newH = (e.clientY - rect.top) / MM_TO_PX - field.y;
            
            field.w = Math.max(10, newW);
            field.h = Math.max(5, newH);
            
            renderWorkspace();
            updatePropertiesInputs();
        }
    });

    window.addEventListener('mouseup', () => {
        editorState.dragging = null;
        editorState.resizing = null;
    });

    // Listeners para W/H da etiqueta
    document.getElementById('tpl-w').addEventListener('input', (e) => {
        editorState.width_mm = parseFloat(e.target.value) || 100;
        renderWorkspace();
    });
    document.getElementById('tpl-h').addEventListener('input', (e) => {
        editorState.height_mm = parseFloat(e.target.value) || 40;
        renderWorkspace();
    });
}

function renderProperties() {
    const panel = document.getElementById('prop-content');
    const field = editorState.fields.find(f => f.id === editorState.selectedId);
    
    if (!field) {
        panel.innerHTML = `<div style="color: #4a5a78; font-size: 0.9rem; text-align: center; margin-top: 40px;">Selecione um campo para editar</div>`;
        return;
    }

    panel.innerHTML = `
        <div style="font-size: 11px; font-weight: 700; color: #4a9eff; text-transform: uppercase; margin-bottom: 14px;">${field.label}</div>
        <div class="prop-row">
            <label class="prop-label">Posição X (mm)</label>
            <input type="number" class="prop-input" value="${Math.round(field.x)}" oninput="updateFieldProp(${field.id}, 'x', this.value)">
        </div>
        <div class="prop-row">
            <label class="prop-label">Posição Y (mm)</label>
            <input type="number" class="prop-input" value="${Math.round(field.y)}" oninput="updateFieldProp(${field.id}, 'y', this.value)">
        </div>
        <div class="prop-row">
            <label class="prop-label">Largura (mm)</label>
            <input type="number" class="prop-input" value="${Math.round(field.w)}" oninput="updateFieldProp(${field.id}, 'w', this.value)">
        </div>
        <div class="prop-row">
            <label class="prop-label">Altura (mm)</label>
            <input type="number" class="prop-input" value="${Math.round(field.h)}" oninput="updateFieldProp(${field.id}, 'h', this.value)">
        </div>
        <div class="prop-row">
            <label class="prop-label">Tamanho da fonte</label>
            <input type="number" class="prop-input" value="${field.fontSize}" oninput="updateFieldProp(${field.id}, 'fontSize', this.value)">
        </div>
        <div class="prop-row">
            <label class="prop-label">Alinhamento</label>
            <div style="display: flex; gap: 4px;">
                <button class="btn btn-sm ${field.align === 'flex-start' ? 'btn-primary' : 'btn-outline'}" onclick="updateFieldProp(${field.id}, 'align', 'flex-start')" style="flex:1">L</button>
                <button class="btn btn-sm ${field.align === 'center' ? 'btn-primary' : 'btn-outline'}" onclick="updateFieldProp(${field.id}, 'align', 'center')" style="flex:1">C</button>
                <button class="btn btn-sm ${field.align === 'flex-end' ? 'btn-primary' : 'btn-outline'}" onclick="updateFieldProp(${field.id}, 'align', 'flex-end')" style="flex:1">R</button>
            </div>
        </div>
        <div class="prop-row">
            <label style="display: flex; align-items: center; gap: 8px; font-size: 12px; cursor: pointer;">
                <input type="checkbox" ${field.bold ? 'checked' : ''} onchange="updateFieldProp(${field.id}, 'bold', this.checked)"> Negrito
            </label>
        </div>
        ${field.type === 'custom' ? `
            <div class="prop-row">
                <label class="prop-label">Texto</label>
                <input type="text" class="prop-input" value="${field.customText}" oninput="updateFieldProp(${field.id}, 'customText', this.value)">
            </div>
        ` : ''}
        <button class="btn btn-outline text-danger" style="width: 100%; margin-top: 15px;" onclick="removeField(${field.id})">
            <i class="ph ph-trash"></i> Remover Campo
        </button>
    `;
}

window.updateFieldProp = function(id, prop, val) {
    const field = editorState.fields.find(f => f.id === id);
    if (!field) return;
    
    if (prop === 'bold') field.bold = val;
    else if (prop === 'align' || prop === 'customText') field[prop] = val;
    else field[prop] = parseFloat(val) || 0;
    
    renderWorkspace();
    if (prop === 'align') renderProperties(); // Update buttons
};

window.removeField = function(id) {
    editorState.fields = editorState.fields.filter(f => f.id !== id);
    editorState.selectedId = null;
    renderWorkspace();
    renderProperties();
};

function updatePropertiesInputs() {
    // Atualiza apenas os valores numéricos sem redesenhar o painel inteiro para manter o foco
    const field = editorState.fields.find(f => f.id === editorState.selectedId);
    if (!field) return;
    
    const inputs = document.querySelectorAll('#prop-panel .prop-input');
    if (inputs.length >= 4) {
        inputs[0].value = Math.round(field.x);
        inputs[1].value = Math.round(field.y);
        inputs[2].value = Math.round(field.w);
        inputs[3].value = Math.round(field.h);
    }
}

window.switchEditorTab = function(tab) {
    document.querySelectorAll('.btn-tab').forEach(b => b.classList.remove('active'));
    document.getElementById(`btn-tab-${tab}`).classList.add('active');
    
    if (tab === 'zpl') {
        document.getElementById('zpl-area').style.display = 'block';
        updateZPLPreview();
    } else {
        document.getElementById('zpl-area').style.display = 'none';
    }
};

function updateZPLPreview() {
    const zpl = generateZPL(editorState.fields, editorState.width_mm, editorState.height_mm);
    const pre = document.getElementById('zpl-preview');
    if (pre) pre.innerText = zpl;
}

function generateZPL(fields, labelW, labelH, dpi = 203) {
    const factor = dpi / 25.4;
    const pw = Math.round(labelW * factor);
    const ll = Math.round(labelH * factor);
    let zpl = `^XA\n^PW${pw}\n^LL${ll}\n^CI28\n\n`;
    
    fields.forEach(f => {
        const x = Math.round(f.x * factor);
        const y = Math.round(f.y * factor);
        const fw = Math.round(f.w * factor);
        const fh = Math.round(f.h * factor);
        const fs = Math.round(f.fontSize * factor * 0.8);
        
        if (f.type === "barcode") {
            zpl += `^FO${x},${y}^BY2^BCN,${Math.round(fh * 0.7)},Y,N,N^FDTEST001^FS\n`;
        } else if (f.type === "logo") {
            zpl += `^FO${x},${y}^A0N,${fs + 8},${fs + 8}^FDVENNER^FS\n`;
            zpl += `^FO${x},${y + fs + 10}^A0N,${Math.round(fs * 0.55)},${Math.round(fs * 0.55)}^FDMETALURGICA E INJECAO PLASTICA^FS\n`;
        } else {
            let fieldVal = "{{valor}}";
            if (f.type === "sku") fieldVal = "{{sku}}";
            else if (f.type === "name") fieldVal = "{{nome}}";
            else if (f.type === "location") fieldVal = "{{localizacao}}";
            else if (f.type === "descricao") fieldVal = "{{descricao}}";
            else if (f.type === "custom") fieldVal = f.customText || "TEXTO";
            
            zpl += `^FO${x},${y}^A0N,${fs},${fs}^FB${fw},1,0,${f.align === 'center' ? 'C' : f.align === 'flex-end' ? 'R' : 'L'}^FD${fieldVal}^FS\n`;
        }
    });
    
    zpl += `\n^XZ`;
    return zpl;
}

window.saveTemplateVisual = async function() {
    const nome = document.getElementById('tpl-nome').value;
    if (!nome) {
        showNotify("Nome do template é obrigatório", "error");
        return;
    }

    const payload = {
        nome: nome,
        largura_mm: editorState.width_mm,
        altura_mm: editorState.height_mm,
        campos_json: JSON.stringify(editorState.fields),
        zpl_base: generateZPL(editorState.fields, editorState.width_mm, editorState.height_mm),
        padrao: document.getElementById('tpl-padrao').checked
    };

    try {
        const method = editorState.id ? 'PUT' : 'POST';
        const url = editorState.id ? `${API_URL}/configuracoes/etiquetas/${editorState.id}` : `${API_URL}/configuracoes/etiquetas`;
        
        const res = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            showNotify("Template salvo com sucesso!", "success");
            closeModal('modal-template');
            if (typeof loadTemplates === 'function') loadTemplates();
        } else {
            const err = await res.json();
            showNotify(err.detail || "Erro ao salvar template", "error");
        }
    } catch (e) { console.error(e); }
};

window.editTemplateVisual = async function(id) {
    try {
        const res = await fetch(`${API_URL}/configuracoes/etiquetas/${id}`);
        const tpl = await res.json();
        
        editorState.id = tpl.id;
        editorState.width_mm = tpl.largura_mm;
        editorState.height_mm = tpl.altura_mm;
        editorState.fields = JSON.parse(tpl.campos_json || '[]');
        editorState.selectedId = null;
        
        document.getElementById('tpl-nome').value = tpl.nome;
        document.getElementById('tpl-w').value = tpl.largura_mm;
        document.getElementById('tpl-h').value = tpl.altura_mm;
        document.getElementById('tpl-padrao').checked = tpl.padrao;
        
        initVisualEditor();
        openModal('modal-template');
    } catch (e) { console.error(e); }
};

window.copyZPL = function() {
    const zpl = document.getElementById('zpl-preview').innerText;
    navigator.clipboard.writeText(zpl).then(() => {
        showNotify("ZPL copiado para a área de transferência!", "success");
    });
};

function updateEditorUI() {
    // Forçar atualização das réguas ou outros elementos visuais se necessário
}
