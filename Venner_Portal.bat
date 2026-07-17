@echo off
setlocal
title Venner ERP - Portal de Inicializacao
echo ==========================================
echo       INICIANDO SUITE ERP VENNER
echo ==========================================

echo [1/3] Verificando Servidor Backend...
:: Tenta dar um ping na porta 8000
powershell -Command "try { $socket = New-Object System.Net.Sockets.TcpClient('127.0.0.1', 8000); $socket.Close(); echo 'Servidor ja esta rodando.' } catch { echo 'Iniciando servidor local...'; Start-Process python -ArgumentList 'backend\main.py' -WindowStyle Hidden }"

echo [2/3] Verificando Venner Agent...
:: Inicia o agent em background
start /b python desktop\venner_agent.py

echo [3/3] Abrindo Venner Hub...
python desktop\venner_hub.py

echo Suite encerrada.
timeout /t 3
