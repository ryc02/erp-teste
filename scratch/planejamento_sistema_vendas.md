# Planejamento Inicial - Sistema de Vendas

## 1. Estado atual do ERP

O projeto ja possui uma base parcial para o modulo de vendas:

- Modelo `PedidoVenda` e `PedidoVendaItem` em `backend/models/vendas.py`
- Campo `preco_venda` no cadastro de produtos
- Tipo de movimentacao `SAIDA_VENDA`
- Modulo `VENDAS` cadastrado na inicializacao do sistema, mas inativo

Hoje, o modulo ainda nao esta completo:

- Nao existe `backend/routers/vendas.py`
- Nao existe `backend/schemas/vendas.py`
- O frontend modular nao registra `vendas` em `frontend/core/modules.js`
- Nao existe tela `frontend/modules/vendas/`
- Nao existe cadastro estruturado de clientes

Observacao importante para o planejamento:

- O ERP possui fluxos de estoque e reservas, mas o **sistema de vendas nao deve consultar saldo no almoxarifado**
- O modulo de vendas deve atuar apenas na **emissao e gestao do pedido comercial**

## 1.1 Referencia visual e funcional recebida

As telas de referencia do AS3 indicam que o modulo comercial esperado e mais proximo de um **painel CRM/comercial** do que de uma tela isolada de pedido.

Elementos observados:

- Tela inicial com acesso por modulo `Vendas`
- Area de `Preferencias` e `Acessos Recentes`
- Entrada principal por `Painel CRM`
- Fluxo guiado por `Selecionar Cliente`
- Acoes de `Novo Cliente`
- Area comercial com `Cotacoes` e `Pedidos`
- Recursos de relacionamento como:
  - `Historico do Cliente`
  - `Agenda de Atividades`
  - `Registro de Contatos`
  - `Ver Credito do Cliente`
  - `Anexar Documento`
- Cadastro de cliente em abas:
  - `Dados Gerais`
  - `Cobranca`
  - `Vendas`
  - `Financeiro`
  - `Qualidade`
  - `Fiscal`
  - `Contatos`
  - `Locais de Entrega`
  - `Ramos`
  - `Empresas do Grupo`
  - `Credito`
  - `Logistica`

Conclusao:

- O nosso modulo `vendas` deve nascer como **Central Comercial / CRM**
- `Pedido` continua importante, mas entra como uma funcionalidade dentro da jornada do cliente
- O cadastro de clientes deixa de ser fase distante e passa a ser parte central do MVP comercial

## 2. Direcao recomendada

Recomendo iniciar por um **MVP de Central Comercial desacoplada do estoque**, sem fiscal e sem financeiro operacional no primeiro ciclo.

Esse recorte aproveita bem o que o sistema ja tem hoje:

- cadastro de produtos
- preco de venda
- estrutura modular de backend e frontend
- base inicial de `PedidoVenda` e `PedidoVendaItem`

E agora passa a refletir melhor a referencia visual recebida:

- foco no cliente
- CRM leve
- cotacao e pedido sem dependencias de almoxarifado

## 3. Objetivos do MVP

Entregar um fluxo simples, confiavel e operacional:

1. Cadastrar cliente
2. Localizar e selecionar cliente no painel CRM
3. Registrar observacoes e informacoes comerciais basicas
4. Criar cotacao
5. Converter cotacao em pedido de venda
6. Adicionar itens com quantidade e preco
7. Calcular subtotal e total
8. Emitir o pedido comercial
9. Consultar historico comercial por cliente
10. Cancelar pedido quando necessario

## 4. Escopo funcional sugerido

### Fase 1 - MVP operacional

- Painel CRM comercial
- Selecao de cliente
- Cadastro de cliente
- Lista de cotacoes
- Lista de pedidos de venda
- Inclusao e remocao de itens
- Calculo de subtotal e total
- Status do pedido:
  - `RASCUNHO`
  - `EMITIDO`
  - `CANCELADO`
- Status da cotacao:
  - `RASCUNHO`
  - `ENVIADA`
  - `CONVERTIDA`
  - `CANCELADA`
