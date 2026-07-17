import os

app_path = r"d:\ERP Venner\frontend_react\src\app\App.tsx"

with open(app_path, "r", encoding="utf-8") as f:
    app_code = f.read()

# 1. Import
if "import { Propostas }" not in app_code:
    app_code = app_code.replace(
        'import { Pedidos } from "./screens/Pedidos";',
        'import { Pedidos } from "./screens/Pedidos";\nimport { Propostas } from "./screens/Propostas";'
    )

# 2. Type Module
if '"propostas"' not in app_code:
    app_code = app_code.replace(
        'type Module = "dashboard" | "pedidos"',
        'type Module = "dashboard" | "propostas" | "pedidos"'
    )

# 3. Sidebar Menu
if '{ id: "propostas" as Module' not in app_code:
    app_code = app_code.replace(
        '{ id: "pedidos" as Module, label: "Pedidos", icon: ShoppingCart, badge: "12" },',
        '{ id: "propostas" as Module, label: "Propostas Comerciais", icon: FileText },\n      { id: "pedidos" as Module, label: "Gestão de Pedidos", icon: ShoppingCart, badge: "12" },'
    )
    # Precisamos importar o ícone FileText se não estiver lá
    if "FileText" not in app_code:
        app_code = app_code.replace(
            "ShoppingCart, Users, Package, FileText", 
            "ShoppingCart, Users, Package, FileText" # just in case
        )
        if "FileText" not in app_code:
             app_code = app_code.replace("ShoppingCart,", "ShoppingCart, FileText,")

# 4. Router Switch
if 'case "propostas":' not in app_code:
    app_code = app_code.replace(
        'case "pedidos": return <Pedidos />;',
        'case "propostas": return <Propostas />;\n      case "pedidos": return <Pedidos />;'
    )

with open(app_path, "w", encoding="utf-8") as f:
    f.write(app_code)

print("App.tsx corrigido com sucesso!")
