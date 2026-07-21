from dotenv import load_dotenv
load_dotenv()
from database import engine
from sqlalchemy import text

try:
    with engine.begin() as conn:
        conn.execute(text("ALTER TABLE configuracoes_expedicao ADD COLUMN template_etiqueta TEXT"))
except Exception as e:
    print("configuracoes_expedicao template_etiqueta:", e)

print("Done")
