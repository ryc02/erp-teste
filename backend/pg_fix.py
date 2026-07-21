from dotenv import load_dotenv
load_dotenv()
from database import engine
from sqlalchemy import text

try:
    with engine.begin() as conn:
        conn.execute(text("ALTER TABLE empresas ADD COLUMN tipo_empresa VARCHAR DEFAULT 'MATRIZ'"))
except Exception as e:
    print("empresas tipo_empresa:", e)

try:
    with engine.begin() as conn:
        conn.execute(text("ALTER TABLE empresas ADD COLUMN matriz_id INTEGER REFERENCES empresas(id)"))
except Exception as e:
    print("empresas matriz_id:", e)

try:
    with engine.begin() as conn:
        conn.execute(text("ALTER TABLE empresas ADD COLUMN regime_tributario VARCHAR DEFAULT 'SIMPLES_NACIONAL'"))
except Exception as e:
    print("empresas regime_tributario:", e)

try:
    with engine.begin() as conn:
        conn.execute(text("ALTER TABLE pedidos_venda ADD COLUMN empresa_faturadora_id INTEGER REFERENCES empresas(id)"))
except Exception as e:
    print("pedidos_venda empresa_faturadora_id:", e)

print("Done")
