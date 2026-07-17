import os
import re

APP_TSX_PATH = r"d:\ERP Venner\frontend_react\src\app\App.tsx"
SCREENS_DIR = r"d:\ERP Venner\frontend_react\src\app\screens"
DATA_DIR = r"d:\ERP Venner\frontend_react\src\app\data"

os.makedirs(SCREENS_DIR, exist_ok=True)
os.makedirs(DATA_DIR, exist_ok=True)

with open(APP_TSX_PATH, "r", encoding="utf-8") as f:
    content = f.read()

# Shared UI is already created at src/app/components/ui/SharedUI.tsx
# We just need to extract data, extract screens, and rewrite App.tsx.

# 1. Extract data
data_start = content.find("// ─── Data ────────────────────────────────────────────────────────────────────")
data_end = content.find("// ─── Modules ──────────────────────────────────────────────────────────────────")

if data_start != -1 and data_end != -1:
    data_content = content[data_start:data_end]
    # We need to make the constants exportable
    data_content = re.sub(r"const ([a-zA-Z0-9_]+) = ", r"export const \1 = ", data_content)
    
    # Needs some imports for icons like CheckCircle, etc.
    lucide_icons = ["CheckCircle", "Truck", "Clock", "XCircle", "Package", "FileText"]
    
    data_file_content = f"""import {{ {', '.join(lucide_icons)} }} from "lucide-react";\n\n""" + data_content
    
    with open(os.path.join(DATA_DIR, "mockData.ts"), "w", encoding="utf-8") as f:
        f.write(data_file_content)

# 2. Identify screens
screens = ["Dashboard", "Clientes", "Produtos", "Fornecedores", "Pedidos", "Estoque", "Financeiro", "NotasFiscais"]

# Existing components that might be related (e.g. Forms)
forms = {
    "Clientes": ["ClienteForm"],
    "Produtos": ["ProdutoForm"],
    "Fornecedores": ["FornecedorForm"],
    "Pedidos": ["NovoPedidoForm"]
}

# The regex to capture a function component until the next major component
def extract_component(name):
    # This is a naive extraction. Since the file is well formatted, we can just split by "function Name" 
    # but we need to match curly braces. A simple approach is finding "function Name" and stopping at the next function.
    pass

# Actually, doing this with regex might be brittle.
# Let's create the new screens first.

new_screens = [
    "Compras", "Expedicao", "Pcp", "Manutencao", 
    "Produtividade", "Auditoria", "Usuarios", "Configuracoes", "Relatorios"
]

shared_imports = """import { useState } from "react";
import { Badge, Input, Select, Textarea, FormSection, Modal, TableToolbar, Pagination, fmt, fmtFull } from "../components/ui/SharedUI";
import { Eye, Edit3, Trash2 } from "lucide-react";
"""

for screen in new_screens:
    screen_content = shared_imports + f"""
export default function {screen}() {{
  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      <TableToolbar title="{screen}" subtitle="Módulo em desenvolvimento..." />
      <div className="p-10 text-center text-muted-foreground">
        <p className="text-lg">A tela de {screen} está sendo construída.</p>
      </div>
    </div>
  );
}}
"""
    with open(os.path.join(SCREENS_DIR, f"{screen}.tsx"), "w", encoding="utf-8") as f:
        f.write(screen_content)

print("Novas telas criadas com sucesso.")
