# -*- coding: utf-8 -*-
import os
import re
import glob

modules_dir = r"d:\ERP Venner\frontend\modules"
html_files = glob.glob(os.path.join(modules_dir, "**", "*.html"), recursive=True)

def migrate_html(content):
    content = re.sub(r'style="flex:\s*1;\s*position:\s*relative;[^"]+"', 'class="search-wrapper"', content)
    content = re.sub(r'style="width:\s*100%;\s*padding:\s*12px 16px 12px 45px;[^"]+"', 'class="search-input"', content)
    content = re.sub(r'class="btn btn-outline"(.*?)style="border-radius:\s*20px;[^"]+"', r'class="action-button"\1', content)
    
    # Catch all old btn btn-outline in tables or action rows
    content = content.replace('class="btn btn-outline"', 'class="action-button"')
    
    # Buttons that have btn btn-primary can also keep btn-primary but lose border-radius: 20px
    content = re.sub(r'class="btn btn-primary"(.*?)style="border-radius:\s*20px;[^"]+"', r'class="btn btn-primary"\1style="border-radius: 8px; font-weight: 600;"', content)
    
    return content

count = 0
for filepath in html_files:
    if "produtos.html" in filepath:
        continue
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    original = content
    content = migrate_html(content)
    if content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        count += 1
        print(f"Updated HTML: {os.path.basename(filepath)}")
print(f"Total HTML files updated: {count}")
