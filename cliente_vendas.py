import os
import socket
import sys
import time
import webbrowser


def get_server_url():
    if hasattr(sys, '_MEIPASS'):
        base_path = os.path.dirname(sys.executable)
    else:
        base_path = os.path.dirname(__file__)

    config_path = os.path.join(base_path, "servidor.txt")

    if not os.path.exists(config_path):
        try:
            with open(config_path, "w") as f:
                f.write("192.168.1.252")
        except Exception:
            pass
        return "192.168.1.252"

    try:
        with open(config_path, "r") as f:
            ip = f.read().strip()
            return ip if ip else "192.168.1.252"
    except Exception:
        return "192.168.1.252"


def is_port_open(host, port):
    try:
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            s.settimeout(1)
            return s.connect_ex((host, port)) == 0
    except Exception:
        return False


def main():
    server_ip = get_server_url()
    url = f"http://{server_ip}:8000/comercial/index.html"

    max_retries = 15
    for _ in range(max_retries):
        if is_port_open(server_ip, 8000):
            break
        time.sleep(1)

    webbrowser.open(url)


if __name__ == "__main__":
    main()
