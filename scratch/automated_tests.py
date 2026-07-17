import requests
import sys

BASE_URL = "http://127.0.0.1:8000/api/v1"

def test_health():
    print("Testing Backend Health...")
    try:
        response = requests.get(f"{BASE_URL}/health")
        response.raise_for_status()
        print(f"SUCCESS: {response.json()}")
    except Exception as e:
        print(f"FAILED: {e}")
        return False
    return True

def test_auth():
    print("\nTesting Authentication (admin/admin123)...")
    try:
        response = requests.post(
            f"{BASE_URL}/auth/login",
            data={"username": "admin", "password": "admin123"}
        )
        response.raise_for_status()
        token = response.json().get("access_token")
        print(f"SUCCESS: Token acquired (ends in ...{token[-10:]})")
        return token
    except Exception as e:
        print(f"FAILED: {e}")
        return None

def test_modules_reachability():
    print("\nTesting Modules Reachability...")
    modules = [
        "/index.html",
        "/comercial/index.html",
        "/modules/estoque/produtos.html",
        "/modules/manutencao/manutencao.html",
        "/modules/pcp/pcp.html",
        "/modules/produtividade/produtividade.html"
    ]
    
    all_ok = True
    for module in modules:
        url = f"http://127.0.0.1:8000{module}"
        try:
            response = requests.get(url)
            if response.status_code == 200:
                print(f"OK: {module}")
            else:
                print(f"WARNING: {module} returned {response.status_code}")
                all_ok = False
        except Exception as e:
            print(f"ERROR: {module} failed: {e}")
            all_ok = False
    return all_ok

if __name__ == "__main__":
    if not test_health():
        sys.exit(1)
    
    token = test_auth()
    if not token:
        sys.exit(1)
        
    test_modules_reachability()
    print("\nTests completed.")
