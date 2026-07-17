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

# Adicionando colunas novas de pedidos_venda
columns_to_add = [
    ("data_prevista_entrega", "DATETIME"),
    ("data_envio", "DATETIME"),
    ("data_maxima_despacho", "DATETIME"),
    ("despesas_valor", "FLOAT DEFAULT 0.0"),
    ("forma_pagamento", "VARCHAR"),
    ("meio_pagamento", "VARCHAR"),
    ("conta_bancaria_id", "INTEGER"),
    ("categoria_id", "INTEGER"),
    ("forma_envio", "VARCHAR"),
    ("enviar_expedicao", "BOOLEAN DEFAULT 1"),
    ("deposito_padrao", "VARCHAR"),
    ("observacoes_internas", "TEXT"),
    ("marcadores", "VARCHAR")
]

for col_name, col_def in columns_to_add:
    add_column_if_not_exists("pedidos_venda", col_name, col_def)

conn.commit()
conn.close()
print("Migração da UI estendida concluída.")
