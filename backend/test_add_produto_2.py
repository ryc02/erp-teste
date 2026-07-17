from fastapi.testclient import TestClient
from main import app
from database import SessionLocal
import models
from services.auth import get_current_user

def override_get_current_user():
    db = SessionLocal()
    return db.query(models.User).filter(models.User.username == "admin").first()

app.dependency_overrides[get_current_user] = override_get_current_user
client = TestClient(app)

payload = {
    "tipo_produto": "Simples",
    "origem_icms": "0",
    "nome": "Produto de Teste Frontend",
    "descricao": "",
    "sku": "",
    "ncm": "",
    "gtin": "",
    "preco_venda": 0.0,
    "categoria": "METALURGICA",
    "unidade_medida": "UN",
    "peso_liquido": 0.0,
    "peso_bruto": 0.0,
    "tipo_embalagem": "Pacote / Caixa",
    "largura": 0.0,
    "altura": 0.0,
    "comprimento": 0.0,
    "controlar_estoque": True,
    "controlar_lotes": False,
    "estoque_minimo": 0.0,
    "estoque_medio": 0.0,
    "estoque_maximo": 0.0,
    "posicao": "",
    "dias_preparacao": 0
}

response = client.post("/api/v1/produtos/", json=payload)
print("Status Code:", response.status_code)
print("Response:", response.text)
