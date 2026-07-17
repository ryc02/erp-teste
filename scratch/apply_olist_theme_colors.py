# -*- coding: utf-8 -*-
import os
import re
import glob

modules_dir = r"d:\ERP Venner\frontend\modules"
html_files = glob.glob(os.path.join(modules_dir, "**", "*.html"), recursive=True)

def clean_inline_styles(content):
    # 1. Clean the main view-section background
    # Some have style="background: #1e1e1e; color: #e0e0e0; padding: 24px; min-height: 100vh;"
    content = re.sub(r'(class="view-section"\s*)style="[^"]*"', r'\1', content)
    content = re.sub(r'style="[^"]*"(>\s*<!-- BREADCRUMB / HEADER -->)', r'\1', content)
    
    # 2. Clean rogue #1e1e1e or #0a0e14 or #141414 from other divs
    content = re.sub(r'background:\s*#[0-9a-fA-F]{3,6};?', '', content)
    
    # 3. We shouldn't blindly remove all colors, because some inline colors might be for specific text (like a small gray text)
    # But for headers: <h2 style="margin: 0; font-size: 24px; font-weight: 600; color: #fff;">
    content = content.replace('color: #fff;', '')
    content = content.replace('color: #ffffff;', '')
    content = content.replace('color: #ccc;', '')
    content = content.replace('color: #e0e0e0;', '')
    
    # Clean up empty style attributes left behind: style="" or style=" "
    content = re.sub(r'style="\s*"', '', content)
    
    return content

count = 0
for filepath in html_files:
    if "produtos.html" in filepath:
        continue
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
        
    original = content
    content = clean_inline_styles(content)
    
    if content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        count += 1
        print(f"Cleaned HTML: {os.path.basename(filepath)}")

print(f"Total HTML files cleaned: {count}")
