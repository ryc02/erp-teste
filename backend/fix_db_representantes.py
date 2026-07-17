import sqlite3

def fix_db():
    conn = sqlite3.connect('erp_venner.db')
    cursor = conn.cursor()
    try:
        cursor.execute('ALTER TABLE comercial_representantes ADD COLUMN ativo BOOLEAN NOT NULL DEFAULT 1;')
        conn.commit()
        print("Column 'ativo' added successfully.")
    except sqlite3.OperationalError as e:
        print(f"OperationalError (might already exist): {e}")
    finally:
        conn.close()

if __name__ == '__main__':
    fix_db()
