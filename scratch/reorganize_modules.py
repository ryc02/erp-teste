import os
import re

modules_file = r"d:\ERP Venner\frontend\core\modules.js"

with open(modules_file, "r", encoding="utf-8") as f:
    content = f.read()

# Mapeamentos customizados: module_id -> novo grupo
mapping = {
    'dashboard': 'INICIO',
    'compras': 'SUPRIMENTOS',
    'vendas': 'VENDAS',
    'pedidos_venda': 'VENDAS',
    'resultados_comerciais': 'VENDAS',
    'clientes': 'CADASTROS',
    'propostas': 'VENDAS',
    'financeiro': 'FINANCAS',
    'relatorios_financeiros': 'FINANCAS',
    'cobrancas_bancarias': 'FINANCAS',
    'produtos': 'CADASTROS',
    'reservas': 'CADASTROS',
    'expedicao_painel': 'SUPRIMENTOS',
    'separacao': 'SUPRIMENTOS',
    # Configuracoes
    'configuracoes_vendas': 'CONFIGURACOES',
    'expedicao_configuracoes': 'CONFIGURACOES',
    'configuracoes_financeiras': 'CONFIGURACOES',
    'configuracoes_produtos': 'CONFIGURACOES',
}

# The regex will find each module block: module_id: { ... }
# Then we replace its featureGroup
for mod_id, new_group in mapping.items():
    # Encontrar a definicao do modulo
    pattern = r"({}:\s*\{{.*?featureGroup:\s*')([^']+)'".format(mod_id)
    content = re.sub(pattern, r"\g<1>{new_group}'".format(new_group=new_group), content, flags=re.DOTALL)

# For any module that we didn't explicitly map but currently has CORE, ESTOQUE, etc:
content = content.replace("featureGroup: 'ESTOQUE'", "featureGroup: 'SUPRIMENTOS'")
content = content.replace("featureGroup: 'LOGISTICA'", "featureGroup: 'SUPRIMENTOS'")
content = content.replace("featureGroup: 'COMERCIAL'", "featureGroup: 'VENDAS'")
content = content.replace("featureGroup: 'CORE'", "featureGroup: 'CADASTROS'")
content = content.replace("featureGroup: 'PRODUCAO'", "featureGroup: 'SERVICOS'")

with open(modules_file, "w", encoding="utf-8") as f:
    f.write(content)
    
print("Modules categorizados.")
