from fastapi.testclient import TestClient
from main import app
from database import SessionLocal
import models
from services.auth import get_current_user

def override_get_current_user():
    db = SessionLocal()
    return db.query(models.User).first()

app.dependency_overrides[get_current_user] = override_get_current_user

client = TestClient(app)

response = client.get("/api/v1/vendas/pedidos")
print("Status Code /pedidos:", response.status_code)
if response.status_code == 500:
    print(response.json())
else:
    print(response.text[:200])

response = client.get("/api/v1/comercial/clientes")
print("Status Code /clientes:", response.status_code)
if response.status_code == 500:
    print(response.json())
else:
    print(response.text[:200])
