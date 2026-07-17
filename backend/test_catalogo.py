import requests

BASE_URL = "http://127.0.0.1:8000/api/v1"

# Obter token
res_auth = requests.post(f"{BASE_URL}/auth/login", data={
    "username": "admin",
    "password": "admin123"
})
token = res_auth.json().get("access_token")
headers = {"Authorization": f"Bearer {token}"}

res = requests.get(f"{BASE_URL}/vendas/catalogo-produtos", headers=headers)
print("STATUS:", res.status_code)
print("BODY:", res.text)
