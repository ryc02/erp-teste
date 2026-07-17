import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'backend'))

from database import engine
from sqlalchemy import text

def run_migration():
    print("Adicionando colunas custo e cod_fornecedor na tabela produtos...")
    with engine.connect() as conn:
        try:
            conn.execute(text("ALTER TABLE produtos ADD COLUMN custo FLOAT DEFAULT 0.0;"))
            print("Coluna custo adicionada com sucesso.")
        except Exception as e:
            print(f"Aviso ao adicionar custo: {e}")
            
        try:
            conn.execute(text("ALTER TABLE produtos ADD COLUMN cod_fornecedor VARCHAR;"))
            print("Coluna cod_fornecedor adicionada com sucesso.")
        except Exception as e:
            print(f"Aviso ao adicionar cod_fornecedor: {e}")
            
        conn.commit()
    print("Migração concluída.")

if __name__ == "__main__":
    run_migration()
