# Arquitetura Desktop Venner Inspirada no AS3

## Resumo

O objetivo e reproduzir a experiencia de suite Windows observada em
`\\jmfindserver\INCOSYSTEM2\INCOSYSTEM\AS3`, mas mantendo o backend central e
o frontend atual do ERP Venner.

Em vez de navegador + URL exposta ao usuario, teremos:

- `Venner Hub.exe` para o sistema integrado.
- `Venner Vendas.exe` para a central comercial.
- `Venner Agent.exe` para integracoes locais.
- API central em `backend/main.py`.

## O que copiar do AS3

- Estrutura de suite modular por executavel.
- Pasta de configuracao separada da logica de negocio.
- Pasta de updates dedicada.
- Operacao orientada por modulo e por setor.
- Material de help/manual por area.

## O que NAO copiar do AS3

- Cliente falando direto com Oracle.
- `tnsnames.ora`, DLL de banco e schema expostos em cada estacao.
- Regra de negocio distribuida nos modulos cliente.
- Execucao principal a partir de pasta de rede.

## Mapeamento do projeto atual

### Base que ja existe

- Backend HTTP/API: `backend/main.py`
- Shell integrado: `frontend/index.html`
- Shell comercial: `frontend/comercial/index.html`
- Login comum: `frontend/login.html`
- Launcher web atual: `cliente_desktop.py`
- Launcher comercial atual: `cliente_vendas.py`

### Nova camada desktop

- `desktop/venner_hub.py`
- `desktop/venner_vendas.py`
- `desktop/venner_agent.py`
- `desktop/venner_desktop/config.py`
- `desktop/venner_desktop/runtime.py`

## Estrutura alvo da suite

```text
VennerSuite/
  Hub/
    Venner_Hub.exe
  Modules/
    Venner_Vendas.exe
    Venner_Estoque.exe
    Venner_PCP.exe
  Agent/
    Venner_Agent.exe
  Config/
    appsettings.json
    profiles/
  Updates/
    2026-05-07/
  Help/
    Vendas.pdf
    Estoque.pdf
  Logs/
  Cache/
```

## Papel de cada componente

### Venner Hub

Responsabilidades:

- abrir `login.html?target=/index.html`
- manter configuracao local da estacao
- exibir shell integrado
- disparar abertura de modulos dedicados
- servir como ponto de atualizacao do desktop

### Venner Vendas

Responsabilidades:

- abrir `login.html?target=/comercial/index.html`
- operar como janela dedicada para equipe comercial
- receber futuramente comandos do Agent para impressao e arquivos

### Venner Agent

Responsabilidades futuras:

- impressao ZPL/PDF
- balanca ou serial
- exportacao de arquivos
- watchers de pasta
- bridge local entre JS e recursos do Windows

Estado atual do scaffold:

- servico HTTP local para `health`, `status` e `capabilities`
- bootstrap em background a partir do Hub
- porta local dedicada configurada por estacao
- primeira action concreta: `open-url` para documentos do ERP
- primeira action de impressao: `print-url` para etiquetas HTML do ERP
- login central do Hub com repasse de sessao para os modulos
- bridge de documentos/PDF e impressao ZPL de rede via Agent
- checagem de update por manifesto e pacote versionado `.zip`

## Configuracao local

Padrao adotado no scaffold:

- arquivo principal: `%APPDATA%\VennerERP\config.json`
- compatibilidade retroativa com `servidor.txt`

Campos previstos:

```json
{
  "server_host": "127.0.0.1",
  "server_port": 8000,
  "use_https": false,
  "agent_host": "127.0.0.1",
  "agent_port": 18777,
  "auto_start_agent": true,
  "last_module": "hub"
}
```

## Fluxo de autenticacao

1. O launcher abre a URL de login do modulo.
2. O login continua usando `POST /api/v1/auth/login`.
3. O frontend armazena `access_token` em `sessionStorage`.
4. O shell do modulo usa o token nas chamadas subsequentes.

Observacao:

- no curto prazo, cada janela tem a propria sessao webview
- no medio prazo, o Hub deve centralizar autenticacao e repassar sessao para
  os modulos via bridge segura

## Estrategia de rollout

### Fase 1

- introduzir launchers desktop sem alterar backend/frontend
- manter o sistema web funcionando como esta
- validar `Venner_Vendas.exe` como piloto
- usar Edge/Chrome em modo app como fallback de shell desktop quando o runtime
  embutido nao estiver disponivel

### Fase 2

- adicionar configuracao visual de servidor/empresa no Hub
- criar canal de comunicacao Hub <-> modulo
- implementar `Venner Agent`
- expor bridge local com status e capacidades

### Fase 3

- impressao nativa e integracoes locais
- atualizacao automatica por versao
- substituir launchers legados por executaveis desktop

Status atual:

- impressao ZPL/PDF ja entrou no Agent
- atualizacao por manifesto e staging local ja entrou no Hub
- ainda falta instalacao inicial e rollout operacional nas estacoes

## Build

Specs adicionados:

- `Venner_Hub.spec`
- `Venner_Vendas_Desktop.spec`
- `Venner_Agent.spec`

## Decisao recomendada

Seguir com desktop shell sobre o frontend atual e backend central.

Isso entrega a experiencia "AS3-like" para o usuario, sem perder a
manutenibilidade do stack atual.
