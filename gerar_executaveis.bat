@echo off
setlocal
title ERP Venner - Gerador de Executaveis

set "SCRIPT_DIR=%~dp0"

pushd "%SCRIPT_DIR%" >nul 2>&1
if errorlevel 1 (
    echo ERRO: nao foi possivel acessar a pasta do projeto:
    echo %SCRIPT_DIR%
    if not defined NO_PAUSE pause
    exit /b 1
)

echo ==========================================
echo    GERANDO EXECUTAVEIS DO ERP VENNER
echo ==========================================
echo Pasta do projeto: %CD%
echo.

if not exist "backend\requirements.txt" (
    echo ERRO: arquivo backend\requirements.txt nao encontrado.
    popd
    if not defined NO_PAUSE pause
    exit /b 1
)

echo [1/4] Instalando ferramentas de build...
python -m pip install pyinstaller -r "backend\requirements.txt"
if errorlevel 1 (
    echo ERRO: falha ao instalar dependencias de build.
    popd
    if not defined NO_PAUSE pause
    exit /b 1
)

echo.
echo [2/4] Gerando CLIENTE EXE (Para os usuarios)...
python -m PyInstaller "ERP_Venner_Cliente.spec" --noconfirm
if errorlevel 1 (
    echo ERRO: falha ao gerar ERP_Venner_Cliente.exe
    popd
    if not defined NO_PAUSE pause
    exit /b 1
)

echo.
echo [3/4] Gerando VENDAS EXE (Equipe Comercial)...
python -m PyInstaller "ERP_Venner_Vendas.spec" --noconfirm
if errorlevel 1 (
    echo ERRO: falha ao gerar ERP_Venner_Vendas.exe
    popd
    if not defined NO_PAUSE pause
    exit /b 1
)

echo.
echo [4/4] Gerando SERVIDOR EXE (Para o Servidor)...
pushd "backend" >nul 2>&1
if errorlevel 1 (
    echo ERRO: nao foi possivel entrar na pasta backend.
    popd
    if not defined NO_PAUSE pause
    exit /b 1
)

python -m PyInstaller "ERP_Venner_Servidor.spec" --noconfirm
if errorlevel 1 (
    echo ERRO: falha ao gerar ERP_Venner_Servidor.exe
    popd
    popd
    if not defined NO_PAUSE pause
    exit /b 1
)

popd

echo.
echo ==========================================
echo   CONCLUIDO! Verifique as pastas:
echo   - dist
echo   - backend\dist
echo ==========================================

popd
if not defined NO_PAUSE pause
