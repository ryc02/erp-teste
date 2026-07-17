# 📘 Manual do Usuário - ERP Venner v2.0

Bem-vindo ao **ERP Venner**, seu sistema integrado de gestão industrial local-first. Este manual guiará você pelas principais funcionalidades do sistema.

---

## 🚀 1. Dashboard (Painel de Controle)
O Dashboard é a sua visão 360º da fábrica. 
- **Total de Produtos**: Quantidade de itens cadastrados.
- **Alertas de Estoque**: Itens que estão abaixo do nível mínimo.
- **Movimentações Hoje**: Contador de entradas e saídas realizadas no dia.
- **Últimas Movimentações**: Tabela rápida com o histórico recente.

---

## 📦 2. Gestão de Estoque (Produtos)
Nesta aba, você gerencia o cadastro físico e lógico dos materiais.

### 2.1 Cadastrar/Editar Produto
- Clique em **"Novo Produto"** ou no ícone de **Lápis** para editar.
- **SKU**: Código interno da peça.
- **Localização**: Defina o Corredor, Prateleira e Posição para facilitar a busca física.
- **Níveis de Estoque**:
    - **Mínimo**: O sistema avisa quando atingir este valor.
    - **Máximo**: Usado para calcular sugestões de compra.
- **Unidade**: Aceita decimais (ex: 0,5 KM).

### 2.2 Lançar Movimentações
Clique no ícone de **Setas (↔️)** na linha do produto:
- **Entrada**: Compras ou Devoluções.
- **Saída**: Vendas ou Consumo Interno.
- **Ajuste**: Correção manual de saldo (requer justificativa).

---

## 📋 3. Módulo de Inventário
O inventário serve para auditar o estoque real contra o estoque do sistema.

1. **Iniciar Inventário**: Bloqueia todas as outras movimentações do sistema para garantir precisão.
2. **Contagem**: Insira a quantidade física encontrada na prateleira. O sistema calcula a diferença em tempo real.
3. **Finalizar**: O sistema gera automaticamente ajustes de estoque para igualar o saldo do sistema à sua contagem física.

---

## 🛠️ 4. Manutenção Industrial
Gerencie seu parque de máquinas e evite paradas não planejadas.

### 4.1 Parque de Máquinas
- Cadastre suas injetoras, prensas e compressores.
- Acompanhe o status: **OPERANTE** ou **EM MANUTENÇÃO**.

### 4.2 Ordens de Serviço (OS)
- **Abertura**: Registre o problema e o tipo (Preventiva ou Corretiva).
- **Consumo de Peças**: Ao adicionar uma peça a uma OS, o sistema **dá baixa automática no estoque** e contabiliza o custo na manutenção.
- **Finalização**: Registre a conclusão do serviço para liberar a máquina.

---

## 📊 5. Relatórios e Compras
Focado em inteligência de suprimentos.
- **Sugestão de Reposição**: Lista automática de tudo o que precisa ser comprado para atingir o estoque máximo.
- **Exportar CSV**: Gere uma planilha com o saldo atual e localizações para conferência rápida.

---

## 💡 Dicas Importantes
- **Tratamento de Números**: Você pode usar **vírgula** ou **ponto** para valores decimais (ex: `10,5`).
- **Navegação**: Use o menu lateral para alternar entre as visões. Se a página parecer "antiga", use **Ctrl+F5**.
- **Acesso em Rede**: O sistema pode ser acessado por outros PCs da fábrica através do IP do servidor (ex: `http://192.168.1.252:8000`).

---
*Manual gerado em 24/04/2026 para ERP Venner v2.0 PRO.*
