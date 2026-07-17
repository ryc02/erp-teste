import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'backend'))

from database import engine, Base
from sqlalchemy import text
# Import all models so they register
import models

def run_migration():
    print("Criando novas tabelas de Propostas Comerciais...")
    # This will create propostas_comerciais and proposta_comercial_itens
    Base.metadata.create_all(bind=engine)
    
    print("Alterando tabela pedidos_venda para adicionar novos campos...")
    with engine.connect() as conn:
        try:
            conn.execute(text("ALTER TABLE pedidos_venda ADD COLUMN proposta_id INTEGER REFERENCES propostas_comerciais(id);"))
            print("Coluna proposta_id adicionada.")
        except Exception as e:
            print(f"Aviso ao adicionar proposta_id: {e}")
            
        try:
            conn.execute(text("ALTER TABLE pedidos_venda ADD COLUMN peso_bruto FLOAT DEFAULT 0.0;"))
            conn.execute(text("ALTER TABLE pedidos_venda ADD COLUMN peso_liquido FLOAT DEFAULT 0.0;"))
            conn.execute(text("ALTER TABLE pedidos_venda ADD COLUMN volumes FLOAT DEFAULT 1.0;"))
            conn.execute(text("ALTER TABLE pedidos_venda ADD COLUMN status_separacao VARCHAR DEFAULT 'PENDENTE';"))
            print("Colunas logísticas adicionadas a pedidos_venda.")
        except Exception as e:
            print(f"Aviso ao adicionar colunas logísticas: {e}")
            
        conn.commit()

    print("Migração concluída.")

if __name__ == "__main__":
    run_migration()
