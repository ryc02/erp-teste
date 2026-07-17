@echo off
setlocal
title Venner Desktop - Build
echo ==========================================
echo         VENNER DESKTOP SUITE BUILD
echo ==========================================

echo [1/4] Validando dependencias de build...
python -m pip install pyinstaller -r backend\requirements.txt -r desktop\requirements.txt

echo [2/4] Gerando executaveis desktop...
python -m PyInstaller --noconfirm Venner_Hub.spec
python -m PyInstaller --noconfirm Venner_Vendas_Desktop.spec
python -m PyInstaller --noconfirm Venner_Estoque.spec
python -m PyInstaller --noconfirm Venner_Manutencao.spec
python -m PyInstaller --noconfirm Venner_PCP.spec
python -m PyInstaller --noconfirm Venner_Produtividade.spec
python -m PyInstaller --noconfirm Venner_Agent.spec

echo [3/4] Gerando executavel do servidor...
pushd backend
python -m PyInstaller --noconfirm ERP_Venner_Servidor.spec
popd

echo [4/4] Montando pacote de release e manifesto...
python desktop\build_desktop_release.py

echo Build concluido.
echo Verifique:
echo - dist\
echo - backend\dist\
echo - releases\desktop\
pause
