import sqlite3
import os

db_path = r"D:\ERP Venner\backend\erp_venner.db"

def migrate():
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        # Get first empresa to set as default
        cursor.execute("SELECT id FROM empresas ORDER BY id LIMIT 1")
        row = cursor.fetchone()
        empresa_id = row[0] if row else None
        
        # Add column to contas_financeiras
        try:
            cursor.execute("ALTER TABLE contas_financeiras ADD COLUMN empresa_id INTEGER REFERENCES empresas(id)")
            if empresa_id:
                cursor.execute(f"UPDATE contas_financeiras SET empresa_id = {empresa_id}")
            print("Added empresa_id to contas_financeiras")
        except sqlite3.OperationalError as e:
            print(f"contas_financeiras: {e}")
            
        # Add column to contas_bancarias
        try:
            cursor.execute("ALTER TABLE contas_bancarias ADD COLUMN empresa_id INTEGER REFERENCES empresas(id)")
            if empresa_id:
                cursor.execute(f"UPDATE contas_bancarias SET empresa_id = {empresa_id}")
            print("Added empresa_id to contas_bancarias")
        except sqlite3.OperationalError as e:
            print(f"contas_bancarias: {e}")
            
        # Add column to fechamentos_financeiros
        try:
            cursor.execute("ALTER TABLE fechamentos_financeiros ADD COLUMN empresa_id INTEGER REFERENCES empresas(id)")
            if empresa_id:
                cursor.execute(f"UPDATE fechamentos_financeiros SET empresa_id = {empresa_id}")
            print("Added empresa_id to fechamentos_financeiros")
        except sqlite3.OperationalError as e:
            print(f"fechamentos_financeiros: {e}")
            
        conn.commit()
        print("Migration complete!")
    except Exception as e:
        print(f"Error: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    migrate()
