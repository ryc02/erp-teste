import sqlite3

def run():
    conn = sqlite3.connect('erp_venner.db')
    c = conn.cursor()
    c.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='configuracoes_vendas'")
    res = c.fetchall()
    
    if res:
        columns = [
            'exibir_preco_desconto_itens BOOLEAN DEFAULT 1', 
            'alerta_endereco_incompleto BOOLEAN DEFAULT 1', 
            'alerta_comissao_zerada BOOLEAN DEFAULT 1', 
            'visualizar_contas_receber BOOLEAN DEFAULT 1', 
            'exibir_marcador_status_pagamento BOOLEAN DEFAULT 1', 
            "exibir_detalhes_venda VARCHAR DEFAULT 'SIM'", 
            "exibir_dados_adicionais VARCHAR DEFAULT 'SIM'", 
            "exibir_transportador VARCHAR DEFAULT 'SIM'"
        ]
        for col in columns:
            try:
                c.execute(f'ALTER TABLE configuracoes_vendas ADD COLUMN {col}')
                print(f"Added {col}")
            except sqlite3.OperationalError as e:
                print(f"Failed to add {col}: {e}")
    else:
        print("Table configuracoes_vendas does not exist. It will be created by SQLAlchemy.")
        
    conn.commit()
    conn.close()

if __name__ == '__main__':
    run()
