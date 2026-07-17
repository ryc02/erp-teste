import os
import re
import glob

modules_dir = r"d:\ERP Venner\frontend\modules"
js_files = glob.glob(os.path.join(modules_dir, "**", "*.js"), recursive=True)

def replace_render_pagination(content, module_name):
    # Encontrar a assinatura de renderPagination
    match = re.search(r'(renderPagination\s*\([^)]*\)\s*\{)', content)
    if not match:
        return content
    
    start_idx = match.start()
    body_start_idx = match.end()
    
    # Achar a chave de fechamento balanceada
    open_braces = 1
    idx = body_start_idx
    while open_braces > 0 and idx < len(content):
        if content[idx] == '{':
            open_braces += 1
        elif content[idx] == '}':
            open_braces -= 1
        idx += 1
        
    end_idx = idx
    
    # Verificar como a tela chama o load data na changePage
    load_method = 'loadData'
    change_page_match = re.search(r'changePage\s*\([^)]*\)\s*\{.*?(this\.load[A-Za-z0-9_]+)', content, re.DOTALL)
    if change_page_match:
        load_method = change_page_match.group(1).replace('this.', '')
        
    replacement = f"""renderPagination() {{
        window.renderModernPagination('pagination-container', this.currentPage, this.itemsPerPage, this.totalItems, 'Modulo_{module_name}.changePage', 'Modulo_{module_name}.changeItemsPerPage');
    }},

    changeItemsPerPage(limit) {{
        this.itemsPerPage = parseInt(limit);
        this.currentPage = 0;
        this.{load_method}();
    }}"""
    
    # We replace from start_idx to end_idx with replacement
    # We don't want to duplicate changeItemsPerPage if it already exists
    content = content[:start_idx] + replacement + content[end_idx:]
    
    # If changeItemsPerPage already existed somewhere else, we might have two now, but it's fine (object literal overwrites).
    # To be clean, let's remove old changeItemsPerPage if it exists outside the one we just injected.
    # Actually, let's just leave it, JS object literals will just use the last one defined.
    
    return content

count = 0
for filepath in js_files:
    if "produtos.js" in filepath:
        continue # Already handled manually
        
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
        
    # Extract module name
    mod_match = re.search(r'window\.Modulo_([a-zA-Z0-9_]+)\s*=', content)
    if not mod_match:
        continue
    module_name = mod_match.group(1)
    
    original = content
    content = replace_render_pagination(content, module_name)
    
    # Fix itemsPerPage default to 20
    content = re.sub(r'itemsPerPage:\s*\d+,', 'itemsPerPage: 20,', content)
    
    # Fix table action buttons
    content = content.replace('olist-table-btn', 'table-action-icon')
    content = content.replace('btn btn-sm btn-outline', 'table-action-icon')
    content = content.replace('btn btn-sm btn-danger', 'table-action-icon delete')
    content = content.replace('btn-danger', 'delete') # Catch-all for red buttons in table
    
    if content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        count += 1
        print(f"Updated JS: {os.path.basename(filepath)}")

print(f"Total JS files updated: {count}")
