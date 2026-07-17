import os
import re

APP_TSX_PATH = r"D:\Front end para ERP Olist\src\app\App.tsx"
SCREENS_DIR = r"d:\ERP Venner\frontend_react\src\app\screens"

with open(APP_TSX_PATH, "r", encoding="utf-8") as f:
    content = f.read()

def extract_between(text, start_str, end_str):
    start = text.find(start_str)
    if start == -1: return ""
    end = text.find(end_str, start)
    if end == -1: return text[start:]
    return text[start:end]

pedidos_code = extract_between(content, "// Pedidos / Nova venda", "// Estoque")
fiscal_code = extract_between(content, "// Fiscal / Notas Fiscais", "// Relatórios")

shared_imports = """import React, { useState } from "react";
import { 
  Check, Search, Plus, Trash2, Tag, Calendar, Download, Eye, FileText, ChevronRight
} from "lucide-react";
import { Badge, Input, Select, Textarea, FormSection, Modal, TableToolbar, Pagination, fmt, fmtFull } from "../components/ui/SharedUI";
import * as mockData from "../data/mockData";
"""

def clean_and_write(name, raw_code):
    if not raw_code: return
    # Replace function with export function
    raw_code = re.sub(r"^function ([a-zA-Z0-9_]+)", r"export function \1", raw_code, flags=re.MULTILINE)
    # Replace data references
    for data_var in ["clientesData", "produtosData", "fornecedoresData", "ordersData", "contasPagarData", "contasReceberData", "caixaData", "dreData", "revenueData", "dailyOrdersData", "channelData", "ESTADOS", "statusConfig"]:
        raw_code = re.sub(rf"\b{data_var}\b", f"mockData.{data_var}", raw_code)
        
    with open(os.path.join(SCREENS_DIR, f"{name}.tsx"), "w", encoding="utf-8") as f:
        f.write(shared_imports + "\n" + raw_code.strip())
    print(f"Extracted {name}")

clean_and_write("Pedidos", pedidos_code)
clean_and_write("NotasFiscais", fiscal_code)

print("Done")
