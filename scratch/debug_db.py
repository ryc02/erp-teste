import sys
import os

# Adicionar o caminho do backend ao sys.path
sys.path.append(os.path.join(os.getcwd(), 'backend'))

try:
    from database import SessionLocal
    import models

    db = SessionLocal()
    maquinas = db.query(models.Maquina).all()
    print(f"Total de máquinas no BD: {len(maquinas)}")
    for m in maquinas:
        print(f"ID: {m.id}, Nome: {m.nome}, Status: {m.status}")
    
    ativas = db.query(models.Maquina).filter(models.Maquina.status == "OPERANTE").count()
    print(f"Máquinas ativas (OPERANTE): {ativas}")
    
    db.close()
except Exception as e:
    print(f"Erro: {e}")
