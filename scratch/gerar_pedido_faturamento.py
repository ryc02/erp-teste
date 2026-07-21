import requests
import time

BASE_URL = "http://127.0.0.1:8000/api/v1"

def gerar_cnpj_valido():
    import random
    base = f"{random.randint(10000000, 99999999)}0001"
    pesos1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
    soma1 = sum(int(base[i]) * pesos1[i] for i in range(12))
    resto1 = soma1 % 11
    d1 = 0 if resto1 < 2 else 11 - resto1
    base += str(d1)
    pesos2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
    soma2 = sum(int(base[i]) * pesos2[i] for i in range(13))
    resto2 = soma2 % 11
    d2 = 0 if resto2 < 2 else 11 - resto2
    return base + str(d2)

def main():
    print("=== GERANDO PEDIDO PARA TESTE DE FATURAMENTO NO FRONTEND ===")
    
    # 1. Autenticar
    res_auth = requests.post(f"{BASE_URL}/auth/login", data={"username": "admin", "password": "admin123"})
    token = res_auth.json().get("access_token")
    headers = {"Authorization": f"Bearer {token}"}
    
    # 2. Criar Produto
    prod_payload = {
        "nome": "Produto Teste Faturamento",
        "sku": f"FATURAMENTO-{int(time.time())}",
        "descricao": "Produto para testar o painel",
        "preco_venda": 450.0,
        "ncm": "39171010",
        "categoria": "Testes",
        "unidade_medida": "UN"
    }
    prod_res = requests.post(f"{BASE_URL}/produtos", headers=headers, json=prod_payload)
    produto_id = prod_res.json().get("id") if prod_res.status_code == 200 else 1
    
    # 3. Criar Cliente
    cnpj = gerar_cnpj_valido()
    cliente_payload = {
        "nome_razao_social": "Empresa Teste Faturamento Frontend LTDA",
        "tipo": "Jurídica",
        "cpf_cnpj": cnpj,
        "cep": "01001000",
        "endereco": "Praça da Sé",
        "numero": "1",
        "bairro": "Sé",
        "cidade": "São Paulo",
        "uf": "SP",
        "email": "teste.faturamento@example.com"
    }
    cli_res = requests.post(f"{BASE_URL}/comercial/clientes", headers=headers, json=cliente_payload)
    if cli_res.status_code != 200:
        print(f"Erro ao criar cliente: {cli_res.text}")
        return
    cliente_id = cli_res.json().get("id")
    
    # 4. Criar Pedido
    pedido_payload = {
        "cliente_id": cliente_id,
        "cliente_nome": "Empresa Teste Faturamento Frontend LTDA",
        "representante_id": 1,
        "itens": [
            {
                "produto_id": produto_id,
                "quantidade": 2,
                "preco_unitario": 450.0
            }
        ],
        "frete": 50.0,
        "desconto": 0.0,
        "observacoes": "Pedido gerado via script para testar o Faturamento no Frontend.",
        "gerar_nota": True
    }
    
    ped_res = requests.post(f"{BASE_URL}/vendas/pedidos", headers=headers, json=pedido_payload)
    if ped_res.status_code == 200:
        pedido_id = ped_res.json()["id"]
        # Alterar status para APROVADO para cair na fila de faturamento
        requests.put(f"{BASE_URL}/vendas/pedidos/{pedido_id}/status", headers=headers, params={"novo_status": "APROVADO"})
        print(f"[OK] Pedido de Venda ID: {pedido_id} criado com sucesso e APROVADO!")
        print("-> Acesse o painel 'Faturamento' no Frontend para faturar este pedido.")
    else:
        print(f"Erro ao criar pedido: {ped_res.text}")

if __name__ == "__main__":
    main()
