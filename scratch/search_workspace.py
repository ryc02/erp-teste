import os

workspace_dir = r"d:\ERP Venner"
keywords = ["vender", "preço", "preco", "valor", "modulo", "módulo", "financeiro", "vendas", "estoque", "pcp", "manutenção", "produtividade"]

for root, dirs, files in os.walk(workspace_dir):
    # Skip build, dist, backups, .git, etc.
    if any(p in root.lower() for p in ["build", "dist", "backups", ".git", "__pycache__", "node_modules", "temp"]):
        continue
    for file in files:
        if file.endswith((".py", ".md", ".txt", ".json", ".spec", ".bat")):
            file_path = os.path.join(root, file)
            try:
                with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                    for line_num, line in enumerate(f, 1):
                        line_lower = line.lower()
                        if any(kw in line_lower for kw in ["vender", "preço", "preco", "valor", "comercializar"]):
                            if any(kw in line_lower for kw in ["módulo", "modulo", "licença", "licenca", "estação", "estacao"]):
                                print(f"[{file}][L{line_num}]: {line.strip()}")
            except Exception as e:
                pass
