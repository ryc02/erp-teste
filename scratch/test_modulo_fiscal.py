import requests
import json
import time

BASE_URL = "http://127.0.0.1:8000/api/v1"

def gerar_cnpj_valido():
    import random
    base = f"{random.randint(10000000, 99999999)}0001"
    pesos1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
    soma1 = sum(int(base[i]) * pesos1[i] for i in range(12))
    resto1 = soma1 % 11
    dv1 = 0 if resto1 < 2 else 11 - resto1
    
    base += str(dv1)
    
    pesos2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
    soma2 = sum(int(base[i]) * pesos2[i] for i in range(13))
    resto2 = soma2 % 11
    dv2 = 0 if resto2 < 2 else 11 - resto2
    
    return base + str(dv2)

def main():
    print("=== INICIANDO TESTE DO MODULO FISCAL ===")
    
    # 1. Autenticação
    print("\n1. Autenticando...")
    res_auth = requests.post(f"{BASE_URL}/auth/login", data={
        "username": "admin",
        "password": "admin123"
    })
    if res_auth.status_code != 200:
        print("Falha na autenticacao!")
        return
    token = res_auth.json().get("access_token")
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    print("[OK] Autenticado com sucesso!")

    # 2. Criar Produto Temporário (para ter NCM)
    print("\n2. Criando produto temporario...")
    prod_payload = {
        "nome": "Produto Teste Fiscal",
        "sku": f"FISCAL-{int(time.time())}",
        "descricao": "Produto Teste Fiscal",
        "preco_venda": 150.0,
        "ncm": "39171010",
        "categoria": "Testes",
        "unidade_medida": "UN"
    }
    prod_res = requests.post(f"{BASE_URL}/produtos", headers=headers, json=prod_payload)
    if prod_res.status_code == 200:
        produto_id = prod_res.json().get("id", 1)
        print(f"[OK] Produto criado (ID: {produto_id})")
    else:
        # Pega qualquer produto se falhar
        prods = requests.get(f"{BASE_URL}/produtos", headers=headers).json()
        produto_id = prods[0]["id"] if prods else 1
        print(f"[AVISO] Usando produto existente (ID: {produto_id}) (Erro na criacao: {prod_res.text})")

    # 3. Criar Cliente Válido (Com CNPJ e Endereço)
    print("\n3. Criando cliente para emissao de NF...")
    cnpj_valido = gerar_cnpj_valido()
    cli_payload = {
        "nome_razao_social": "Empresa Teste Fiscal LTDA",
        "tipo": "Jurídica",
        "cpf_cnpj": cnpj_valido,
        "email": "fiscal@empresa.com",
        "endereco": "Rua das Flores",
        "numero": "123",
        "cidade": "São Paulo",
        "uf": "SP",
        "cep": "01001000"
    }
    cli_res = requests.post(f"{BASE_URL}/comercial/clientes", headers=headers, json=cli_payload)
    if cli_res.status_code == 200:
        cliente_id = cli_res.json().get("id")
        print(f"[OK] Cliente criado (ID: {cliente_id}, CNPJ: {cnpj_valido})")
    else:
        print("Erro ao criar cliente:", cli_res.text)
        return

    # 4. Criar Pedido de Venda
    print("\n4. Criando pedido de venda...")
    pedido_payload = {
        "tipo": "PEDIDO",
        "cliente_id": cliente_id,
        "cliente_nome": "Empresa Teste Fiscal LTDA",
        "valor_frete": 20.0,
        "desconto_valor": 0.0,
        "itens": [
            {
                "produto_id": produto_id,
                "quantidade": 2,
                "preco_unitario": 150.0
            }
        ]
    }
    ped_res = requests.post(f"{BASE_URL}/vendas/pedidos", headers=headers, json=pedido_payload)
    if ped_res.status_code == 200:
        pedido_id = ped_res.json().get("id")
        print(f"[OK] Pedido criado (ID: {pedido_id})")
    else:
        print("Erro ao criar pedido:", ped_res.text)
        return

    # 5. Preparar Faturamento (Malha Fina)
    print("\n5. Preparando faturamento (Malha Fina)...")
    prep_res = requests.get(f"{BASE_URL}/fiscal/preparar-faturamento/{pedido_id}", headers=headers)
    if prep_res.status_code == 200:
        rascunho = prep_res.json()
        print(f"[OK] Rascunho gerado. Pode faturar? {rascunho['pode_faturar']}")
        if not rascunho['pode_faturar']:
            print("Erros de validacao:", rascunho['erros_validacao'])
            return
    else:
        print("Erro preparar faturamento:", prep_res.text)
        return

    # Completando dados que a tela adicionaria
    rascunho["cliente"]["cpf_cnpj"] = cnpj_valido
    rascunho["cliente"]["cep"] = "01001000"
    rascunho["cliente"]["numero"] = "123"

    # 6. Emitir NF Nativamente
    print("\n6. Emitindo NF...")
    emit_res = requests.post(f"{BASE_URL}/fiscal/emitir", headers=headers, json=rascunho)
    if emit_res.status_code == 200:
        nota_id = emit_res.json().get("nota_id")
        print(f"[OK] Nota salva nativamente (ID: {nota_id})")
    else:
        print("Erro ao emitir NF:", emit_res.text)
        return

    # 7. Enviar Lote para SEFAZ (Simulado)
    print("\n7. Enviando Lote (Simulacao Olist)...")
    lote_res = requests.post(f"{BASE_URL}/fiscal/enviar-lote", headers=headers, json={"notas": [nota_id]})
    print("[OK] Resposta Lote:", lote_res.json())

    # 8. Listar Notas (Painel Fiscal)
    print("\n8. Listando Notas (Painel)...")
    notas_res = requests.get(f"{BASE_URL}/fiscal/notas", headers=headers)
    if notas_res.status_code == 200:
        notas = notas_res.json()
        print(f"[OK] Encontradas {len(notas)} notas. Ultimas:")
        for n in notas[:2]:
            print(f"  - NF ID {n['id']} | Cliente: {n['destinatario']} | Valor: R$ {n['valor']} | Status: {n['status']}")
    
    # 9. Simular Rejeição (Trava anti bloqueio SEFAZ)
    print("\n9. Simulando Rejeicao SEFAZ...")
    rej_res = requests.post(f"{BASE_URL}/fiscal/simular-rejeicao/{nota_id}", headers=headers)
    if rej_res.status_code == 200:
        print("[OK] Rejeicao simulada com sucesso.")
        
    # Validando se a nota foi marcada como rejeitada
    notas_res = requests.get(f"{BASE_URL}/fiscal/notas", headers=headers)
    nota_rejeitada = next((n for n in notas_res.json() if n["id"] == nota_id), None)
    if nota_rejeitada:
        print(f"[OK] Status atualizado: {nota_rejeitada['status']}")
        
    print("\n=== TESTE CONCLUIDO COM SUCESSO! ===")

if __name__ == "__main__":
    main()
