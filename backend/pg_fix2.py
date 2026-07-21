from dotenv import load_dotenv
load_dotenv()
from database import engine
from sqlalchemy import text

try:
    with engine.begin() as conn:
        conn.execute(text("ALTER TABLE pedidos_venda ADD COLUMN empresa_id INTEGER REFERENCES empresas(id)"))
except Exception as e:
    print("pedidos_venda empresa_id:", e)

try:
    with engine.begin() as conn:
        conn.execute(text("ALTER TABLE movimentacoes_estoque ADD COLUMN empresa_id INTEGER REFERENCES empresas(id)"))
except Exception as e:
    print("movimentacoes_estoque empresa_id:", e)
    
try:
    with engine.begin() as conn:
        conn.execute(text("ALTER TABLE contas_financeiras ADD COLUMN empresa_id INTEGER REFERENCES empresas(id)"))
except Exception as e:
    print("contas_financeiras empresa_id:", e)

try:
    with engine.begin() as conn:
        conn.execute(text("ALTER TABLE notas_fiscais ADD COLUMN empresa_id INTEGER REFERENCES empresas(id)"))
except Exception as e:
    print("notas_fiscais empresa_id:", e)

print("Done")
