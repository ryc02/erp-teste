import re

def validar_cnpj(cnpj: str) -> bool:
    """
    Valida CNPJ suportando o novo formato alfanumérico (2026).
    Regra: [A-Z0-9]{12}[0-9]{2} e Módulo 11.
    """
    if not cnpj:
        return False
        
    # Remove formatações
    cnpj = re.sub(r'[^A-Z0-9]', '', str(cnpj).upper())
    
    if len(cnpj) != 14:
        return False
        
    # Verifica a estrutura via regex
    if not re.match(r'^[A-Z0-9]{12}[0-9]{2}$', cnpj):
        return False
        
    # O cálculo real do DV alfanumérico converte letras para valores ascii 
    # (A=10, B=11... conforme a RFB) para o Módulo 11.
    # Por simplicidade da implementação:
    def char_to_val(c: str) -> int:
        if c.isdigit():
            return int(c)
        return ord(c) - ord('A') + 10

    # Cálculo DV1
    pesos1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
    soma1 = sum(char_to_val(cnpj[i]) * pesos1[i] for i in range(12))
    resto1 = soma1 % 11
    dv1 = 0 if resto1 < 2 else 11 - resto1
    
    if int(cnpj[12]) != dv1:
        return False
        
    # Cálculo DV2
    pesos2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
    soma2 = sum(char_to_val(cnpj[i]) * pesos2[i] for i in range(12)) + (dv1 * 2)
    resto2 = soma2 % 11
    dv2 = 0 if resto2 < 2 else 11 - resto2
    
    if int(cnpj[13]) != dv2:
        return False
        
    return True


def validar_cep(cep: str) -> bool:
    """
    Valida CEP: deve ter exatamente 8 dígitos.
    """
    if not cep:
        return False
    cep = re.sub(r'[^0-9]', '', str(cep))
    return len(cep) == 8


def validar_numero_imovel(numero: str) -> str:
    """
    Valida o número do imóvel. Retorna o número sanitizado.
    Não pode ser nulo/vazio. Se não tiver número, retorna "SN".
    """
    if not numero or str(numero).strip() == "":
        return "SN"
    
    numero = str(numero).strip().upper()
    if numero in ["0", "S/N", "SEM NÚMERO", "SEM NUMERO"]:
        return "SN"
        
    return numero
