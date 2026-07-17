import os

path = r'C:\ProgramData\MySQL\MySQL Server 8.0\my.ini'

with open(path, 'rb') as f:
    raw = f.read()

encoding = 'utf-8'
if raw.startswith(b'\xff\xfe') or b'\x00' in raw[:100]:
    encoding = 'utf-16'

with open(path, 'r', encoding=encoding) as f:
    lines = f.readlines()

new_lines = []
for line in lines:
    new_lines.append(line)
    if line.strip() == '[mysqld]':
        new_lines.append('bind-address=127.0.0.1\n')

with open(path, 'w', encoding=encoding) as f:
    f.writelines(new_lines)

os.system('net stop MySQL80')
os.system('net start MySQL80')
