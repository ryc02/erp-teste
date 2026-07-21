import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), "../backend"))

from database import engine, SessionLocal
from sqlalchemy import text, inspect

def run_migrations():
    inspector = inspect(engine)
    
    with engine.begin() as connection:
        # Empresas
        empresas_cols = [c["name"] for c in inspector.get_columns("empresas")]
        if "tipo_empresa" not in empresas_cols:
            connection.execute(text("ALTER TABLE empresas ADD COLUMN tipo_empresa VARCHAR DEFAULT 'MATRIZ'"))
        if "matriz_id" not in empresas_cols:
            connection.execute(text("ALTER TABLE empresas ADD COLUMN matriz_id INTEGER REFERENCES empresas(id)"))
        if "regime_tributario" not in empresas_cols:
            connection.execute(text("ALTER TABLE empresas ADD COLUMN regime_tributario VARCHAR DEFAULT 'SIMPLES_NACIONAL'"))
            
        # PedidoVenda
        pedidos_cols = [c["name"] for c in inspector.get_columns("pedidos_venda")]
        if "empresa_faturadora_id" not in pedidos_cols:
            connection.execute(text("ALTER TABLE pedidos_venda ADD COLUMN empresa_faturadora_id INTEGER REFERENCES empresas(id)"))

    print("Migration successful: Added matriz/filial fields to empresas and empresa_faturadora_id to pedidos_venda.")

if __name__ == "__main__":
    run_migrations()
