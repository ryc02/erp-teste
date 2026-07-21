import sqlite3
import os

db_path = r"D:\ERP Venner\backend\erp_venner.db"
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Criar tabela empresas se não existir
cursor.execute('''
CREATE TABLE IF NOT EXISTS empresas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    razao_social VARCHAR NOT NULL,
    nome_fantasia VARCHAR,
    cnpj VARCHAR NOT NULL UNIQUE,
    ativa BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
''')

# Tentar inserir uma empresa padrão caso esteja vazio
try:
    cursor.execute("INSERT INTO empresas (razao_social, nome_fantasia, cnpj) VALUES ('Empresa Matriz Padrão', 'Matriz', '00.000.000/0001-00')")
except sqlite3.IntegrityError:
    pass

# Adicionar coluna empresa_id nas tabelas existentes
tabelas = ["notas_fiscais", "pedidos_venda", "movimentacoes_estoque"]
for tabela in tabelas:
    try:
        cursor.execute(f"ALTER TABLE {tabela} ADD COLUMN empresa_id INTEGER REFERENCES empresas(id)")
        print(f"Coluna empresa_id adicionada na tabela {tabela}")
        # Atrelar os registros existentes à empresa 1
        cursor.execute(f"UPDATE {tabela} SET empresa_id = 1 WHERE empresa_id IS NULL")
    except sqlite3.OperationalError as e:
        if "duplicate column name" in str(e).lower():
            print(f"Coluna empresa_id já existe na tabela {tabela}")
        else:
            print(f"Erro na tabela {tabela}: {e}")

conn.commit()
conn.close()
print("Migração concluída.")