- Historico basico de acoes no pedido
- Historico basico por cliente
- Sem validacao de estoque
- Sem reserva no almoxarifado
- Sem baixa automatica de estoque

### Fase 2 - Comercial

- Tabela de preco por cliente ou categoria
- Condicao de pagamento
- Vendedor/responsavel
- Impressao ou exportacao de pedido
- Prazo de entrega
- Duplicacao de pedido
- Agenda de atividades
- Registro de contatos
- Anexos do cliente
- Consulta de credito comercial simplificada

### Fase 3 - Integracoes

- Separacao de pedido
- Integracao opcional com estoque
- Contas a receber
- Comissao
- Nota fiscal
- Romaneio e expedicao
- Indicadores comerciais no dashboard

## 5. Ajustes de modelagem recomendados

O modelo atual e util, mas pequeno para o fluxo real. Sugestao de evolucao:

### PedidoVenda

Adicionar campos:

- `numero`
- `status`
- `cliente_nome`
- `cliente_id` (fase 2)
- `valor_produtos`
- `valor_desconto`
- `valor_frete`
- `valor_total`
- `usuario_criacao`
- `usuario_emissao`
- `data_pedido`
- `data_emissao`
- `condicao_pagamento`
- `prazo_entrega`
- `vendedor_nome`
- `observacoes`

### PedidoVendaItem

Adicionar campos:

- `produto_id`
- `produto_nome_snapshot`
- `quantidade`
- `preco_unitario`
- `desconto`
- `subtotal`

### Cliente

Cliente passa a ser entidade central do modulo comercial:

- `nome_razao`
- `nome_fantasia`
- `documento`
- `tipo_pessoa`
- `inscricao_estadual`
- `telefone`
- `email`
- `endereco`
- `numero`
- `complemento`
- `bairro`
- `cidade`
- `uf`
- `cep`
- `pais`
- `situacao`
- `observacoes_comerciais`
- `ativo`

### Cotacao

Nova entidade comercial antes do pedido:

- `numero`
- `cliente_id`
- `status`
- `data_emissao`
- `validade`
- `valor_total`
- `observacoes`

## 6. Fluxo de negocio recomendado

### Criacao do pedido

1. Usuario seleciona cliente no painel CRM
2. Usuario cria pedido em `RASCUNHO`
3. Inclui itens
4. Sistema calcula total
5. Pedido pode ser salvo sem qualquer interacao com estoque

### Criacao da cotacao

1. Usuario seleciona cliente
2. Cria cotacao em `RASCUNHO`
3. Inclui itens e condicoes comerciais
4. Pode marcar como `ENVIADA`
5. Pode converter em pedido

### Conversao

1. Usuario converte cotacao em pedido
2. Sistema copia cliente, itens, totais e observacoes
3. Cotacao muda para `CONVERTIDA`

### Emissao

1. Usuario emite pedido
2. Sistema valida apenas dados obrigatorios e totais
3. Pedido muda para `EMITIDO`
4. Registrar data e usuario da emissao

### Atendimento comercial

1. Usuario consulta historico do cliente
2. Registra contatos e observacoes
3. Consulta pedidos e cotacoes anteriores

### Cancelamento

1. Se pedido estiver `RASCUNHO`, pode cancelar livremente
2. Se pedido estiver `EMITIDO`, pode cancelar conforme regra comercial
3. Cancelamento nao movimenta estoque

### Integracoes futuras

1. Estoque, separacao, faturamento fiscal e financeiro ficam fora do MVP
2. Quando necessario, o pedido de venda podera servir de origem para outros modulos

## 7. Endpoints sugeridos

### Backend

