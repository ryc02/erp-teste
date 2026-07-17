import webbrowser
import time
import socket
import os
import sys

def get_server_url():
    # Caminho do arquivo de configuração ao lado do executável
    if hasattr(sys, '_MEIPASS'):
        base_path = os.path.dirname(sys.executable)
    else:
        base_path = os.path.dirname(__file__)
    
    config_path = os.path.join(base_path, "servidor.txt")
    
    # Se o arquivo não existir, cria com o IP padrão
    if not os.path.exists(config_path):
        try:
            with open(config_path, "w") as f:
                f.write("192.168.1.252")
        except:
            pass
        return "192.168.1.252"
    
    # Lê o IP do arquivo
    try:
        with open(config_path, "r") as f:
            ip = f.read().strip()
            return ip if ip else "192.168.1.252"
    except:
        return "192.168.1.252"

def is_port_open(host, port):
    try:
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            s.settimeout(1)
            return s.connect_ex((host, port)) == 0
    except:
        return False

def main():
    server_ip = get_server_url()
    url = f"http://{server_ip}:8000"
    
    # Aguarda o servidor subir (tentativas por 15 segundos)
    max_retries = 15
    server_found = False
    
    for i in range(max_retries):
        if is_port_open(server_ip, 8000):
            server_found = True
            break
        time.sleep(1)
    
    # Abre o navegador (seja no IP do servidor ou localhost se falhar)
    webbrowser.open(url)

if __name__ == "__main__":
    main()
