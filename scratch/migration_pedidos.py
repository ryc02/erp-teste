import sqlite3
import os

db_path = r"d:\ERP Venner\backend\erp_venner.db"

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

def add_column_if_not_exists(table, col_name, col_def):
    cursor.execute(f"PRAGMA table_info({table})")
    columns = [col[1] for col in cursor.fetchall()]
    if col_name not in columns:
        print(f"Adicionando {col_name} na tabela {table}...")
        cursor.execute(f"ALTER TABLE {table} ADD COLUMN {col_name} {col_def}")
        return True
    return False

# Adicionando colunas de pedidos_venda
columns_to_add = [
    ("tipo", "VARCHAR DEFAULT 'PEDIDO'"),
    ("cliente_id", "INTEGER"),
    ("representante_id", "INTEGER"),
    ("vendedor_interno_id", "INTEGER"),
    ("condicao_pagamento_id", "INTEGER"),
    ("valor_frete", "FLOAT DEFAULT 0.0"),
    ("desconto_valor", "FLOAT DEFAULT 0.0"),
    ("codigo_rastreio", "VARCHAR"),
    ("url_rastreio", "VARCHAR"),
    ("transportadora", "VARCHAR"),
    ("proposta_id", "INTEGER"),
    ("peso_bruto", "FLOAT DEFAULT 0.0"),
    ("peso_liquido", "FLOAT DEFAULT 0.0"),
    ("volumes", "FLOAT DEFAULT 1.0"),
    ("status_separacao", "VARCHAR DEFAULT 'PENDENTE'")
]

for col_name, col_def in columns_to_add:
    add_column_if_not_exists("pedidos_venda", col_name, col_def)

# Adicionando colunas na itens_pedido_venda se necessário
cursor.execute("PRAGMA table_info(itens_pedido_venda)")
if not cursor.fetchall():
    print("Tabela itens_pedido_venda nao existe, sera recriada pela engine.")

conn.commit()
conn.close()
print("Migração concluída.")
