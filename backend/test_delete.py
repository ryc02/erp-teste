import requests

BASE_URL = "http://127.0.0.1:8000/api/v1"

def testar_exclusao():
    # 1. Autenticar
    res = requests.post(f"{BASE_URL}/auth/login", data={"username": "admin", "password": "admin123"})
    if res.status_code != 200:
        print("Erro de autenticação")
        return
    token = res.json().get("access_token")
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Criar cliente
    print("\n[*] Criando cliente temporário para teste de exclusão...")
    cliente_payload = {
        "nome_razao_social": "Cliente Teste Exclusao",
        "tipo": "Física",
        "cpf_cnpj": "00000000001",
        "email": "exclusao@teste.com"
    }
    res_cli = requests.post(f"{BASE_URL}/comercial/clientes", headers=headers, json=cliente_payload)
    if res_cli.status_code != 200:
        print(f"Erro ao criar cliente: {res_cli.text}")
        return
    
    cliente_id = res_cli.json().get("id")
    print(f" -> Cliente criado com sucesso! ID: {cliente_id}")

    # 3. Excluir o cliente criado
    print(f"\n[*] Tentando excluir o cliente ID {cliente_id} (sem vínculos)...")
    res_del = requests.delete(f"{BASE_URL}/comercial/clientes/{cliente_id}", headers=headers)
    
    if res_del.status_code in [200, 204]:
        print(" -> Exclusão concluída com sucesso! (Status 200/204)")
    else:
        print(f" -> Falha ao excluir. Status: {res_del.status_code}. Erro: {res_del.text}")

    # 4. Tentar buscar o cliente excluído
    print(f"\n[*] Verificando se o cliente {cliente_id} realmente sumiu do banco...")
    res_get = requests.get(f"{BASE_URL}/comercial/clientes/{cliente_id}", headers=headers)
    if res_get.status_code == 404:
        print(" -> Perfeito! O cliente retornou 404 Not Found (não existe mais).")
    else:
        print(f" -> Ops, o cliente ainda foi encontrado ou retornou outro status: {res_get.status_code}")

if __name__ == "__main__":
    testar_exclusao()
