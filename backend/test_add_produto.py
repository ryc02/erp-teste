from fastapi.testclient import TestClient
from main import app
from database import SessionLocal
import models
from services.auth import get_current_user

def override_get_current_user():
    db = SessionLocal()
    # Assume admin
    return db.query(models.User).filter(models.User.username == "admin").first()

app.dependency_overrides[get_current_user] = override_get_current_user
client = TestClient(app)

payload = {
    "sku": "TEST-1234",
    "nome": "Produto Teste",
    "unidade_medida": "UN",
    "preco_venda": 10.0,
    "estoque_minimo": 0,
    "estoque_maximo": 100,
    "dias_preparacao": 1,
    "tipo_produto": "PRODUTO",
    "controlar_estoque": True,
    "controlar_lotes": False,
    "ativo": True,
    "peso_liquido": 0,
    "peso_bruto": 0,
    "largura": 0,
    "altura": 0,
    "comprimento": 0
}

response = client.post("/api/v1/produtos/", json=payload)
print("Status Code:", response.status_code)
print("Response:", response.text)
