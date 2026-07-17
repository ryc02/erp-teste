@echo off
echo ===================================================
echo     SCRIPT DE LIBERACAO DE ESPACO - ERP VENNER
echo ===================================================
echo.
echo Requisitando privilegios de Administrador (se necessario)...

:: Check for Administrator privileges
net session >nul 2>&1
if %errorLevel% == 0 (
    echo [OK] Executando como Administrador.
) else (
    echo [ERRO] Este script precisa ser executado como Administrador!
    echo Clique com o botao direito no arquivo liberar_espaco.bat e selecione "Executar como Administrador".
    pause
    exit /b
)

echo.
echo [1/4] Desativando Hibernacao (libera de 3 a 10 GB)...
powercfg.exe /h off
echo OK.

echo.
echo [2/4] Configurando Arquivo de Paginacao (movendo para o disco D:)...
powershell -Command "$sys = Get-WmiObject Win32_ComputerSystem -EnableAllPrivileges; $sys.AutomaticManagedPagefile = $false; $sys.Put(); $pagefiles = Get-WmiObject Win32_PageFileSetting; foreach ($pf in $pagefiles) { $pf.Delete() }; Set-WmiInstance -Class Win32_PageFileSetting -Arguments @{Name='D:\pagefile.sys'; InitialSize=0; MaximumSize=0}"
echo OK.

echo.
echo [3/4] Iniciando Desinstalacao dos Programas Solicitados...

echo.
echo -- Docker Desktop --
echo Um assistente de desinstalacao do Docker deve aparecer. Siga as instrucoes na tela.
"C:\Users\rycha\AppData\Local\Programs\DockerDesktop\Docker Desktop Installer.exe" "uninstall"

echo.
echo -- GeneXus 18 Trial --
echo Removendo GeneXus 18 Trial...
"C:\Users\rycha\AppData\Local\{044785D2-7CD5-4385-9CD7-0D7F74DC0194}\setup.exe" REMOVE=TRUE MODIFY=FALSE

echo.
echo -- League of Legends --
echo Um assistente da Riot Games pode aparecer para desinstalar o jogo.
"D:\Riot Games\Riot Client\RiotClientServices.exe" --uninstall-product=league_of_legends --uninstall-patchline=live

echo.
echo ===================================================
echo CONCLUIDO! 
echo.
echo O computador precisa ser REINICIADO para que a mudanca do arquivo 
echo de paginacao (Pagefile) libere os 5 GB do disco C:.
echo ===================================================
pause
