import sys
sys.path.append(r"D:\ERP Venner\backend")
from main import app
from database import engine, Base

# We are using Base.metadata.create_all which is a simple way to create new tables if they don't exist
# For new columns on existing tables, we use ALTER TABLE
def upgrade():
    # create new tables
    Base.metadata.create_all(bind=engine)
    
    # add new columns to contas_financeiras
    with engine.connect() as conn:
        try:
            conn.execute("ALTER TABLE contas_financeiras ADD COLUMN recorrencia_id VARCHAR(255) NULL;")
        except Exception as e:
            pass
        try:
            conn.execute("ALTER TABLE contas_financeiras ADD COLUMN parcela_atual INTEGER DEFAULT 1;")
        except Exception as e:
            pass
        try:
            conn.execute("ALTER TABLE contas_financeiras ADD COLUMN total_parcelas INTEGER DEFAULT 1;")
        except Exception as e:
            pass
        try:
            conn.execute("ALTER TABLE contas_financeiras ADD COLUMN tags_csv VARCHAR(255) NULL;")
        except Exception as e:
            pass

if __name__ == "__main__":
    upgrade()
    print("Migração Fase 4 Financeiro concluída!")
