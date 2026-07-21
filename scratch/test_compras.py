import requests

BASE_URL = "http://127.0.0.1:8000/api/v1"

auth_payload = {
    "username": "admin",
    "password": "admin123"
}

print("1. Fazendo login...")
token_res = requests.post(f"{BASE_URL}/auth/login", data=auth_payload)
if token_res.status_code != 200:
    print("Erro no login:", token_res.text)
    exit(1)

token = token_res.json()["access_token"]
headers = {"Authorization": f"Bearer {token}"}

print("\n2. Preparando Fornecedor e Produto...")
# Pega o primeiro fornecedor e produto
cli_res = requests.get(f"{BASE_URL}/comercial/clientes?tipo_contato=Fornecedor&limit=1", headers=headers)
forn = cli_res.json()[0] if cli_res.status_code == 200 and cli_res.json() else None

prod_res = requests.get(f"{BASE_URL}/produtos?limit=1", headers=headers)
prod = prod_res.json()[0] if prod_res.status_code == 200 and prod_res.json() else None

if not forn:
    print("Criando fornecedor de teste...")
    cli_res = requests.post(f"{BASE_URL}/comercial/clientes", json={"nome_razao_social": "Fornecedor Teste", "cpf_cnpj": "00000000000000", "tipo_pessoa": "Jurídica", "tipo_contato": "Fornecedor", "ativo": True}, headers=headers)
    forn = cli_res.json()

if not prod:
    print("Criando produto de teste...")
    prod_res = requests.post(f"{BASE_URL}/produtos", json={"nome": "Produto Compras Teste", "sku": "COMP-001", "unidade": "UN", "preco_venda": 10.0, "tipo_item": "00", "ativo": True}, headers=headers)
    prod = prod_res.json()

print(f"Fornecedor: {forn['id']} | Produto: {prod['id']}")

print("\n3. Criando Rascunho da Ordem de Compra...")
payload = {
    "fornecedor_id": forn['id'],
    "fornecedor_nome": forn['nome_razao_social'],
    "valor_frete": 15.00,
    "desconto_valor": 5.00,
    "observacoes": "Ordem de Teste Automatizado",
    "status": "RASCUNHO",
    "itens": [
        {
            "produto_id": prod['id'],
            "quantidade": 10,
            "preco_unitario": 2.50
        }
    ]
}

res = requests.post(f"{BASE_URL}/compras/ordens", json=payload, headers=headers)
if res.status_code == 200:
    ordem = res.json()
    print("Ordem criada:", ordem["id"], "Total:", ordem["valor_total"])
else:
    print("Erro ao criar:", res.text)
    exit(1)

print("\n4. Aprovando a Ordem de Compra...")
res = requests.post(f"{BASE_URL}/compras/ordens/{ordem['id']}/aprovar", headers=headers)
if res.status_code == 200:
    print("Ordem aprovada.")
else:
    print("Erro ao aprovar:", res.text)
    exit(1)

print("\n5. Recebendo a Ordem (atualizando estoque)...")
res = requests.post(f"{BASE_URL}/compras/ordens/{ordem['id']}/receber", headers=headers)
if res.status_code == 200:
    print("Ordem recebida. Estoque atualizado.")
else:
    print("Erro ao receber:", res.text)
    exit(1)

print("\nTestes do módulo de Compras passaram com sucesso!")
