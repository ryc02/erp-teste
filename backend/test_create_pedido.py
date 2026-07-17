import requests
import json

BASE_URL = "http://127.0.0.1:8000/api/v1"

print("[*] Autenticando...")
res_auth = requests.post(f"{BASE_URL}/auth/login", data={
    "username": "admin",
    "password": "admin123"
})
if res_auth.status_code != 200:
    print("Erro de autenticacao!")
    exit(1)

token = res_auth.json().get("access_token")
headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}

print("\n[*] Criando cliente temporario...")
cli_res = requests.post(f"{BASE_URL}/comercial/clientes", headers=headers, json={
    "nome_razao_social": "Cliente Teste Novo Pedido",
    "tipo": "Física",
    "cpf_cnpj": "00000000000",
    "email": "testepedido@test.com"
})

if cli_res.status_code >= 400 and cli_res.status_code != 400: # 400 se ja existir ok
    print("Erro cliente:", cli_res.text)
    exit(1)

cliente_id = 1
if cli_res.status_code == 200:
    cliente_id = cli_res.json()["id"]

print(f"\n[*] Criando pedido com cliente ID {cliente_id}...")
pedido_payload = {
    "tipo": "PEDIDO",
    "cliente_id": cliente_id,
    "cliente_nome": "Cliente Teste Novo Pedido",
    "valor_frete": 15.50,
    "desconto_valor": 5.0,
    "observacoes": "Teste automatizado",
    "itens": [
        {
            "produto_id": 13091,
            "quantidade": 2,
            "preco_unitario": 50.0
        }
    ]
}

ped_res = requests.post(f"{BASE_URL}/vendas/pedidos", headers=headers, json=pedido_payload)
print(f" -> Status POST Pedido: {ped_res.status_code}")
print(f" -> Response POST Pedido: {ped_res.text}")
