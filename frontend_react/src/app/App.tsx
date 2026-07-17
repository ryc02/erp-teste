import React, { useState } from "react";
import { 
  LayoutDashboard, ShoppingCart, Package, Warehouse, DollarSign,
  Users, BarChart3, Settings, Bell, Search, ChevronDown,
  Building2, FileText, Menu, X, Shield, Wrench, Factory, Timer, Truck, Receipt
} from "lucide-react";

// Import Screens
import { Dashboard } from "./screens/Dashboard";
import { Pedidos } from "./screens/Pedidos";
import { Propostas } from "./screens/Propostas";
import { Fiscal } from "./screens/Fiscal";
import { Faturamento } from "./screens/Faturamento";
import { Clientes } from "./screens/Clientes";
import { Produtos } from "./screens/Produtos";
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
import Representantes from "./screens/Representantes";
import { useAuth } from "./hooks/useAuth";
import { Login } from "./screens/Login";
import { Component, ErrorInfo, ReactNode } from "react";
import { Loader2, LogOut } from "lucide-react";
import { Toaster } from "./components/ui/sonner";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 20, color: 'red', fontFamily: 'monospace' }}>
          <h1>Something went wrong.</h1>
          <pre>{this.state.error?.toString()}</pre>
          <pre>{this.state.error?.stack}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

type Module = "dashboard" | "propostas" | "pedidos" | "clientes" | "produtos" | "fornecedores" | "estoque" | "financeiro" | "fiscal" | "relatorios" | "configuracoes" | "compras" | "expedicao" | "pcp" | "manutencao" | "produtividade" | "auditoria" | "usuarios" | "representantes" | "vendas" | "faturamento";

type NavItem = { id: Module; label: string; icon: any; badge?: string };
type NavGroup = { label: string; items: NavItem[] };

const navGroups: NavGroup[] = [
  {
    label: "Principal",
    items: [
      { id: "dashboard" as Module, label: "Dashboard", icon: LayoutDashboard },
    ],
  },
  {
    label: "Vendas e CRM",
    items: [
      { id: "propostas" as Module, label: "Propostas Comerciais", icon: FileText },
      { id: "vendas", label: "Pedidos e Vendas", icon: ShoppingCart },
      { id: "fiscal", label: "Notas Fiscais", icon: Receipt },
      { id: "faturamento", label: "Faturamento", icon: DollarSign },
      { id: "clientes" as Module, label: "Clientes", icon: Users },
      { id: "representantes" as Module, label: "Vendedores / Representantes", icon: Users },
    ],
  },
  {
    label: "Suprimentos",
    items: [
      { id: "compras" as Module, label: "Compras", icon: DollarSign },
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
      { id: "estoque" as Module, label: "Estoque", icon: Warehouse },
      { id: "expedicao" as Module, label: "Expedição", icon: Truck },
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

function MainApp() {
  const { user, loading, logout, can } = useAuth();
  const [active, setActive] = useState<Module>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={32} className="animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Verificando sessão...</p>
        </div>
      </div>
    );
  }

  if (!user) return <Login />;

  const allItems = navGroups.flatMap((g) => g.items);
  const activeItem = allItems.find((i) => i.id === active) || allItems[0];

  function renderModule() {
    switch (active) {
      case "dashboard": return <Dashboard />;
      case "propostas": return <Propostas />;
      case "pedidos": 
      case "vendas": return <Pedidos />;
      case "clientes": return <Clientes />;
      case "representantes": return <Representantes />;
      case "produtos": return <Produtos />;
      case "estoque": return <Estoque />;
      case "financeiro": return <Financeiro />;
      case "fiscal": return <NotasFiscais />;
      case "faturamento": return <Faturamento />;
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
            <span className="font-bold text-lg" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Venner ERP</span>
          </div>
          <button className="lg:hidden text-muted-foreground" onClick={() => setSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-4 custom-scrollbar">
          {navGroups.map((group, i) => {
            const visibleItems = group.items.filter(item => item.id === 'dashboard' || can(item.id, 'view') || can('admin', 'view'));
            if (visibleItems.length === 0) return null;
            
            return (
            <div key={i} className="mb-6 last:mb-0">
              <p className="px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{group.label}</p>
              <div className="space-y-1">
                {visibleItems.map((item) => {
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
            );
          })}
        </div>

        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3 px-2 py-2 rounded-lg">
            <div className="w-9 h-9 flex-shrink-0 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
              {user.nome_completo?.charAt(0).toUpperCase() ?? "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{user.nome_completo}</p>
              <p className="text-xs text-muted-foreground truncate">{user.role?.nome}</p>
            </div>
            <button
              onClick={logout}
              title="Sair"
              className="p-1.5 rounded-md text-muted-foreground hover:bg-red-500/10 hover:text-red-500 transition-colors flex-shrink-0"
            >
              <LogOut size={16} />
            </button>
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

export default function App() {
  return (
    <ErrorBoundary>
      <MainApp />
      <Toaster richColors position="top-right" />
    </ErrorBoundary>
  );
}
