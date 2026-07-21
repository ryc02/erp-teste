from sqlalchemy import create_engine, text
engine = create_engine('sqlite:///erp_venner.db')

try:
    with engine.begin() as conn:
        conn.execute(text("ALTER TABLE empresas ADD COLUMN tipo_empresa VARCHAR DEFAULT 'MATRIZ'"))
except Exception as e:
    print(e)

try:
    with engine.begin() as conn:
        conn.execute(text("ALTER TABLE empresas ADD COLUMN matriz_id INTEGER"))
except Exception as e:
    print(e)

try:
    with engine.begin() as conn:
        conn.execute(text("ALTER TABLE empresas ADD COLUMN regime_tributario VARCHAR DEFAULT 'SIMPLES_NACIONAL'"))
except Exception as e:
    print(e)

try:
    with engine.begin() as conn:
        conn.execute(text("ALTER TABLE pedidos_venda ADD COLUMN empresa_faturadora_id INTEGER"))
except Exception as e:
    print(e)

print("Done")
