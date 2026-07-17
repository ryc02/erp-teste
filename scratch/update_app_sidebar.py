import os
import re

app_path = r"d:\ERP Venner\frontend\app.js"

with open(app_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update bindShellEvents
bind_shell_old = r"""function bindShellEvents\(\) \{
    const menu = document\.getElementById\('side-menu'\);
    if \(!menu || menu\.dataset\.bound === 'true'\) return;

    menu\.dataset\.bound = 'true';
    menu\.addEventListener\('click', \(event\) => handleMenuInteraction\(event\)\);
    menu\.addEventListener\('pointerenter', \(event\) => handleMenuPrefetch\(event\), true\);
    menu\.addEventListener\('focusin', \(event\) => handleMenuPrefetch\(event\)\);
    menu\.addEventListener\('keydown', \(event\) => \{
        if \(event\.key !== 'Enter' && event\.key !== ' '\) return;
        event\.preventDefault\(\);
        handleMenuInteraction\(event\);
    \}\);
\}"""

bind_shell_new = """function bindShellEvents() {
    const container = document.getElementById('sidebar-container');
    if (!container || container.dataset.bound === 'true') return;

    container.dataset.bound = 'true';
    container.addEventListener('click', (event) => handleMenuInteraction(event));
    container.addEventListener('pointerenter', (event) => handleMenuPrefetch(event), true);
    container.addEventListener('focusin', (event) => handleMenuPrefetch(event));
    container.addEventListener('keydown', (event) => {
        if (event.key !== 'Enter' && event.key !== ' ') return;
        event.preventDefault();
        handleMenuInteraction(event);
    });
}"""

content = re.sub(bind_shell_old, bind_shell_new, content)

# 2. Update FEATURE_GROUP_LABELS and renderSidebarMenu
old_render_block = r"const FEATURE_GROUP_LABELS = \{.*?(?=function queueIdleWork)"

new_render_block = """const FEATURE_GROUP_LABELS = {
    INICIO: 'início',
    CADASTROS: 'cadastros',
    SUPRIMENTOS: 'suprimentos',
    VENDAS: 'vendas',
    FINANCAS: 'finanças',
    SERVICOS: 'serviços',
    CONFIGURACOES: 'configurações'
};

const FEATURE_GROUP_ICONS = {
    INICIO: 'ph ph-house',
    CADASTROS: 'ph ph-folder',
    SUPRIMENTOS: 'ph ph-package',
    VENDAS: 'ph ph-shopping-cart',
    FINANCAS: 'ph ph-currency-dollar',
    SERVICOS: 'ph ph-wrench',
    CONFIGURACOES: 'ph ph-gear'
};

function renderSidebarMenu() {
    const primaryMenu = document.getElementById('primary-menu');
    if (!primaryMenu) return;

    const visibleModules = getVisibleModules();
    if (!visibleModules.length) {
        primaryMenu.innerHTML = `<div class="nav-item active"><i class="ph ph-lock"></i> Sem acesso</div>`;
        return;
    }

    state.menuGroups = {};
    for (const mod of visibleModules) {
        const g = mod.featureGroup || 'OUTROS';
        if (!state.menuGroups[g]) state.menuGroups[g] = [];
        state.menuGroups[g].push(mod);
    }
    
    const order = ['INICIO', 'CADASTROS', 'SUPRIMENTOS', 'VENDAS', 'FINANCAS', 'SERVICOS', 'CONFIGURACOES'];
    let html = '';
    
    for (const group of order) {
        if (!state.menuGroups[group] || state.menuGroups[group].length === 0) continue;
        const label = FEATURE_GROUP_LABELS[group] || group;
        const icon = FEATURE_GROUP_ICONS[group] || 'ph ph-folder';
        
        const currentMod = visibleModules.find(m => m.id === state.currentView);
        const isCurrentViewInGroup = currentMod && currentMod.featureGroup === group;
        
        // If state.activeSidebarGroup is not set, initialize it to the group containing the currentView
        if (!state.activeSidebarGroup && isCurrentViewInGroup) {
            state.activeSidebarGroup = group;
        }
        
        const isActive = (state.activeSidebarGroup === group);

        html += `
            <div class="nav-item ${isActive ? 'active' : ''}" onclick="openSidebarGroup('${group}')">
                <i class="${icon}"></i> ${label}
                ${isActive ? '<div style="margin-left: auto; width: 6px; height: 6px; background: var(--primary); border-radius: 50%;"></div>' : ''}
            </div>
        `;
    }
    
    primaryMenu.innerHTML = html;
    
    if (state.activeSidebarGroup) {
        renderSidebarSecondary(state.activeSidebarGroup);
    }
}

window.openSidebarGroup = function(group) {
    state.activeSidebarGroup = group;
    renderSidebarMenu();
}

function renderSidebarSecondary(group) {
    const secondary = document.getElementById('sidebar-secondary');
    const secondaryTitle = document.getElementById('secondary-title');
    const secondaryMenu = document.getElementById('secondary-menu');
    
    if (!secondary || !secondaryMenu) return;
    
    const modules = state.menuGroups[group];
    if (!modules || modules.length === 0) {
        secondary.classList.add('collapsed');
        return;
    }
    
    secondary.classList.remove('collapsed');
    secondaryTitle.innerText = FEATURE_GROUP_LABELS[group] || group;
    
    let html = '';
    for (const mod of modules) {
        const isActive = state.currentView === mod.id;
        html += `
            <div
                class="nav-item ${isActive ? 'active' : ''}"
                data-module="${mod.id}"
                role="button"
                tabindex="0"
                title="${mod.pageTitle || mod.label}"
            >
                <i class="${mod.icon}"></i> ${mod.label}
            </div>
        `;
    }
    secondaryMenu.innerHTML = html;
}

"""

content = re.sub(old_render_block, new_render_block, content, flags=re.DOTALL)

with open(app_path, 'w', encoding='utf-8') as f:
    f.write(content)
    
print("Updated app.js sidebar logic.")
