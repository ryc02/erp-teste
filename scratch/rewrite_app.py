import os

APP_TSX_PATH = r"d:\ERP Venner\frontend_react\src\app\App.tsx"

new_app_content = """import React, { useState } from "react";
import { 
  LayoutDashboard, ShoppingCart, Package, Warehouse, DollarSign,
  Users, BarChart3, Settings, Bell, Search, ChevronDown,
  Building2, FileText, Menu, X, Shield, Wrench, Factory, Timer, Truck
} from "lucide-react";

// Import Screens
import { Dashboard } from "./screens/Dashboard";
import { Pedidos } from "./screens/Pedidos";
import { Clientes } from "./screens/Clientes";
import { Produtos } from "./screens/Produtos";
import { Fornecedores } from "./screens/Fornecedores";
import { Estoque } from "./screens/Estoque";
import { Financeiro } from "./screens/Financeiro";
import { NotasFiscais } from "./screens/NotasFiscais";

import Compras from "./screens/Compras";
import Expedicao from "./screens/Expedicao";
import Pcp from "./screens/Pcp";
import Manutencao from "./screens/Manutencao";
import Produtividade from "./screens/Produtividade";
import Auditoria from "./screens/Auditoria";
import Usuarios from "./screens/Usuarios";
import Configuracoes from "./screens/Configuracoes";
import Relatorios from "./screens/Relatorios";

type Module = "dashboard" | "pedidos" | "clientes" | "produtos" | "fornecedores" | "estoque" | "financeiro" | "fiscal" | "relatorios" | "configuracoes" | "compras" | "expedicao" | "pcp" | "manutencao" | "produtividade" | "auditoria" | "usuarios";

const navGroups = [
  {
    label: "Principal",
    items: [
      { id: "dashboard" as Module, label: "Dashboard", icon: LayoutDashboard },
    ],
  },
  {
    label: "Vendas e CRM",
    items: [
      { id: "pedidos" as Module, label: "Pedidos", icon: ShoppingCart, badge: "12" },
      { id: "clientes" as Module, label: "Clientes", icon: Users },
    ],
  },
  {
    label: "Suprimentos",
    items: [
      { id: "compras" as Module, label: "Compras", icon: DollarSign },
      { id: "fornecedores" as Module, label: "Fornecedores", icon: Building2 },
      { id: "produtos" as Module, label: "Produtos", icon: Package },
    ],
  },
  {
    label: "Fábrica e Produção",
    items: [
      { id: "pcp" as Module, label: "PCP (Ordens de Produção)", icon: Factory },
      { id: "produtividade" as Module, label: "Produtividade (OEE)", icon: Timer },
      { id: "manutencao" as Module, label: "Manutenção (OS)", icon: Wrench },
    ],
  },
  {
    label: "Logística e Operações",
    items: [
      { id: "estoque" as Module, label: "Estoque", icon: Warehouse, badge: "3" },
      { id: "expedicao" as Module, label: "Expedição", icon: Truck },
      { id: "fiscal" as Module, label: "Notas Fiscais", icon: FileText },
    ],
  },
  {
    label: "Administrativo",
    items: [
      { id: "financeiro" as Module, label: "Financeiro", icon: DollarSign },
      { id: "relatorios" as Module, label: "Relatórios", icon: BarChart3 },
    ],
  },
  {
    label: "Sistema",
    items: [
      { id: "usuarios" as Module, label: "Usuários", icon: Users },
      { id: "auditoria" as Module, label: "Auditoria", icon: Shield },
      { id: "configuracoes" as Module, label: "Configurações", icon: Settings },
    ],
  },
];

export default function App() {
  const [active, setActive] = useState<Module>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const allItems = navGroups.flatMap((g) => g.items);
  const activeItem = allItems.find((i) => i.id === active) || allItems[0];

  function renderModule() {
    switch (active) {
      case "dashboard": return <Dashboard />;
      case "pedidos": return <Pedidos />;
      case "clientes": return <Clientes />;
      case "produtos": return <Produtos />;
      case "fornecedores": return <Fornecedores />;
      case "estoque": return <Estoque />;
      case "financeiro": return <Financeiro />;
      case "fiscal": return <NotasFiscais />;
      case "compras": return <Compras />;
      case "expedicao": return <Expedicao />;
      case "pcp": return <Pcp />;
      case "manutencao": return <Manutencao />;
      case "produtividade": return <Produtividade />;
      case "auditoria": return <Auditoria />;
      case "usuarios": return <Usuarios />;
      case "configuracoes": return <Configuracoes />;
      case "relatorios": return <Relatorios />;
      default: return <Dashboard />;
    }
  }

  return (
    <div className="flex h-screen bg-muted/20 overflow-hidden font-sans text-foreground">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-card border-r border-border flex flex-col transition-transform duration-200 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Package size={18} className="text-white" />
            </div>
            <span className="font-bold text-lg" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Olist ERP</span>
          </div>
          <button className="lg:hidden text-muted-foreground" onClick={() => setSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-4 custom-scrollbar">
          {navGroups.map((group, i) => (
            <div key={i} className="mb-6 last:mb-0">
              <p className="px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{group.label}</p>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const isActive = active === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => { setActive(item.id); setSidebarOpen(false); }}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-all duration-200 ${isActive ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon size={18} className={isActive ? "text-primary" : "text-muted-foreground opacity-70"} />
                        {item.label}
                      </div>
                      {item.badge && (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isActive ? "bg-primary text-white" : "bg-muted-foreground/20 text-foreground"}`}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted transition-colors cursor-pointer">
            <div className="w-9 h-9 rounded-full bg-accent flex items-center justify-center text-primary font-bold">
              AM
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">Admin User</p>
              <p className="text-xs text-muted-foreground truncate">admin@olist.com</p>
            </div>
            <ChevronDown size={14} className="text-muted-foreground" />
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-card border-b border-border flex items-center justify-between px-4 lg:px-8 flex-shrink-0">
          <div className="flex items-center gap-4">
            <button className="lg:hidden p-2 -ml-2 text-muted-foreground hover:bg-muted rounded-lg" onClick={() => setSidebarOpen(true)}>
              <Menu size={20} />
            </button>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold text-foreground" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{activeItem.label}</h1>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <div className="relative hidden md:block">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input type="text" placeholder="Pesquisar em tudo..." className="w-64 pl-9 pr-4 py-2 bg-muted/50 border-none rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <button className="p-2 text-muted-foreground hover:bg-muted rounded-full transition-colors relative">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-card" />
            </button>
          </div>
        </header>

        {/* Page content */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-8 custom-scrollbar">
          <div className="max-w-[1400px] mx-auto">
            <div className="sm:hidden mb-6">
              <h1 className="text-2xl font-bold text-foreground" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{activeItem.label}</h1>
            </div>
            {renderModule()}
          </div>
        </div>
      </main>
    </div>
  );
}
"""

with open(APP_TSX_PATH, "w", encoding="utf-8") as f:
    f.write(new_app_content)

print("App.tsx atualizado com sucesso.")
