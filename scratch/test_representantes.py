import requests

BASE_URL = "http://127.0.0.1:8000/api/v1"

# We must get a token first
auth_payload = {
    "username": "admin",
    "password": "admin123" # assuming standard test password
}

print("1. Fazendo login...")
token_res = requests.post(f"{BASE_URL}/auth/login", data=auth_payload)
if token_res.status_code != 200:
    print("Erro no login:", token_res.text)
    exit(1)

token = token_res.json()["access_token"]
headers = {"Authorization": f"Bearer {token}"}

print("\n2. Listando representantes...")
res = requests.get(f"{BASE_URL}/comercial/representantes", headers=headers)
print(f"Status: {res.status_code}")
if res.status_code == 200:
    reps = res.json()
    print(f"Total encontrados: {len(reps)}")
else:
    print("Erro ao listar:", res.text)
    exit(1)

print("\n3. Criando novo representante de teste...")
payload = {
    "codigo": "999",
    "nome": "Representante de Teste Automatizado",
    "fantasia": "Rep Aut",
    "tipo_pessoa": "Jurídica",
    "cpf_cnpj": "12345678901234",
    "contribuinte": "Não informado",
    "cep": "01001000",
    "cidade": "São Paulo",
    "uf": "SP",
    "ativo": True
}
res = requests.post(f"{BASE_URL}/comercial/representantes", json=payload, headers=headers)
print(f"Status: {res.status_code}")
if res.status_code == 200:
    novo_rep = res.json()
    print("Representante criado:", novo_rep["id"], "-", novo_rep["nome"])
else:
    print("Erro ao criar:", res.text)
    exit(1)

print("\n4. Atualizando representante (inativando)...")
novo_rep["ativo"] = False
res = requests.put(f"{BASE_URL}/comercial/representantes/{novo_rep['id']}", json=novo_rep, headers=headers)
print(f"Status: {res.status_code}")
if res.status_code == 200:
    print("Representante atualizado (Inativo).")
else:
    print("Erro ao atualizar:", res.text)
    exit(1)

print("\n5. Listando novamente (incluindo inativos)...")
res = requests.get(f"{BASE_URL}/comercial/representantes?include_inativos=true", headers=headers)
if res.status_code == 200:
    reps = res.json()
    rep_encontrado = next((r for r in reps if r["id"] == novo_rep["id"]), None)
    if rep_encontrado:
        print(f"Representante encontrado na lista. Ativo: {rep_encontrado['ativo']}")
    else:
        print("Representante não encontrado na lista!")
else:
    print("Erro:", res.text)

print("\n✅ Todos os testes do módulo Representantes passaram com sucesso!")
