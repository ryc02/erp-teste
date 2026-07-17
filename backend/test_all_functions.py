import requests
import json

BASE_URL = "http://127.0.0.1:8000/api/v1"

# Obter token de admin
def get_token():
    print("[*] Autenticando...")
    res = requests.post(f"{BASE_URL}/auth/login", data={
        "username": "admin",
        "password": "admin123"
    })
    if res.status_code == 200:
        return res.json().get("access_token")
    else:
        print("Erro de autenticação!")
        return None

token = get_token()
headers = {"Authorization": f"Bearer {token}"} if token else {}

def test_endpoint(name, method, url, payload=None):
    print(f"\n[*] Testando {name} ({method} {url})...")
    try:
        if method == "GET":
            res = requests.get(f"{BASE_URL}{url}", headers=headers)
        elif method == "POST":
            res = requests.post(f"{BASE_URL}{url}", headers=headers, json=payload)
        
        print(f" -> Status: {res.status_code}")
        if res.status_code >= 400:
            print(f" -> Erro: {res.text}")
        return res
    except Exception as e:
        print(f" -> Exceção: {e}")
        return None

# Testar Produtos
prod_payload = {
    "sku": "TEST-PROD-999",
    "nome": "Produto Teste Bateria",
    "unidade_medida": "UN",
    "categoria": "TESTE",
    "tipo_produto": "Simples",
    "estoque_minimo": 0,
    "estoque_maximo": 0,
    "controlar_estoque": True,
    "controlar_lotes": False
}
res_prod = test_endpoint("Criar Produto", "POST", "/produtos/", prod_payload)
test_endpoint("Listar Produtos", "GET", "/produtos/")

# Testar Clientes
cli_payload = {
    "nome_razao_social": "Cliente Teste",
    "tipo": "Física",
    "cpf_cnpj": "12345678901",
    "email": "teste@teste.com"
}
res_cli = test_endpoint("Criar Cliente", "POST", "/comercial/clientes", cli_payload)
test_endpoint("Listar Clientes", "GET", "/comercial/clientes")

# Testar Pedidos (CRM)
if res_cli and res_cli.status_code == 200:
    cliente_id = res_cli.json().get("id")
    pedido_payload = {
        "tipo": "PEDIDO",
        "cliente_id": cliente_id,
        "cliente_nome": "Cliente Teste",
        "valor_total": 100.0,
        "itens": [
            {
                "produto_id": 13091,
                "quantidade": 1.0,
                "preco_unitario": 100.0
            }
        ]
    }
    test_endpoint("Criar Pedido Venda", "POST", "/vendas/pedidos", pedido_payload)

test_endpoint("Listar Pedidos", "GET", "/vendas/pedidos")

# Testar PCP
test_endpoint("Listar Ordens Produção", "GET", "/pcp/ordens/")

# Testar Manutenção
test_endpoint("Listar Máquinas", "GET", "/manutencao/maquinas/")

# Testar Estoque (Movimentações)
test_endpoint("Listar Movimentações", "GET", "/movimentacoes/")

print("\n[+] Teste completo finalizado.")