- `GET /clientes/`
- `GET /clientes/{id}`
- `POST /clientes/`
- `PUT /clientes/{id}`
- `GET /cotacoes/`
- `GET /cotacoes/{id}`
- `POST /cotacoes/`
- `PUT /cotacoes/{id}`
- `POST /cotacoes/{id}/emitir`
- `POST /cotacoes/{id}/converter-em-pedido`
- `GET /vendas/`
- `GET /vendas/{id}`
- `POST /vendas/`
- `PUT /vendas/{id}`
- `POST /vendas/{id}/emitir`
- `POST /vendas/{id}/cancelar`
- `POST /vendas/{id}/duplicar`
- `GET /vendas/dashboard/resumo`
- `GET /clientes/{id}/historico`
- `GET /clientes/{id}/pedidos`
- `GET /clientes/{id}/cotacoes`

### Schemas

Criar `backend/schemas/vendas.py` com:

- `ClienteCreate`
- `ClienteUpdate`
- `ClienteSchema`
- `CotacaoCreate`
- `CotacaoUpdate`
- `CotacaoSchema`
- `PedidoVendaCreate`
- `PedidoVendaUpdate`
- `PedidoVendaItemCreate`
- `PedidoVendaItemUpdate`
- `PedidoVendaSchema`
- `PedidoVendaListSchema`

## 8. Estrutura frontend sugerida

Registrar modulo em `frontend/core/modules.js`:

- `id: vendas`
- `folder: vendas`
- `featureGroup: VENDAS`

Criar:

- `frontend/modules/vendas/vendas.html`
- `frontend/modules/vendas/vendas.js`

Tela inicial sugerida:

- cards com resumo: clientes ativos, cotacoes abertas, pedidos emitidos
- area de preferencias / acessos recentes
- painel CRM com cliente selecionado
- atalhos para:
  - novo cliente
  - cotacoes
  - pedidos
  - historico
  - contatos
- filtro por cliente, status e data
- tabela de cotacoes
- tabela de pedidos
- formulario de cliente em abas
- formulario de pedido com grade de itens

## 9. Regras importantes

- Nao permitir emitir pedido sem itens
- Nao consultar saldo do almoxarifado no fluxo de vendas
- Nao criar reservas de estoque no fluxo de vendas
- Nao permitir editar itens apos emissao, salvo se a regra comercial permitir reabertura
- Salvar snapshot basico do nome do produto no item
- Recalcular totais sempre no backend
- Numeracao de pedido deve ser controlada no backend
- Cliente deve ser entidade obrigatoria para pedido e cotacao
- Cadastro do cliente deve aceitar expansao por abas sem obrigar tudo no MVP

## 10. Dependencias tecnicas

Antes da implementacao, vale alinhar:

- Se o cliente ja nasce com cadastro proprio no MVP
- Se o pedido tera numeracao automatica
- Se a cotacao entra no MVP 1 ou logo na sprint 2
- Se a emissao gera PDF/impressao ja no MVP
- Se pedido emitido pode voltar para `RASCUNHO`

## 11. Ordem de implementacao recomendada

### Sprint 1

- Criar schemas de vendas
- Criar schemas de clientes
- Criar schemas de cotacoes
- Criar router de vendas
- Criar router de clientes
- Criar router de cotacoes
- Implementar CRUD basico
- Implementar emissao e cancelamento
- Implementar numeracao e calculo de totais

### Sprint 2

- Criar modulo `vendas` no frontend
- Criar painel CRM
- Criar listagem de clientes
- Criar formulario de cliente
- Criar listagem de cotacoes
- Criar listagem de pedidos
- Criar formulario de pedido
- Inclusao de itens usando catalogo de produtos
- Acoes de emitir, duplicar e cancelar

### Sprint 3

- Dashboard comercial simples
- Filtros e busca
- Ajustes de permissao
- Auditoria de acoes do pedido
- Impressao ou exportacao
- Preferencias e acessos recentes

## 12. Primeira entrega recomendada

Se quisermos avancar de forma segura, a primeira entrega deve ser:

**"Central comercial com cadastro de cliente, painel CRM basico e pedido comercial desacoplado do estoque"**

Esse corte ja gera valor operacional e fica muito mais proximo do fluxo visto nas telas de referencia, sem misturar vendas com estoque e sem tentar cobrir toda a complexidade fiscal/financeira logo no inicio.
