import sqlite3

def fix_schema():
    conn = sqlite3.connect('erp_venner.db')
    cursor = conn.cursor()
    try:
        # Create a new table with the correct schema according to the latest model
        cursor.execute('''
        CREATE TABLE comercial_representantes_new (
            id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
            codigo VARCHAR,
            nome VARCHAR NOT NULL,
            ativo BOOLEAN NOT NULL DEFAULT 1,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME,
            comissao_padrao FLOAT DEFAULT 0,
            email VARCHAR,
            telefone VARCHAR,
            fantasia VARCHAR,
            tipo_pessoa VARCHAR,
            cpf_cnpj VARCHAR,
            contribuinte VARCHAR,
            inscricao_estadual VARCHAR,
            cep VARCHAR,
            cidade VARCHAR,
            uf VARCHAR,
            endereco VARCHAR,
            bairro VARCHAR,
            numero VARCHAR,
            complemento VARCHAR,
            celular VARCHAR
        );
        ''')
        
        # Get existing columns to avoid INSERT errors
        cursor.execute('PRAGMA table_info(comercial_representantes);')
        columns = [col[1] for col in cursor.fetchall()]
        
        # Copy data
        col_names = ', '.join(columns)
        cursor.execute(f'''
        INSERT INTO comercial_representantes_new ({col_names})
        SELECT {col_names} FROM comercial_representantes;
        ''')
        
        # Replace tables
        cursor.execute('DROP TABLE comercial_representantes;')
        cursor.execute('ALTER TABLE comercial_representantes_new RENAME TO comercial_representantes;')
        
        # Recreate indexes
        cursor.execute('CREATE INDEX ix_comercial_representantes_codigo ON comercial_representantes (codigo);')
        cursor.execute('CREATE INDEX ix_comercial_representantes_nome ON comercial_representantes (nome);')
        
        conn.commit()
        print("Schema fixed successfully. 'codigo' is now nullable VARCHAR, and missing columns were added.")
    except Exception as e:
        conn.rollback()
        print(f"Error: {e}")
    finally:
        conn.close()

if __name__ == '__main__':
    fix_schema()
