import os
import re

APP_TSX_PATH = r"d:\ERP Venner\frontend_react\src\app\App.tsx"
SCREENS_DIR = r"d:\ERP Venner\frontend_react\src\app\screens"
os.makedirs(SCREENS_DIR, exist_ok=True)

with open(APP_TSX_PATH, "r", encoding="utf-8") as f:
    content = f.read()

# Modules section starts here
modules_start = content.find("// ─── Modules ──────────────────────────────────────────────────────────────────")

if modules_start == -1:
    print("Could not find Modules section.")
    exit(1)

modules_content = content[modules_start:]
app_component_start = modules_content.find("export default function App()")

if app_component_start == -1:
    print("Could not find App component.")
    exit(1)

screens_content = modules_content[:app_component_start]

# The screens are delimited by comments like "// Dashboard", "// Clientes"
sections = re.split(r'\n// ([a-zA-ZÀ-ú]+)\n', screens_content)

shared_imports = """import React, { useState } from "react";
import { 
  LayoutDashboard, ShoppingCart, Package, Warehouse, DollarSign,
  Users, BarChart3, Settings, Bell, Search, ChevronDown,
  TrendingUp, ArrowUpRight, ArrowDownRight, MoreHorizontal,
  Filter, Download, Plus, Eye, CheckCircle, Clock, XCircle,
  Truck, RefreshCw, CreditCard, ChevronRight, Menu, X,
  Building2, FileText, Receipt, Wallet, ChevronUp,
  Save, Trash2, Edit3, Tag, MapPin, Phone, Mail, Hash,
  ShoppingBag, Store, Layers, AlertCircle, ArrowLeft, Check,
  ToggleLeft, ToggleRight, Minus, Printer, Send
} from "lucide-react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { Badge, Input, Select, Textarea, FormSection, Modal, TableToolbar, Pagination, fmt, fmtFull } from "../components/ui/SharedUI";
import * as mockData from "../data/mockData";
"""

for i in range(1, len(sections), 2):
    screen_name = sections[i]
    screen_code = sections[i+1].strip()
    
    # We need to export the main components in the code.
    # We replace "function ScreenName" with "export function ScreenName"
    screen_code = re.sub(r"^function ([a-zA-Z0-9_]+)", r"export function \1", screen_code, flags=re.MULTILINE)
    
    # Replace data references
    for data_var in ["clientesData", "produtosData", "fornecedoresData", "ordersData", "contasPagarData", "contasReceberData", "caixaData", "dreData", "revenueData", "dailyOrdersData", "channelData", "ESTADOS", "statusConfig"]:
        screen_code = re.sub(rf"\b{data_var}\b", f"mockData.{data_var}", screen_code)
        
    file_path = os.path.join(SCREENS_DIR, f"{screen_name}.tsx")
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(shared_imports + "\n" + screen_code)
    print(f"Extracted {screen_name}.tsx")

print("Finished extracting existing screens.")
