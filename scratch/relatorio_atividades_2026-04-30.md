# Relatório de Atividades - 30/04/2026

## Resumo do dia

Hoje foi estruturada e evoluída a base do módulo comercial/cadastros, mantendo a proposta de separar o comercial do fluxo de estoque e almoxarifado.

## Entregas realizadas

### 1. Estrutura comercial separada
- Consolidação do domínio comercial em pasta própria no backend.
- Consolidação do shell comercial em pasta própria no frontend.
- Manutenção do acesso separado para o comercial em `/comercial/index.html`.

### 2. Cadastro de clientes
- Implementação e evolução do cadastro de clientes comerciais.
- Organização da tela por abas:
  - Dados Gerais
  - Contato
  - Endereço
  - Cobrança
  - Entrega
  - Vendas
- Inclusão de suporte para:
  - Pessoa Jurídica
  - Pessoa Física
- Para pessoa física:
  - uso de `CPF`
  - uso de `RG`
  - cadastro manual, sem consulta automática à Receita

### 3. Consulta e preenchimento automático
- Consulta automática de `CNPJ` com preenchimento dos campos do cliente.
- Busca automática de `CEP` para:
  - endereço principal
  - cobrança
  - entrega

### 4. Comercial e vínculos do cliente
- Inclusão de vínculo do cliente com representante principal.
- Definição do representante padrão `código 1 = DIRETO`.
- Inclusão de campo para `nome do vendedor interno`.
- Inclusão de seleção de:
  - representante
  - forma de pagamento
  - condição de pagamento

### 5. Cadastros auxiliares sem criar excesso de telas
- Estruturação dos cadastros auxiliares dentro do próprio módulo de clientes, via modais:
  - Representantes
  - Formas de Pagamento
  - Condições de Pagamento
- Condições de pagamento com:
  - código
  - descrição
  - índice financeiro
  - base de cálculo
  - número de parcelas
  - parcelas por dias ou datas

### 6. Cobrança e entrega
- Inclusão de aba de cobrança com campos próprios:
  - CEP
  - endereço
  - número
  - complemento
  - bairro
  - UF
  - município
  - CNPJ
  - inscrição estadual
  - e-mail
- Inclusão de aba de entrega com endereço separado do principal.

### 7. Situação, inativação e exclusão de cliente
- Uso de `Ativo/Inativo` no cadastro.
- Inclusão de ações na lista de clientes:
  - editar
  - inativar/reativar
  - excluir
- Exclusão protegida no backend:
  - só ocorre quando não houver vínculos por chave estrangeira
  - preparada para bloquear exclusão quando pedidos/cotações ou outras dependências forem adicionados

### 8. Isolamento entre comercial e estoque
- Confirmação de que comercial e estoque usam o mesmo banco, sem conflito técnico de conexão.
- Reforço da separação lógica de acesso.
- Endurecimento das permissões para impedir que o perfil `COMERCIAL` acesse rotas de estoque:
  - dashboard
  - movimentações
  - reservas
  - inventário
- Bloqueio já existente mantido no catálogo geral de produtos, forçando uso do catálogo comercial.

### 9. Ajustes de usabilidade
- Ajuste visual do botão `Consultar Dados R.F.B.`:
  - para pessoa jurídica continua ativo
  - para pessoa física aparece como `Cadastro Manual`
  - estado desabilitado ficou visualmente claro

## Arquivos principais alterados

### Backend
- `backend/main.py`
- `backend/database.py`
- `backend/comercial/router.py`
- `backend/comercial/models/cliente.py`
- `backend/comercial/models/representante.py`
- `backend/comercial/models/pagamento.py`
- `backend/comercial/schemas/cliente.py`
- `backend/comercial/schemas/representante.py`
- `backend/comercial/schemas/pagamento.py`
- `backend/comercial/services/cliente_service.py`
- `backend/comercial/services/representante_service.py`
- `backend/comercial/services/pagamento_service.py`
- `backend/comercial/services/cnpj_service.py`
- `backend/comercial/services/cpf_service.py`
- `backend/routers/produtos.py`
- `backend/routers/dashboard.py`
- `backend/routers/movimentacoes.py`
- `backend/routers/reservas.py`
- `backend/routers/inventario.py`

### Frontend
- `frontend/comercial/index.html`
- `frontend/comercial/core/modules.js`
- `frontend/comercial/modules/clientes/clientes.html`
- `frontend/comercial/modules/clientes/clientes.js`
- `frontend/style.css`

### Distribuição / apoio
- `cliente_vendas.py`
- `gerar_executaveis.bat`
- `scratch/planejamento_sistema_vendas.md`

## Validações executadas

- Compilação sintática de arquivos Python com `py_compile`.
- Importação do `main` para validar subida da aplicação.
- Reinicializações do servidor local para aplicar as novas rotas.
- Verificação do `openapi.json` e `docs`.
- Testes funcionais de:
  - criação de cliente
  - inativação de cliente
  - exclusão de cliente

## Decisões de negócio registradas

- O módulo de vendas/comercial não consulta estoque do almoxarifado no cadastro comercial.
- Pessoa física será cadastrada manualmente.
- O representante vinculado ao cliente representa quem trouxe o cliente.
- Venda direta usa o representante padrão `DIRETO`.
- Evitar excesso de telas: priorização de modais auxiliares no lugar de novos módulos no menu.

## Pendências naturais para a próxima etapa

- Evoluir o módulo comercial para pedidos/cotações.
- Criar validações futuras de exclusão quando existirem pedidos e históricos vinculados.
- Revisar outras rotas autenticadas do ERP para garantir isolamento completo entre comercial e estoque.
- Refinar permissões por perfil, se necessário.
