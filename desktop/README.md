# Venner Desktop

Este diretório contém o scaffold inicial da suíte desktop inspirada no AS3,
mas construída sobre o backend e frontend atuais do ERP Venner.

## Objetivo

- Reaproveitar FastAPI + frontend HTML/JS já existentes.
- Entregar executáveis por módulo no estilo suíte Windows.
- Remover a dependência do navegador visível para o usuário final.
- Preparar uma base para Hub, módulos e Agent local.

## Entradas disponíveis

- `venner_hub.py`: launcher nativo da suíte com configuração visual.
- `venner_vendas.py`: janela isolada para o módulo comercial/vendas.
- `venner_agent.py`: serviço local do Agent com rotas de `health/status`.

## Configuração local

Os launchers usam `%APPDATA%\VennerERP\config.json` como configuração principal.

Compatibilidade com o fluxo atual:

- Se `config.json` não existir, o launcher tenta reaproveitar `servidor.txt`
  ao lado do executável.
- Ao salvar pelo Hub, o `servidor.txt` também é atualizado para manter
  compatibilidade com os launchers legados.
- Se também não existir, usa `127.0.0.1:8000`.

Campos adicionais já suportados:

- `last_username`
- `agent_host`
- `agent_port`
- `label_printer_host`
- `label_printer_port`
- `update_source`
- `update_channel`
- `auto_start_agent`

## Dependências

O modo desktop foi pensado para usar `pywebview` no Windows quando a versão do
Python for compatível.

No ambiente atual com Python 3.14, o launcher usa fallback automático para
janela em modo app do Edge/Chrome quando `pywebview` não estiver disponível.
Isso mantém a experiência desktop utilizável sem bloquear a operação.

Instalação sugerida:

```powershell
pip install -r desktop\requirements.txt
```

Observação:

- Em Python `< 3.14`, o `pywebview` é instalado automaticamente pelo arquivo
  de requisitos.
- Em Python `3.14+`, o requisito é ignorado e o fallback de navegador em modo
  app assume o papel de shell desktop.

## Execução

```powershell
python desktop\venner_hub.py
python desktop\venner_vendas.py
python desktop\venner_agent.py
```

Validação sem abrir janela gráfica:

```powershell
$env:VENNER_DESKTOP_DRY_RUN='1'
python desktop\venner_vendas.py
```

Inspeção do Agent sem manter o serviço aberto:

```powershell
python desktop\venner_agent.py --print-status
```

## Agent local

O `Venner Agent` expõe uma bridge HTTP local em `http://127.0.0.1:18777`
por padrão, com rotas:

- `GET /health`
- `GET /status`
- `GET /capabilities`
- `POST /actions/ping`
- `POST /actions/open-url`
- `POST /actions/print-url`
- `POST /actions/open-document`
- `POST /actions/print-document`
- `POST /actions/print-zpl`

O Hub já consegue:

- autenticar uma sessão central no backend
- abrir módulos com bootstrap automático de token via `login.html`
- iniciar o Agent em background
- validar o health check
- exibir as capacidades atuais do bridge local
- consultar manifesto de update via arquivo local, pasta de rede ou URL HTTP
- preparar a troca local de binários da suíte quando estiver rodando pelo `.exe`

Uso atual da primeira bridge concreta:

- etiquetas de produto abertas pelo módulo de estoque
- PDFs de ordem de produção abertos por PCP e relatórios

Uso atual da bridge de documentos:

- PDFs autenticados baixados para cache local do Agent e abertos pelo app padrão do Windows
- impressão de PDFs via associação local do Windows, sem depender de aba visível
- fallback automático para `open-url` e `print-url` quando o Agent local ainda estiver em versão antiga

Uso atual da bridge de etiqueta:

- `print-zpl` envia ZPL bruto para impressora de rede configurada no Hub usando TCP `9100`
- fallback automático para a visualização HTML com `window.print()` quando a Zebra/ZPL não estiver configurada ou responder com erro

Uso atual da bridge de impressão HTML:

- impressão de etiquetas via URL HTML com `window.print()` e `--kiosk-printing`

## Atualização da suíte

O Hub agora suporta um manifesto simples de atualização desktop. A fonte pode
ser um caminho local, UNC de rede ou uma URL HTTP/HTTPS apontando para um
`manifest.json`.

Formato esperado:

```json
{
  "channel": "stable",
  "release_name": "Venner Desktop 2026.05.07.2",
  "latest_version": "2026.05.07.2",
  "published_at": "2026-05-07T13:30:00",
  "notes": "Hub com login central, bridge local e updater.",
  "package_path": "./2026.05.07.2/VennerSuite-2026.05.07.2.zip",
  "package_sha256": "..."
}
```

Comportamento atual:

- o Hub compara `latest_version` com a versão local da suíte
- se houver update, baixa ou copia o `.zip` para `%APPDATA%\VennerERP\updates`
- a aplicação do update é liberada apenas no executável empacotado
- o pacote precisa conter `Venner_Hub.exe`, `Venner_Vendas.exe`,
  `Venner_Agent.exe`, `ERP_Venner_Servidor.exe` e `VennerSuite.version.json`

## Build dos executáveis

```powershell
.\gerar_executaveis_desktop.bat
```

Esse fluxo agora também:

- gera o `ERP_Venner_Servidor.exe`
- monta `releases\desktop\<versao>\VennerSuite-<versao>.zip`
- atualiza `releases\desktop\manifest.json`

Geração manual da release:

```powershell
python desktop\build_desktop_release.py
```

## Próximos passos

1. Substituir os launchers atuais por estes entrypoints.
2. Fechar o ciclo de instalação inicial da suíte em cada estação.
3. Expandir a bridge desktop para salvar arquivos, serial e impressoras térmicas/ZPL.
4. Substituir o fallback de navegador por `pywebview` em runtime compatível.
