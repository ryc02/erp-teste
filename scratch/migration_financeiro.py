import os
import sys

# Adiciona o diretório backend ao PYTHONPATH para imports funcionarem
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'backend'))

from database import SessionLocal
from models.vendas import PedidoVenda
from models.financeiro import ContaFinanceira
from datetime import datetime

def run_migration():
    db = SessionLocal()
    try:
        # Pega todos os pedidos já faturados, enviados ou entregues
        pedidos = db.query(PedidoVenda).filter(
            PedidoVenda.status.in_(["FATURADO", "SEPARACAO", "ENVIADO", "ENTREGUE"])
        ).all()
        
        count = 0
        for p in pedidos:
            # Verifica se já existe uma conta para esse pedido
            existe = db.query(ContaFinanceira).filter(ContaFinanceira.pedido_id == p.id).first()
            if not existe:
                # Se estiver entregue/enviado, vamos assumir que já está pago retroativamente para não sujar o painel?
                # A requisição foi para contas a receber vinculadas. Vamos criar como PENDENTE ou PAGO dependendo do status.
                status_conta = "PAGO" if p.status == "ENTREGUE" else "PENDENTE"
                data_pgto = datetime.now() if status_conta == "PAGO" else None
                
                nova_conta = ContaFinanceira(
                    tipo="RECEBER",
                    status=status_conta,
                    descricao=f"Faturamento do Pedido #{p.id} (Retroativo)",
                    valor=p.valor_total,
                    data_vencimento=p.data_pedido or datetime.now(),
                    data_pagamento=data_pgto,
                    pedido_id=p.id,
                    cliente_id=p.cliente_id
                )
                db.add(nova_conta)
                count += 1
                
        db.commit()
        print(f"Migração concluída: {count} registros financeiros criados retroativamente.")
    except Exception as e:
        print("Erro na migração:", e)
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    run_migration()
