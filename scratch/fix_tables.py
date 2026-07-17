import os

directory = r'd:\ERP Venner\frontend\modules'
for root, _, files in os.walk(directory):
    for file in files:
        if file.endswith('.html'):
            filepath = os.path.join(root, file)
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            original = content
            
            content = content.replace('class="data-table"', 'class="olist-table"')
            content = content.replace('class="table align-middle border-bottom mb-0 table-hover"', 'class="olist-table"')
            content = content.replace('class="fabrica-table"', 'class="olist-table"')
            content = content.replace('class="prod-table"', 'class="olist-table"')
            content = content.replace('class="prod-table prod-days-table"', 'class="olist-table"')
            
            if content != original:
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(content)
                print('Updated', filepath)
