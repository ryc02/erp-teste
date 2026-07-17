from database import engine
from sqlalchemy import text

def migrate():
    print("Iniciando migração manual...")
    with engine.begin() as conn:
        try:
            conn.execute(text('ALTER TABLE usuarios ADD COLUMN permissoes TEXT'))
            print("Coluna 'permissoes' adicionada com sucesso.")
        except Exception as e:
            if "already exists" in str(e).lower() or "duplicate column" in str(e).lower():
                print("A coluna 'permissoes' já existe.")
            else:
                print(f"Erro ao adicionar coluna: {e}")

if __name__ == "__main__":
    migrate()
