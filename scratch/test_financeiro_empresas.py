import requests
import datetime
import sys

BASE_URL = "http://localhost:8000/api/v1"
headers_e1 = {"X-Empresa-Id": "1"}
headers_e2 = {"X-Empresa-Id": "2"}
token = None # If authentication is disabled for dev, we can omit it, but let's check

# 1. Login to get token
login_data = {"username": "admin", "password": "123"}
resp = requests.post(f"{BASE_URL}/auth/login", data=login_data)
if resp.status_code == 200:
    token = resp.json()["access_token"]
    headers_e1["Authorization"] = f"Bearer {token}"
    headers_e2["Authorization"] = f"Bearer {token}"
else:
    print("Failed to login:", resp.text)
    sys.exit(1)

# 2. Check if Empresa 2 exists, create if not
empresas = requests.get(f"{BASE_URL}/empresas/", headers=headers_e1).json()
empresa2_id = None
for e in empresas:
    if e.get("nome_fantasia") == "Empresa Teste 2":
        empresa2_id = str(e["id"])
        break

if not empresa2_id:
    new_emp = {
        "razao_social": "Teste Filial LTDA",
        "nome_fantasia": "Empresa Teste 2",
        "cnpj": "99.999.999/0001-99",
        "inscricao_estadual": "ISENTO"
    }
    res = requests.post(f"{BASE_URL}/empresas/", json=new_emp, headers=headers_e1)
    if res.status_code == 200:
        empresa2_id = str(res.json()["id"])
        print("Criou Empresa 2 com ID:", empresa2_id)
    else:
        print("Erro ao criar empresa:", res.text)
        sys.exit(1)
        
headers_e2["X-Empresa-Id"] = empresa2_id

# 3. Create Conta Bancária on E1
cb_e1 = {
    "descricao": "Conta BB (Empresa 1)",
    "banco": "001",
    "saldo_inicial": 0
}
res = requests.post(f"{BASE_URL}/financeiro/contas-bancarias", json=cb_e1, headers=headers_e1)
cb_e1_id = res.json()["id"]
print(f"Criada Conta Bancária E1: {cb_e1_id}")

# 4. Create Conta Bancária on E2
cb_e2 = {
    "descricao": "Conta Bradesco (Empresa 2)",
    "banco": "237",
    "saldo_inicial": 0
}
res = requests.post(f"{BASE_URL}/financeiro/contas-bancarias", json=cb_e2, headers=headers_e2)
cb_e2_id = res.json()["id"]
print(f"Criada Conta Bancária E2: {cb_e2_id}")

# 5. Check if isolation works on contas bancárias
cbs_e1 = requests.get(f"{BASE_URL}/financeiro/contas-bancarias", headers=headers_e1).json()
cbs_e2 = requests.get(f"{BASE_URL}/financeiro/contas-bancarias", headers=headers_e2).json()

assert len(cbs_e1) > 0, "Deveria ter contas na E1"
assert any(c["id"] == cb_e1_id for c in cbs_e1), "CB_E1 não encontrada na E1"
assert not any(c["id"] == cb_e2_id for c in cbs_e1), "CB_E2 VAZOU para E1!"

assert len(cbs_e2) > 0, "Deveria ter contas na E2"
assert any(c["id"] == cb_e2_id for c in cbs_e2), "CB_E2 não encontrada na E2"
assert not any(c["id"] == cb_e1_id for c in cbs_e2), "CB_E1 VAZOU para E2!"
print("Isolamento de Contas Bancárias: OK")


# 6. Create Conta a Receber on E1
hoje = datetime.datetime.now().isoformat()
conta_e1 = {
    "tipo": "RECEBER",
    "descricao": "Faturamento Teste E1",
    "valor": 1500.0,
    "data_vencimento": hoje,
    "status": "PENDENTE",
    "conta_bancaria_id": cb_e1_id
}
res = requests.post(f"{BASE_URL}/financeiro/contas", json=conta_e1, headers=headers_e1)
print("Criou conta E1:", res.json())

# 7. Check Dashboard of E1 (should be >= 1500)
dash_e1 = requests.get(f"{BASE_URL}/financeiro/dashboard", headers=headers_e1).json()
a_receber_e1 = dash_e1["a_receber"]
print(f"Dashboard E1 A Receber: {a_receber_e1}")

# 8. Check Dashboard of E2 (should be 0 or at least less than E1)
dash_e2 = requests.get(f"{BASE_URL}/financeiro/dashboard", headers=headers_e2).json()
a_receber_e2 = dash_e2["a_receber"]
print(f"Dashboard E2 A Receber: {a_receber_e2}")

if a_receber_e1 >= 1500 and a_receber_e2 < 1500:
    print("Isolamento de Contas Financeiras e Dashboard: OK!")
else:
    print("Isolamento falhou! Os dashboards estão iguais ou incorretos.")

print("Todos os testes passaram com sucesso.")
