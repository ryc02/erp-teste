import sys
import os

# Adicionar o caminho do backend ao sys.path
sys.path.append(os.path.join(os.getcwd(), 'backend'))

try:
    from database import SessionLocal
    import models

    db = SessionLocal()
    # Excluir a máquina com ID 10 (que apareceu no debug anterior)
    m = db.query(models.Maquina).filter(models.Maquina.id == 10).first()
    if m:
        print(f"Excluindo máquina: {m.nome}")
        db.delete(m)
        db.commit()
        print("Máquina excluída com sucesso.")
    else:
        print("Máquina ID 10 não encontrada.")
    
    ativas = db.query(models.Maquina).filter(models.Maquina.status == "OPERANTE").count()
    print(f"Máquinas ativas restantes: {ativas}")
    
    db.close()
except Exception as e:
    print(f"Erro: {e}")
