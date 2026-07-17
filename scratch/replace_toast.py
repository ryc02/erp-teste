import os

def replace_in_files(directory, old_str, new_str):
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith('.js'):
                path = os.path.join(root, file)
                with open(path, 'r', encoding='utf-8', errors='ignore') as f:
                    content = f.read()
                
                if old_str in content:
                    content = content.replace(old_str, new_str)
                    with open(path, 'w', encoding='utf-8') as f:
                        f.write(content)
                    print(f"Updated {file}")

replace_in_files(r'd:\ERP Venner\frontend\modules', 'showToast', 'showNotify')
