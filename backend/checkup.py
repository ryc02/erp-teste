from database import SessionLocal, engine
import models
import comercial.models
from sqlalchemy.orm import class_mapper
import inspect
from main import app
from fastapi.testclient import TestClient

def checkup_db():
    print("--- INICIANDO CHECKUP DO BANCO DE DADOS ---")
    db = SessionLocal()
    success = True
    
    # Coletar todas as classes SQLAlchemy
    all_models = []
    for module in [models, comercial.models]:
        for name, obj in inspect.getmembers(module):
            if inspect.isclass(obj) and hasattr(obj, '__tablename__'):
                all_models.append(obj)
                
    for model in all_models:
        try:
            # Tentar fazer uma query simples
            db.query(model).first()
            print(f"[OK] Tabela '{model.__tablename__}' mapeada corretamente.")
        except Exception as e:
            print(f"[ERRO] Falha no modelo {model.__name__} (Tabela '{model.__tablename__}'):")
            print("       " + str(e).split('\n')[0])
            success = False
            db.rollback()
            
    db.close()
    return success

def checkup_fastapi():
    print("\n--- INICIANDO CHECKUP DAS ROTAS FASTAPI ---")
    success = True
    try:
        # Instanciar TestClient já valida se a árvore de dependências e schemas está consistente
        client = TestClient(app)
        print("[OK] Aplicativo FastAPI inicializou sem erros de injeção ou schemas.")
    except Exception as e:
        print(f"[ERRO] Falha ao inicializar o FastAPI: {e}")
        success = False
        
    return success

if __name__ == "__main__":
    db_ok = checkup_db()
    api_ok = checkup_fastapi()
    if db_ok and api_ok:
        print("\n[CHECKUP COMPLETO] Todos os testes passaram! Nenhum erro critico encontrado.")
    else:
        print("\n[CHECKUP COMPLETO] Foram encontrados erros. Veja o log acima.")
