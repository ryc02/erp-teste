import os
import re

directory = r'd:\ERP Venner\frontend\modules'
for root, _, files in os.walk(directory):
    for file in files:
        if file.endswith('.html'):
            filepath = os.path.join(root, file)
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            
            original_content = content
            
            # Replace table class
            content = content.replace('<table class="table"', '<table class="olist-table"')
            content = content.replace('<table class="table "', '<table class="olist-table "')
            
            # If table has no class but has id
            content = re.sub(r'<table id="([^"]+)">', r'<table class="olist-table" id="\1">', content)
            
            # Replace tab-btn
            content = content.replace('class="tab-btn active"', 'class="olist-tab active tab-btn" style="background:transparent; border-top:none; border-left:none; border-right:none;"')
            content = content.replace('class="tab-btn"', 'class="olist-tab tab-btn" style="background:transparent; border-top:none; border-left:none; border-right:none;"')
            
            # Replace .view-header H2 styles to match Olist
            content = re.sub(r'<div class="view-header">\s*<h2>(.*?)</h2>', r'<div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px;">\n        <div>\n            <div style="font-size: 12px; color: #888; margin-bottom: 8px;">\n                módulo <span style="color: #ccc;">gestão</span>\n            </div>\n            <h2 style="margin: 0; font-size: 24px; font-weight: 600; color: #fff;">\1</h2>\n        </div>', content)
            
            # Since view-header replacement drops the <div class="flex-gap"> part, let's just do a simpler replacement:
            # Let's revert the view-header idea as it might break the flex-gap buttons.
            
            if content != original_content:
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(content)
                print(f"Updated {filepath}")
print('Done!')
