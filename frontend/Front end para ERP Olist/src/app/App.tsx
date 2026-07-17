import { useState, useRef } from "react";
import {
  LayoutDashboard, ShoppingCart, Package, Warehouse, DollarSign,
  Users, BarChart3, Settings, Bell, Search, ChevronDown,
  TrendingUp, ArrowUpRight, ArrowDownRight, MoreHorizontal,
  Filter, Download, Plus, Eye, CheckCircle, Clock, XCircle,
  Truck, RefreshCw, CreditCard, ChevronRight, Menu, X,
  Building2, FileText, Receipt, Wallet, ChevronUp,
  Save, Trash2, Edit3, Tag, MapPin, Phone, Mail, Hash,
  ShoppingBag, Store, Layers, AlertCircle, ArrowLeft, Check,
  ToggleLeft, ToggleRight, Minus, Printer, Send,
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line,
} from "recharts";

// ─── Paleta / helpers ────────────────────────────────────────────────────────

function fmt(n: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(n);
}
function fmtFull(n: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(n);
}

// ─── Shared UI ───────────────────────────────────────────────────────────────

function Badge({ children, variant = "default" }: { children: React.ReactNode; variant?: "default" | "success" | "warning" | "danger" | "info" | "neutral" }) {
  const v = { default: "bg-secondary text-secondary-foreground", success: "bg-emerald-50 text-emerald-700 border border-emerald-200", warning: "bg-amber-50 text-amber-700 border border-amber-200", danger: "bg-red-50 text-red-700 border border-red-200", info: "bg-blue-50 text-blue-700 border border-blue-200", neutral: "bg-muted text-muted-foreground" };
  return <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${v[variant]}`}>{children}</span>;
}

function Input({ label, required, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label?: string; required?: boolean }) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-xs font-medium text-foreground">{label}{required && <span className="text-red-500 ml-0.5">*</span>}</label>}
      <input className="text-xs px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-muted-foreground" {...props} />
    </div>
  );
}

function Select({ label, required, children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement> & { label?: string; required?: boolean }) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-xs font-medium text-foreground">{label}{required && <span className="text-red-500 ml-0.5">*</span>}</label>}
      <select className="text-xs px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 text-foreground" {...props}>{children}</select>
    </div>
  );
}

function Textarea({ label, required, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string; required?: boolean }) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-xs font-medium text-foreground">{label}{required && <span className="text-red-500 ml-0.5">*</span>}</label>}
      <textarea className="text-xs px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none placeholder:text-muted-foreground" rows={3} {...props} />
    </div>
  );
}

function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider pb-1 border-b border-border">{title}</h3>
      {children}
    </div>
  );
}

function Modal({ open, onClose, title, subtitle, children, wide }: { open: boolean; onClose: () => void; title: string; subtitle?: string; children: React.ReactNode; wide?: boolean }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className={`relative bg-card rounded-xl border border-border shadow-2xl flex flex-col max-h-[90vh] ${wide ? "w-full max-w-4xl" : "w-full max-w-2xl"}`}>
        <div className="flex items-start justify-between p-5 border-b border-border flex-shrink-0">
          <div>
            <h2 className="text-base font-semibold text-foreground" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{title}</h2>
            {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground"><X size={16} /></button>
        </div>
        <div className="overflow-y-auto flex-1 p-5">{children}</div>
      </div>
    </div>
  );
}

function TableToolbar({ title, subtitle, count, onNew, newLabel, children }: { title: string; subtitle?: string; count?: number; onNew?: () => void; newLabel?: string; children?: React.ReactNode }) {
  return (
    <div className="p-5 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div>
        <h2 className="text-base font-semibold text-foreground" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{title}</h2>
        {(subtitle || count !== undefined) && <p className="text-xs text-muted-foreground">{subtitle ?? `${count} registros encontrados`}</p>}
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input className="text-xs pl-8 pr-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 w-44" placeholder="Buscar..." />
        </div>
        {children}
        <button className="flex items-center gap-1.5 text-xs px-3 py-2 border border-border rounded-lg bg-background text-muted-foreground hover:bg-muted">
          <Filter size={12} /> Filtros
        </button>
        <button className="flex items-center gap-1.5 text-xs px-3 py-2 border border-border rounded-lg bg-background text-muted-foreground hover:bg-muted">
          <Download size={12} /> Exportar
        </button>
        {onNew && (
          <button onClick={onNew} className="flex items-center gap-1.5 text-xs px-3 py-2 bg-primary text-white rounded-lg hover:bg-primary/90">
            <Plus size={13} /> {newLabel ?? "Novo"}
          </button>
        )}
      </div>
    </div>
  );
}

function Pagination({ total, shown }: { total: number; shown: number }) {
  return (
    <div className="px-5 py-3 border-t border-border flex items-center justify-between">
      <p className="text-xs text-muted-foreground">Mostrando {shown} de {total} registros</p>
      <div className="flex gap-1">
        {[1, 2, 3].map((n) => (
          <button key={n} className={`w-7 h-7 text-xs rounded flex items-center justify-center ${n === 1 ? "bg-primary text-white" : "text-muted-foreground hover:bg-muted"}`}>{n}</button>
        ))}
      </div>
    </div>
  );
}

// ─── Data ────────────────────────────────────────────────────────────────────

const ESTADOS = ["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"];

const clientesData = [
  { id: "CLI-0091", nome: "Mariana Oliveira", tipo: "PF", doc: "428.991.023-14", email: "mariana@email.com", telefone: "(11) 98721-4432", cidade: "São Paulo", uf: "SP", situacao: "ativo", compras: 8, total: "R$ 3.240,00" },
  { id: "CLI-0090", nome: "Tech Distribuidora Ltda", tipo: "PJ", doc: "12.345.678/0001-99", email: "compras@techd.com.br", telefone: "(21) 3421-8800", cidade: "Rio de Janeiro", uf: "RJ", situacao: "ativo", compras: 24, total: "R$ 78.900,00" },
  { id: "CLI-0089", nome: "Carlos Mendes", tipo: "PF", doc: "311.002.771-88", email: "carlos.m@gmail.com", telefone: "(31) 99214-5510", cidade: "Belo Horizonte", uf: "MG", situacao: "ativo", compras: 3, total: "R$ 1.870,00" },
  { id: "CLI-0088", nome: "Fernanda Costa", tipo: "PF", doc: "502.887.312-41", email: "fe.costa@hotmail.com", telefone: "(41) 98533-2211", cidade: "Curitiba", uf: "PR", situacao: "inativo", compras: 1, total: "R$ 2.890,00" },
  { id: "CLI-0087", nome: "Global Atacado S.A.", tipo: "PJ", doc: "98.765.432/0001-10", email: "financeiro@globalatacado.com", telefone: "(11) 3200-4411", cidade: "Guarulhos", uf: "SP", situacao: "ativo", compras: 51, total: "R$ 214.500,00" },
  { id: "CLI-0086", nome: "Rafael Souza", tipo: "PF", doc: "188.221.049-02", email: "r.souza@yahoo.com", telefone: "(85) 99001-7733", cidade: "Fortaleza", uf: "CE", situacao: "ativo", compras: 6, total: "R$ 2.112,00" },
];

const produtosData = [
  { id: "PRD-4421", nome: "Kit Organizador Escritório", categoria: "Escritório", ncm: "3926.10.00", unidade: "UN", custo: 62.00, preco: 189.90, margem: 67.5, estoque: 142, situacao: "ativo" },
  { id: "PRD-4422", nome: "Cadeira Gamer Pro X", categoria: "Mobiliário", ncm: "9401.30.00", unidade: "UN", custo: 430.00, preco: 1249.00, margem: 65.6, estoque: 18, situacao: "ativo" },
  { id: "PRD-4423", nome: 'Monitor 27" IPS 144Hz', categoria: "Eletrônicos", ncm: "8528.52.20", unidade: "UN", custo: 980.00, preco: 2890.00, margem: 66.1, estoque: 7, situacao: "ativo" },
  { id: "PRD-4424", nome: "Teclado Mecânico HyperX", categoria: "Periféricos", ncm: "8471.60.54", unidade: "UN", custo: 148.00, preco: 459.90, margem: 67.8, estoque: 89, situacao: "ativo" },
  { id: "PRD-4425", nome: "Fone Bluetooth ANC Pro", categoria: "Áudio", ncm: "8518.30.00", unidade: "UN", custo: 122.00, preco: 379.00, margem: 67.8, estoque: 56, situacao: "ativo" },
  { id: "PRD-4426", nome: "Webcam Full HD 1080p", categoria: "Periféricos", ncm: "8525.89.90", unidade: "UN", custo: 71.00, preco: 219.90, margem: 67.7, estoque: 4, situacao: "inativo" },
];

const fornecedoresData = [
  { id: "FOR-0021", nome: "Eletrônicos Prime Ltda", doc: "45.678.901/0001-23", email: "comercial@eprime.com.br", telefone: "(11) 3344-9900", cidade: "São Paulo", uf: "SP", situacao: "ativo" },
  { id: "FOR-0020", nome: "Distribuidora Nacional S.A.", doc: "23.456.789/0001-45", email: "vendas@disnac.com", telefone: "(21) 2200-8811", cidade: "Rio de Janeiro", uf: "RJ", situacao: "ativo" },
  { id: "FOR-0019", nome: "Importadora TechBR", doc: "67.890.123/0001-67", email: "import@techbr.com.br", telefone: "(11) 4444-3322", cidade: "São Bernardo do Campo", uf: "SP", situacao: "ativo" },
];

const ordersData = [
  { id: "#PED-8821", cliente: "Mariana Oliveira", produto: "Kit Organizador Escritório", canal: "Mercado Livre", valor: 189.90, status: "entregue", data: "13/07/2026", pagamento: "Pix" },
  { id: "#PED-8820", cliente: "Carlos Mendes", produto: "Cadeira Gamer Pro X", canal: "Amazon", valor: 1249.00, status: "transito", data: "13/07/2026", pagamento: "Cartão Crédito" },
  { id: "#PED-8819", cliente: "Fernanda Costa", produto: 'Monitor 27" IPS 144Hz', canal: "Shopee", valor: 2890.00, status: "processando", data: "12/07/2026", pagamento: "Boleto" },
  { id: "#PED-8818", cliente: "Rafael Souza", produto: "Teclado Mecânico HyperX", canal: "Loja própria", valor: 459.90, status: "entregue", data: "12/07/2026", pagamento: "Pix" },
  { id: "#PED-8817", cliente: "Amanda Lima", produto: "Fone Bluetooth ANC Pro", canal: "Mercado Livre", valor: 379.00, status: "cancelado", data: "11/07/2026", pagamento: "Cartão Crédito" },
  { id: "#PED-8816", cliente: "Bruno Alves", produto: "Webcam Full HD 1080p", canal: "Shopee", valor: 219.90, status: "entregue", data: "11/07/2026", pagamento: "Pix" },
  { id: "#PED-8815", cliente: "Juliana Ramos", produto: "Mesa Ajustável Standing", canal: "Amazon", valor: 1890.00, status: "transito", data: "10/07/2026", pagamento: "Boleto" },
  { id: "#PED-8814", cliente: "Diego Ferreira", produto: "Suporte Monitor Duplo", canal: "Mercado Livre", valor: 329.90, status: "processando", data: "10/07/2026", pagamento: "Pix" },
];

const contasPagarData = [
  { id: "CP-0041", descricao: "Frete Correios — Lote 44", fornecedor: "Correios", vencimento: "15/07/2026", valor: 847.20, categoria: "Logística", status: "aberto", pagamento: "Boleto" },
  { id: "CP-0040", descricao: "Reposição estoque — Monitor 27\"", fornecedor: "Eletrônicos Prime", vencimento: "14/07/2026", valor: 9800.00, categoria: "Estoque", status: "vencido", pagamento: "Transferência" },
  { id: "CP-0039", descricao: "Taxa marketplace Shopee — Jun", fornecedor: "Shopee", vencimento: "20/07/2026", valor: 1247.40, categoria: "Taxas", status: "aberto", pagamento: "Débito Auto" },
  { id: "CP-0038", descricao: "Aluguel galpão logístico", fornecedor: "Imob. Central", vencimento: "10/07/2026", valor: 4500.00, categoria: "Infraestrutura", status: "pago", pagamento: "TED" },
  { id: "CP-0037", descricao: "Embalagens e insumos", fornecedor: "Embal Pack", vencimento: "25/07/2026", valor: 1320.00, categoria: "Suprimentos", status: "aberto", pagamento: "Boleto" },
];

const contasReceberData = [
  { id: "CR-0071", descricao: "Pedido #PED-8819 — Shopee", cliente: "Fernanda Costa", vencimento: "19/07/2026", valor: 2890.00, categoria: "Vendas", status: "aberto" },
  { id: "CR-0070", descricao: "Pedido #PED-8815 — Amazon", cliente: "Juliana Ramos", vencimento: "17/07/2026", valor: 1890.00, categoria: "Vendas", status: "aberto" },
  { id: "CR-0069", descricao: "Contrato Global Atacado — Julho", cliente: "Global Atacado S.A.", vencimento: "30/07/2026", valor: 18400.00, categoria: "Atacado", status: "aberto" },
  { id: "CR-0068", descricao: "Pedido #PED-8821 — Mercado Livre", cliente: "Mariana Oliveira", vencimento: "13/07/2026", valor: 189.90, categoria: "Vendas", status: "recebido" },
  { id: "CR-0067", descricao: "Pedido #PED-8818 — Loja própria", cliente: "Rafael Souza", vencimento: "12/07/2026", valor: 459.90, categoria: "Vendas", status: "recebido" },
];

const caixaData = [
  { hora: "09:14", descricao: "Abertura de caixa", tipo: "abertura", valor: 500.00 },
  { hora: "10:22", descricao: "Venda PDV — Teclado Mecânico", tipo: "entrada", valor: 459.90 },
  { hora: "11:05", descricao: "Venda PDV — Fone Bluetooth", tipo: "entrada", valor: 379.00 },
  { hora: "11:47", descricao: "Troco devolução cliente", tipo: "saida", valor: 42.10 },
  { hora: "13:30", descricao: "Venda PDV — Webcam HD", tipo: "entrada", valor: 219.90 },
  { hora: "14:18", descricao: "Sangria caixa", tipo: "saida", valor: 800.00 },
  { hora: "15:02", descricao: "Venda PDV — Kit Organizador", tipo: "entrada", valor: 189.90 },
];

const dreData = [
  { conta: "Receita Bruta de Vendas", valor: 241000, nivel: 0, tipo: "receita" },
  { conta: "(-) Devoluções e cancelamentos", valor: -4800, nivel: 1, tipo: "deducao" },
  { conta: "(-) Impostos sobre vendas (ICMS, PIS, COFINS)", valor: -21900, nivel: 1, tipo: "deducao" },
  { conta: "= Receita Líquida", valor: 214300, nivel: 0, tipo: "subtotal" },
  { conta: "(-) Custo dos produtos vendidos (CPV)", valor: -83200, nivel: 1, tipo: "deducao" },
  { conta: "= Lucro Bruto", valor: 131100, nivel: 0, tipo: "subtotal" },
  { conta: "(-) Despesas Operacionais", valor: -54900, nivel: 1, tipo: "deducao" },
  { conta: "  Logística e frete", valor: -12400, nivel: 2, tipo: "detalhe" },
  { conta: "  Taxas de marketplace", valor: -18700, nivel: 2, tipo: "detalhe" },
  { conta: "  Marketing e publicidade", valor: -9800, nivel: 2, tipo: "detalhe" },
  { conta: "  Pessoal e administrativo", valor: -14000, nivel: 2, tipo: "detalhe" },
  { conta: "= EBITDA", valor: 76200, nivel: 0, tipo: "subtotal" },
  { conta: "(-) Depreciação e amortização", valor: -2100, nivel: 1, tipo: "deducao" },
  { conta: "(-) Resultado financeiro", valor: -1800, nivel: 1, tipo: "deducao" },
  { conta: "= Lucro Líquido", valor: 72300, nivel: 0, tipo: "total" },
];

const revenueData = [
  { mes: "Jan", receita: 142000, despesas: 98000 },
  { mes: "Fev", receita: 158000, despesas: 104000 },
  { mes: "Mar", receita: 134000, despesas: 91000 },
  { mes: "Abr", receita: 187000, despesas: 112000 },
  { mes: "Mai", receita: 213000, despesas: 127000 },
  { mes: "Jun", receita: 198000, despesas: 119000 },
  { mes: "Jul", receita: 241000, despesas: 138000 },
];

const dailyOrdersData = [
  { dia: "Seg", pedidos: 34 }, { dia: "Ter", pedidos: 41 }, { dia: "Qua", pedidos: 29 },
  { dia: "Qui", pedidos: 52 }, { dia: "Sex", pedidos: 67 }, { dia: "Sáb", pedidos: 48 }, { dia: "Dom", pedidos: 31 },
];

const channelData = [
  { name: "Mercado Livre", value: 38, color: "#F05A28" },
  { name: "Shopee", value: 24, color: "#3B82F6" },
  { name: "Amazon", value: 19, color: "#10B981" },
  { name: "Loja própria", value: 12, color: "#F59E0B" },
  { name: "Outros", value: 7, color: "#8B5CF6" },
];

const statusConfig = {
  entregue: { label: "Entregue", icon: CheckCircle, variant: "success" as const },
  transito: { label: "Em trânsito", icon: Truck, variant: "info" as const },
  processando: { label: "Processando", icon: Clock, variant: "warning" as const },
  cancelado: { label: "Cancelado", icon: XCircle, variant: "danger" as const },
  separacao: { label: "Em separação", icon: Package, variant: "neutral" as const },
  faturado: { label: "Faturado", icon: FileText, variant: "info" as const },
};

// ─── Modules ──────────────────────────────────────────────────────────────────

// Dashboard
function Dashboard() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Receita do mês", value: "R$ 241k", change: "+18,4%", pos: true, icon: DollarSign },
          { label: "Pedidos hoje", value: "127", change: "+9,2%", pos: true, icon: ShoppingCart },
          { label: "Ticket médio", value: "R$ 342", change: "-3,1%", pos: false, icon: CreditCard },
          { label: "Clientes novos", value: "89", change: "+22,7%", pos: true, icon: Users },
        ].map((k) => (
          <div key={k.label} className="bg-card rounded-xl p-5 border border-border hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center"><k.icon size={18} className="text-primary" /></div>
              <span className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${k.pos ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
                {k.pos ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}{k.change}
              </span>
            </div>
            <p className="text-2xl font-bold text-foreground" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{k.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{k.label}</p>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-card rounded-xl p-5 border border-border">
          <div className="flex items-center justify-between mb-4">
            <div><p className="text-sm font-semibold text-foreground" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Receita vs. Despesas</p><p className="text-xs text-muted-foreground">Últimos 7 meses</p></div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={revenueData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="gR" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#F05A28" stopOpacity={0.15} /><stop offset="95%" stopColor="#F05A28" stopOpacity={0} /></linearGradient>
                <linearGradient id="gD" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3B82F6" stopOpacity={0.15} /><stop offset="95%" stopColor="#3B82F6" stopOpacity={0} /></linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(26,31,54,0.06)" />
              <XAxis dataKey="mes" tick={{ fontSize: 11, fill: "#6B7280" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#6B7280" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v / 1000}k`} />
              <Tooltip formatter={(v: number) => [fmt(v), ""]} contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid rgba(26,31,54,0.1)" }} />
              <Area type="monotone" dataKey="receita" name="Receita" stroke="#F05A28" strokeWidth={2} fill="url(#gR)" />
              <Area type="monotone" dataKey="despesas" name="Despesas" stroke="#3B82F6" strokeWidth={2} fill="url(#gD)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-card rounded-xl p-5 border border-border">
          <p className="text-sm font-semibold text-foreground mb-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Canais de venda</p>
          <p className="text-xs text-muted-foreground mb-3">Participação julho</p>
          <ResponsiveContainer width="100%" height={130}>
            <PieChart><Pie data={channelData} cx="50%" cy="50%" innerRadius={38} outerRadius={60} paddingAngle={3} dataKey="value">{channelData.map((e, i) => <Cell key={i} fill={e.color} />)}</Pie>
              <Tooltip formatter={(v: number) => [`${v}%`, ""]} contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid rgba(26,31,54,0.1)" }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-1">{channelData.map((c) => (
            <div key={c.name} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: c.color }} /><span className="text-muted-foreground">{c.name}</span></div>
              <span className="font-medium">{c.value}%</span>
            </div>
          ))}</div>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-card rounded-xl border border-border overflow-hidden">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <p className="text-sm font-semibold text-foreground" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Últimos pedidos</p>
            <button className="text-xs text-primary font-medium flex items-center gap-1">Ver todos <ChevronRight size={11} /></button>
          </div>
          {ordersData.slice(0, 5).map((o) => {
            const s = statusConfig[o.status as keyof typeof statusConfig];
            return (
              <div key={o.id} className="flex items-center justify-between px-5 py-3 border-b border-border last:border-0 hover:bg-muted/30">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-xs font-mono text-muted-foreground w-20 flex-shrink-0">{o.id}</span>
                  <div className="min-w-0"><p className="text-xs font-medium truncate">{o.cliente}</p><p className="text-xs text-muted-foreground truncate">{o.produto}</p></div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="text-xs font-semibold">{fmtFull(o.valor)}</span>
                  <Badge variant={s.variant}><s.icon size={10} />{s.label}</Badge>
                </div>
              </div>
            );
          })}
        </div>
        <div className="bg-card rounded-xl p-5 border border-border">
          <p className="text-sm font-semibold text-foreground mb-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Pedidos por dia</p>
          <p className="text-xs text-muted-foreground mb-3">Semana atual</p>
          <ResponsiveContainer width="100%" height={150}>
            <BarChart data={dailyOrdersData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(26,31,54,0.06)" vertical={false} />
              <XAxis dataKey="dia" tick={{ fontSize: 11, fill: "#6B7280" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#6B7280" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid rgba(26,31,54,0.1)" }} />
              <Bar dataKey="pedidos" name="Pedidos" fill="#F05A28" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

// Clientes
function ClienteForm({ onClose }: { onClose: () => void }) {
  const [tipo, setTipo] = useState<"PF" | "PJ">("PF");
  const [tab, setTab] = useState(0);
  const tabs = ["Dados Gerais", "Endereço", "Contatos", "Financeiro"];
  return (
    <div className="space-y-5">
      {/* Tipo toggle */}
      <div className="flex gap-2">
        {(["PF", "PJ"] as const).map((t) => (
          <button key={t} onClick={() => setTipo(t)} className={`px-4 py-1.5 text-xs font-medium rounded-lg border transition-colors ${tipo === t ? "bg-primary text-white border-primary" : "border-border text-muted-foreground hover:bg-muted"}`}>
            {t === "PF" ? "Pessoa Física" : "Pessoa Jurídica"}
          </button>
        ))}
      </div>
      {/* Tabs */}
      <div className="flex gap-0 border-b border-border">
        {tabs.map((t, i) => (
          <button key={t} onClick={() => setTab(i)} className={`text-xs px-4 py-2 border-b-2 font-medium transition-colors ${tab === i ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>{t}</button>
        ))}
      </div>
      {tab === 0 && (
        <div className="space-y-4">
          <FormSection title="Identificação">
            <div className="grid grid-cols-2 gap-3">
              {tipo === "PJ" ? (
                <>
                  <div className="col-span-2"><Input label="Razão Social" required placeholder="Nome da empresa" /></div>
                  <Input label="Nome Fantasia" placeholder="Nome comercial" />
                  <Input label="CNPJ" required placeholder="00.000.000/0000-00" />
                  <Input label="Inscrição Estadual" placeholder="000.000.000.000" />
                  <Input label="Inscrição Municipal" placeholder="00000000" />
                </>
              ) : (
                <>
                  <div className="col-span-2"><Input label="Nome completo" required placeholder="Nome do cliente" /></div>
                  <Input label="CPF" required placeholder="000.000.000-00" />
                  <Input label="RG" placeholder="00.000.000-0" />
                  <Input label="Data de nascimento" type="date" />
                  <Select label="Gênero"><option>Não informado</option><option>Masculino</option><option>Feminino</option><option>Outro</option></Select>
                </>
              )}
            </div>
          </FormSection>
          <FormSection title="Configurações">
            <div className="grid grid-cols-2 gap-3">
              <Select label="Situação"><option>Ativo</option><option>Inativo</option></Select>
              <Select label="Canal de captação"><option>Marketplace</option><option>Loja própria</option><option>Indicação</option><option>Outros</option></Select>
              {tipo === "PJ" && <Select label="Tipo de contribuinte"><option>Contribuinte ICMS</option><option>Não contribuinte</option><option>Isento</option></Select>}
              <Select label="Tabela de preço"><option>Varejo padrão</option><option>Atacado</option><option>Especial</option></Select>
            </div>
            <Textarea label="Observações" placeholder="Informações adicionais sobre o cliente..." />
          </FormSection>
        </div>
      )}
      {tab === 1 && (
        <div className="space-y-4">
          <FormSection title="Endereço Principal">
            <div className="grid grid-cols-3 gap-3">
              <Input label="CEP" required placeholder="00000-000" />
              <div className="col-span-2"><Input label="Logradouro" required placeholder="Rua, Avenida, etc." /></div>
              <Input label="Número" required placeholder="Nº" />
              <div className="col-span-2"><Input label="Complemento" placeholder="Apto, Bloco, Sala..." /></div>
              <div className="col-span-2"><Input label="Bairro" required placeholder="Bairro" /></div>
              <Input label="Cidade" required placeholder="Cidade" />
              <Select label="Estado" required><option value="">UF</option>{ESTADOS.map((e) => <option key={e}>{e}</option>)}</Select>
              <Select label="País"><option>Brasil</option></Select>
            </div>
          </FormSection>
          <FormSection title="Endereço de Entrega (se diferente)">
            <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
              <input type="checkbox" className="rounded" /> Usar o mesmo endereço principal
            </label>
          </FormSection>
        </div>
      )}
      {tab === 2 && (
        <div className="space-y-4">
          <FormSection title="Contatos">
            <div className="grid grid-cols-2 gap-3">
              <Input label="E-mail principal" required type="email" placeholder="email@exemplo.com" />
              <Input label="E-mail secundário" type="email" placeholder="outro@exemplo.com" />
              <Input label="Telefone fixo" placeholder="(00) 0000-0000" />
              <Input label="Celular / WhatsApp" placeholder="(00) 00000-0000" />
              {tipo === "PJ" && <>
                <Input label="Nome do contato" placeholder="Responsável pelo contato" />
                <Input label="Cargo / Departamento" placeholder="Ex: Compras" />
              </>}
            </div>
          </FormSection>
          <FormSection title="Preferências de Comunicação">
            <div className="flex flex-col gap-2">
              {["E-mail", "WhatsApp", "SMS"].map((ch) => (
                <label key={ch} className="flex items-center gap-2 text-xs cursor-pointer">
                  <input type="checkbox" defaultChecked className="rounded" /><span>{ch}</span>
                </label>
              ))}
            </div>
          </FormSection>
        </div>
      )}
      {tab === 3 && (
        <div className="space-y-4">
          <FormSection title="Condições Financeiras">
            <div className="grid grid-cols-2 gap-3">
              <Select label="Condição de pagamento"><option>À vista</option><option>7 dias</option><option>15 dias</option><option>30 dias</option><option>30/60 dias</option><option>30/60/90 dias</option></Select>
              <Select label="Forma de pagamento preferencial"><option>Pix</option><option>Boleto</option><option>Cartão de crédito</option><option>Transferência</option></Select>
              <Input label="Limite de crédito" type="number" placeholder="0,00" />
              <Select label="Desconto máximo permitido"><option>Sem desconto</option><option>5%</option><option>10%</option><option>15%</option><option>Personalizado</option></Select>
            </div>
          </FormSection>
          <FormSection title="Dados Bancários">
            <div className="grid grid-cols-2 gap-3">
              <Select label="Banco"><option>Selecione...</option><option>001 — Banco do Brasil</option><option>033 — Santander</option><option>237 — Bradesco</option><option>341 — Itaú</option><option>077 — Banco Inter</option><option>260 — Nubank</option></Select>
              <Select label="Tipo de conta"><option>Corrente</option><option>Poupança</option></Select>
              <Input label="Agência" placeholder="0000" />
              <Input label="Número da conta" placeholder="00000-0" />
            </div>
          </FormSection>
        </div>
      )}
      <div className="flex justify-between pt-2 border-t border-border">
        <button onClick={onClose} className="text-xs px-4 py-2 border border-border rounded-lg text-muted-foreground hover:bg-muted">Cancelar</button>
        <div className="flex gap-2">
          {tab > 0 && <button onClick={() => setTab(tab - 1)} className="text-xs px-4 py-2 border border-border rounded-lg text-foreground hover:bg-muted flex items-center gap-1"><ArrowLeft size={12} /> Anterior</button>}
          {tab < tabs.length - 1
            ? <button onClick={() => setTab(tab + 1)} className="text-xs px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 flex items-center gap-1">Próximo <ChevronRight size={12} /></button>
            : <button className="text-xs px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 flex items-center gap-1"><Save size={12} /> Salvar cliente</button>
          }
        </div>
      </div>
    </div>
  );
}

function Clientes() {
  const [modal, setModal] = useState(false);
  return (
    <div className="space-y-4">
      <Modal open={modal} onClose={() => setModal(false)} title="Cadastrar Cliente" subtitle="Preencha os dados do cliente" wide>
        <ClienteForm onClose={() => setModal(false)} />
      </Modal>
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-card rounded-xl p-4 border border-border"><p className="text-xs text-muted-foreground">Total de clientes</p><p className="text-2xl font-bold mt-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>1.247</p></div>
        <div className="bg-card rounded-xl p-4 border border-border"><p className="text-xs text-muted-foreground">Ativos</p><p className="text-2xl font-bold text-emerald-600 mt-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>1.189</p></div>
        <div className="bg-card rounded-xl p-4 border border-border"><p className="text-xs text-muted-foreground">Novos (30 dias)</p><p className="text-2xl font-bold text-blue-600 mt-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>89</p></div>
      </div>
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <TableToolbar title="Cadastro de Clientes" count={clientesData.length} onNew={() => setModal(true)} newLabel="Novo Cliente" />
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="text-xs text-muted-foreground bg-muted/40">
              <th className="text-left px-5 py-3 font-medium">Código</th>
              <th className="text-left px-4 py-3 font-medium">Nome / Razão Social</th>
              <th className="text-left px-4 py-3 font-medium hidden md:table-cell">CPF / CNPJ</th>
              <th className="text-left px-4 py-3 font-medium hidden lg:table-cell">E-mail</th>
              <th className="text-left px-4 py-3 font-medium hidden lg:table-cell">Cidade/UF</th>
              <th className="text-right px-4 py-3 font-medium hidden md:table-cell">Compras</th>
              <th className="text-left px-4 py-3 font-medium">Situação</th>
              <th className="px-4 py-3"></th>
            </tr></thead>
            <tbody className="divide-y divide-border">
              {clientesData.map((c) => (
                <tr key={c.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-5 py-3.5 text-xs font-mono text-muted-foreground">{c.id}</td>
                  <td className="px-4 py-3.5">
                    <p className="text-xs font-medium text-foreground">{c.nome}</p>
                    <Badge variant="neutral">{c.tipo}</Badge>
                  </td>
                  <td className="px-4 py-3.5 text-xs font-mono text-muted-foreground hidden md:table-cell">{c.doc}</td>
                  <td className="px-4 py-3.5 text-xs text-muted-foreground hidden lg:table-cell">{c.email}</td>
                  <td className="px-4 py-3.5 text-xs text-muted-foreground hidden lg:table-cell">{c.cidade}/{c.uf}</td>
                  <td className="px-4 py-3.5 text-xs text-right hidden md:table-cell">
                    <p className="font-semibold text-foreground">{c.compras}x</p>
                    <p className="text-muted-foreground">{c.total}</p>
                  </td>
                  <td className="px-4 py-3.5"><Badge variant={c.situacao === "ativo" ? "success" : "neutral"}>{c.situacao === "ativo" ? "Ativo" : "Inativo"}</Badge></td>
                  <td className="px-4 py-3.5 flex items-center gap-1">
                    <button className="p-1 rounded hover:bg-muted text-muted-foreground"><Eye size={13} /></button>
                    <button className="p-1 rounded hover:bg-muted text-muted-foreground"><Edit3 size={13} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination total={1247} shown={clientesData.length} />
      </div>
    </div>
  );
}

// Produtos
function ProdutoForm({ onClose }: { onClose: () => void }) {
  const [tab, setTab] = useState(0);
  const tabs = ["Dados Básicos", "Preços", "Estoque", "Tributação", "Logística"];
  return (
    <div className="space-y-5">
      <div className="flex gap-0 border-b border-border overflow-x-auto">
        {tabs.map((t, i) => (
          <button key={t} onClick={() => setTab(i)} className={`text-xs px-4 py-2 border-b-2 font-medium whitespace-nowrap transition-colors ${tab === i ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>{t}</button>
        ))}
      </div>
      {tab === 0 && (
        <div className="space-y-4">
          <FormSection title="Identificação">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2"><Input label="Nome do produto" required placeholder="Ex: Teclado Mecânico RGB Gamer" /></div>
              <Input label="Código interno / SKU" placeholder="PRD-0001" />
              <Input label="Código de barras (EAN)" placeholder="7891234567890" />
              <Input label="Código do fabricante" placeholder="REF-12345" />
              <Select label="Categoria" required><option>Periféricos</option><option>Eletrônicos</option><option>Mobiliário</option><option>Áudio</option><option>Escritório</option></Select>
              <Select label="Marca"><option>Selecione...</option><option>HyperX</option><option>Logitech</option><option>Samsung</option><option>LG</option><option>Dell</option></Select>
              <Select label="Unidade de medida"><option>UN</option><option>KG</option><option>CX</option><option>PC</option><option>M</option><option>L</option></Select>
            </div>
            <Textarea label="Descrição" placeholder="Descrição detalhada do produto para marketplaces e site..." />
          </FormSection>
          <FormSection title="Configurações">
            <div className="grid grid-cols-2 gap-3">
              <Select label="Situação"><option>Ativo</option><option>Inativo</option><option>Rascunho</option></Select>
              <Select label="Tipo"><option>Produto simples</option><option>Produto com variação</option><option>Kit / Combo</option><option>Serviço</option></Select>
              <Select label="Fornecedor principal"><option>Eletrônicos Prime Ltda</option><option>Distribuidora Nacional</option><option>Importadora TechBR</option></Select>
            </div>
          </FormSection>
        </div>
      )}
      {tab === 1 && (
        <div className="space-y-4">
          <FormSection title="Preços de Venda">
            <div className="grid grid-cols-2 gap-3">
              <Input label="Preço de custo (R$)" type="number" placeholder="0,00" required />
              <Input label="Preço de venda (R$)" type="number" placeholder="0,00" required />
              <Input label="Margem de lucro (%)" type="number" placeholder="0,00" />
              <Input label="Preço mínimo de venda (R$)" type="number" placeholder="0,00" />
              <Input label="Preço atacado (R$)" type="number" placeholder="0,00" />
              <Input label="Qtd mínima atacado" type="number" placeholder="0" />
            </div>
          </FormSection>
          <FormSection title="Descontos e Promoção">
            <div className="grid grid-cols-2 gap-3">
              <Input label="Desconto máximo (%)" type="number" placeholder="0" />
              <Input label="Preço promocional (R$)" type="number" placeholder="0,00" />
              <Input label="Início promoção" type="date" />
              <Input label="Fim promoção" type="date" />
            </div>
          </FormSection>
        </div>
      )}
      {tab === 2 && (
        <div className="space-y-4">
          <FormSection title="Controle de Estoque">
            <div className="grid grid-cols-2 gap-3">
              <Input label="Estoque atual" type="number" placeholder="0" />
              <Input label="Estoque mínimo (alerta)" type="number" placeholder="0" />
              <Input label="Estoque máximo" type="number" placeholder="0" />
              <Input label="Ponto de ressuprimento" type="number" placeholder="0" />
              <Select label="Local de armazenamento"><option>Galpão principal</option><option>Filial SP</option><option>Fulfillment ML</option></Select>
              <Input label="Posição (prateleira)" placeholder="A-12-C" />
            </div>
          </FormSection>
          <FormSection title="Lote e Validade">
            <div className="grid grid-cols-2 gap-3">
              <Select label="Controle por lote"><option>Não</option><option>Sim</option></Select>
              <Select label="Controle de validade"><option>Não</option><option>Sim</option></Select>
              <Input label="Validade em dias" type="number" placeholder="0" />
            </div>
          </FormSection>
        </div>
      )}
      {tab === 3 && (
        <div className="space-y-4">
          <FormSection title="Classificação Fiscal">
            <div className="grid grid-cols-2 gap-3">
              <Input label="NCM" required placeholder="0000.00.00" />
              <Input label="CEST" placeholder="00.000.00" />
              <Select label="CFOP padrão (saída)" required><option>5.102 — Venda dentro do estado</option><option>6.102 — Venda fora do estado</option><option>5.405 — Venda ICMS ST</option></Select>
              <Select label="Origem do produto"><option>0 — Nacional</option><option>1 — Estrangeiro (import. direta)</option><option>2 — Estrangeiro (adq. no mercado interno)</option></Select>
            </div>
          </FormSection>
          <FormSection title="Impostos">
            <div className="grid grid-cols-3 gap-3">
              <Select label="CST ICMS"><option>00 — Tributado integralmente</option><option>20 — Com redução de base</option><option>40 — Isento</option><option>60 — ST cobrado anteriormente</option></Select>
              <Input label="Alíquota ICMS (%)" type="number" placeholder="12" />
              <Input label="Alíquota IPI (%)" type="number" placeholder="0" />
              <Select label="CST PIS"><option>01 — Operação tributável</option><option>07 — Operação isenta</option></Select>
              <Input label="Alíquota PIS (%)" type="number" placeholder="0,65" />
              <Input label="Alíquota COFINS (%)" type="number" placeholder="3,00" />
            </div>
          </FormSection>
        </div>
      )}
      {tab === 4 && (
        <div className="space-y-4">
          <FormSection title="Dimensões e Peso">
            <div className="grid grid-cols-2 gap-3">
              <Input label="Peso bruto (kg)" type="number" placeholder="0,000" />
              <Input label="Peso líquido (kg)" type="number" placeholder="0,000" />
              <Input label="Comprimento (cm)" type="number" placeholder="0" />
              <Input label="Largura (cm)" type="number" placeholder="0" />
              <Input label="Altura (cm)" type="number" placeholder="0" />
              <Input label="Volumes" type="number" placeholder="1" />
            </div>
          </FormSection>
          <FormSection title="Embalagem">
            <div className="grid grid-cols-2 gap-3">
              <Select label="Tipo de embalagem"><option>Caixa</option><option>Envelope</option><option>Saco</option><option>Tubo</option></Select>
              <Input label="Qtd por embalagem" type="number" placeholder="1" />
            </div>
          </FormSection>
        </div>
      )}
      <div className="flex justify-between pt-2 border-t border-border">
        <button onClick={onClose} className="text-xs px-4 py-2 border border-border rounded-lg text-muted-foreground hover:bg-muted">Cancelar</button>
        <div className="flex gap-2">
          {tab > 0 && <button onClick={() => setTab(tab - 1)} className="text-xs px-4 py-2 border border-border rounded-lg text-foreground hover:bg-muted flex items-center gap-1"><ArrowLeft size={12} /> Anterior</button>}
          {tab < tabs.length - 1
            ? <button onClick={() => setTab(tab + 1)} className="text-xs px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 flex items-center gap-1">Próximo <ChevronRight size={12} /></button>
            : <button className="text-xs px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 flex items-center gap-1"><Save size={12} /> Salvar produto</button>
          }
        </div>
      </div>
    </div>
  );
}

function Produtos() {
  const [modal, setModal] = useState(false);
  return (
    <div className="space-y-4">
      <Modal open={modal} onClose={() => setModal(false)} title="Cadastrar Produto" subtitle="Preencha os dados completos do produto" wide>
        <ProdutoForm onClose={() => setModal(false)} />
      </Modal>
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Total de produtos", value: "248", color: "" },
          { label: "Ativos", value: "231", color: "text-emerald-600" },
          { label: "Inativos", value: "17", color: "text-muted-foreground" },
          { label: "Sem estoque", value: "3", color: "text-red-600" },
        ].map((s) => (
          <div key={s.label} className="bg-card rounded-xl p-4 border border-border">
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className={`text-2xl font-bold mt-1 ${s.color}`} style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{s.value}</p>
          </div>
        ))}
      </div>
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <TableToolbar title="Catálogo de Produtos" count={produtosData.length} onNew={() => setModal(true)} newLabel="Novo Produto" />
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="text-xs text-muted-foreground bg-muted/40">
              <th className="text-left px-5 py-3 font-medium">SKU</th>
              <th className="text-left px-4 py-3 font-medium">Produto</th>
              <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Categoria</th>
              <th className="text-left px-4 py-3 font-medium hidden lg:table-cell">NCM</th>
              <th className="text-right px-4 py-3 font-medium">Custo</th>
              <th className="text-right px-4 py-3 font-medium">Venda</th>
              <th className="text-right px-4 py-3 font-medium hidden md:table-cell">Margem</th>
              <th className="text-right px-4 py-3 font-medium">Estoque</th>
              <th className="text-left px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3"></th>
            </tr></thead>
            <tbody className="divide-y divide-border">
              {produtosData.map((p) => (
                <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-5 py-3.5 text-xs font-mono text-muted-foreground">{p.id}</td>
                  <td className="px-4 py-3.5 text-xs font-medium text-foreground max-w-[180px] truncate">{p.nome}</td>
                  <td className="px-4 py-3.5 text-xs hidden md:table-cell"><Badge>{p.categoria}</Badge></td>
                  <td className="px-4 py-3.5 text-xs font-mono text-muted-foreground hidden lg:table-cell">{p.ncm}</td>
                  <td className="px-4 py-3.5 text-xs text-right text-muted-foreground">{fmtFull(p.custo)}</td>
                  <td className="px-4 py-3.5 text-xs text-right font-semibold">{fmtFull(p.preco)}</td>
                  <td className="px-4 py-3.5 text-xs text-right text-emerald-600 font-medium hidden md:table-cell">{p.margem.toFixed(1)}%</td>
                  <td className="px-4 py-3.5 text-xs text-right font-semibold">
                    <span className={p.estoque <= 5 ? "text-red-600" : p.estoque <= 20 ? "text-amber-600" : "text-foreground"}>{p.estoque}</span>
                  </td>
                  <td className="px-4 py-3.5"><Badge variant={p.situacao === "ativo" ? "success" : "neutral"}>{p.situacao === "ativo" ? "Ativo" : "Inativo"}</Badge></td>
                  <td className="px-4 py-3.5 flex items-center gap-1">
                    <button className="p-1 rounded hover:bg-muted text-muted-foreground"><Eye size={13} /></button>
                    <button className="p-1 rounded hover:bg-muted text-muted-foreground"><Edit3 size={13} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination total={248} shown={produtosData.length} />
      </div>
    </div>
  );
}

// Fornecedores
function FornecedorForm({ onClose }: { onClose: () => void }) {
  return (
    <div className="space-y-5">
      <FormSection title="Dados da Empresa">
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2"><Input label="Razão Social" required placeholder="Nome jurídico do fornecedor" /></div>
          <Input label="Nome Fantasia" placeholder="Nome comercial" />
          <Input label="CNPJ" required placeholder="00.000.000/0000-00" />
          <Input label="Inscrição Estadual" placeholder="000.000.000.000" />
          <Select label="Tipo de fornecedor"><option>Fabricante</option><option>Distribuidor</option><option>Atacadista</option><option>Importador</option></Select>
        </div>
      </FormSection>
      <FormSection title="Endereço">
        <div className="grid grid-cols-3 gap-3">
          <Input label="CEP" required placeholder="00000-000" />
          <div className="col-span-2"><Input label="Logradouro" required placeholder="Rua, Av..." /></div>
          <Input label="Número" placeholder="Nº" />
          <Input label="Complemento" placeholder="Sala, Andar..." />
          <Input label="Bairro" placeholder="Bairro" />
          <div className="col-span-2"><Input label="Cidade" required placeholder="Cidade" /></div>
          <Select label="UF" required><option value="">UF</option>{ESTADOS.map((e) => <option key={e}>{e}</option>)}</Select>
        </div>
      </FormSection>
      <FormSection title="Contatos">
        <div className="grid grid-cols-2 gap-3">
          <Input label="E-mail comercial" required type="email" placeholder="comercial@empresa.com" />
          <Input label="Telefone" placeholder="(00) 0000-0000" />
          <Input label="Nome do vendedor/contato" placeholder="Nome do responsável" />
          <Input label="Celular" placeholder="(00) 00000-0000" />
          <Input label="Site" type="url" placeholder="https://empresa.com.br" />
        </div>
      </FormSection>
      <FormSection title="Condições Comerciais">
        <div className="grid grid-cols-2 gap-3">
          <Select label="Prazo de pagamento"><option>À vista</option><option>7 dias</option><option>14 dias</option><option>21 dias</option><option>28 dias</option><option>30/60 dias</option></Select>
          <Select label="Forma de pagamento"><option>Boleto</option><option>TED</option><option>Pix</option><option>Cheque</option></Select>
          <Input label="Prazo de entrega (dias)" type="number" placeholder="0" />
          <Input label="Pedido mínimo (R$)" type="number" placeholder="0,00" />
        </div>
        <Textarea label="Observações" placeholder="Condições especiais, contatos adicionais..." />
      </FormSection>
      <div className="flex justify-end gap-2 pt-2 border-t border-border">
        <button onClick={onClose} className="text-xs px-4 py-2 border border-border rounded-lg text-muted-foreground hover:bg-muted">Cancelar</button>
        <button className="text-xs px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 flex items-center gap-1"><Save size={12} /> Salvar fornecedor</button>
      </div>
    </div>
  );
}

function Fornecedores() {
  const [modal, setModal] = useState(false);
  return (
    <div className="space-y-4">
      <Modal open={modal} onClose={() => setModal(false)} title="Cadastrar Fornecedor" subtitle="Dados completos do fornecedor" wide>
        <FornecedorForm onClose={() => setModal(false)} />
      </Modal>
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <TableToolbar title="Fornecedores" count={fornecedoresData.length} onNew={() => setModal(true)} newLabel="Novo Fornecedor" />
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="text-xs text-muted-foreground bg-muted/40">
              <th className="text-left px-5 py-3 font-medium">Código</th>
              <th className="text-left px-4 py-3 font-medium">Razão Social</th>
              <th className="text-left px-4 py-3 font-medium hidden md:table-cell">CNPJ</th>
              <th className="text-left px-4 py-3 font-medium hidden lg:table-cell">E-mail</th>
              <th className="text-left px-4 py-3 font-medium hidden lg:table-cell">Cidade/UF</th>
              <th className="text-left px-4 py-3 font-medium">Situação</th>
              <th className="px-4 py-3"></th>
            </tr></thead>
            <tbody className="divide-y divide-border">
              {fornecedoresData.map((f) => (
                <tr key={f.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-5 py-3.5 text-xs font-mono text-muted-foreground">{f.id}</td>
                  <td className="px-4 py-3.5 text-xs font-medium text-foreground">{f.nome}</td>
                  <td className="px-4 py-3.5 text-xs font-mono text-muted-foreground hidden md:table-cell">{f.doc}</td>
                  <td className="px-4 py-3.5 text-xs text-muted-foreground hidden lg:table-cell">{f.email}</td>
                  <td className="px-4 py-3.5 text-xs text-muted-foreground hidden lg:table-cell">{f.cidade}/{f.uf}</td>
                  <td className="px-4 py-3.5"><Badge variant={f.situacao === "ativo" ? "success" : "neutral"}>{f.situacao === "ativo" ? "Ativo" : "Inativo"}</Badge></td>
                  <td className="px-4 py-3.5 flex items-center gap-1">
                    <button className="p-1 rounded hover:bg-muted text-muted-foreground"><Eye size={13} /></button>
                    <button className="p-1 rounded hover:bg-muted text-muted-foreground"><Edit3 size={13} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination total={fornecedoresData.length} shown={fornecedoresData.length} />
      </div>
    </div>
  );
}

// Pedidos / Nova venda
type ItemPedido = { id: string; nome: string; qty: number; preco: number; desconto: number };

function NovoPedidoForm({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(0);
  const [itens, setItens] = useState<ItemPedido[]>([
    { id: "PRD-4424", nome: "Teclado Mecânico HyperX", qty: 1, preco: 459.90, desconto: 0 },
  ]);
  const steps = ["Cliente", "Itens", "Pagamento", "Revisão"];

  const subtotal = itens.reduce((s, i) => s + i.qty * i.preco * (1 - i.desconto / 100), 0);
  const frete = 24.90;
  const total = subtotal + frete;

  function addItem() {
    setItens([...itens, { id: "", nome: "", qty: 1, preco: 0, desconto: 0 }]);
  }
  function removeItem(idx: number) {
    setItens(itens.filter((_, i) => i !== idx));
  }

  return (
    <div className="space-y-5">
      {/* Step indicator */}
      <div className="flex items-center gap-0">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center gap-0 flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold border-2 transition-colors ${i < step ? "bg-primary border-primary text-white" : i === step ? "border-primary text-primary bg-accent" : "border-border text-muted-foreground"}`}>
                {i < step ? <Check size={13} /> : i + 1}
              </div>
              <span className={`text-xs font-medium whitespace-nowrap ${i === step ? "text-primary" : "text-muted-foreground"}`}>{s}</span>
            </div>
            {i < steps.length - 1 && <div className={`flex-1 h-px mx-2 mb-4 ${i < step ? "bg-primary" : "bg-border"}`} />}
          </div>
        ))}
      </div>

      {step === 0 && (
        <div className="space-y-4">
          <FormSection title="Selecionar Cliente">
            <div className="relative mb-2">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input className="w-full text-xs pl-8 pr-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="Buscar por nome, CPF ou CNPJ..." />
            </div>
            <div className="space-y-1.5">
              {clientesData.slice(0, 4).map((c) => (
                <label key={c.id} className="flex items-center gap-3 p-3 border border-border rounded-lg cursor-pointer hover:bg-muted/40 transition-colors has-[:checked]:border-primary has-[:checked]:bg-accent">
                  <input type="radio" name="cliente" className="accent-primary" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-foreground">{c.nome}</p>
                    <p className="text-xs text-muted-foreground">{c.doc} · {c.cidade}/{c.uf}</p>
                  </div>
                  <Badge variant={c.tipo === "PF" ? "neutral" : "info"}>{c.tipo}</Badge>
                </label>
              ))}
            </div>
            <button className="w-full text-xs text-primary text-center py-2 border border-dashed border-primary/40 rounded-lg hover:bg-accent mt-2 flex items-center justify-center gap-1">
              <Plus size={12} /> Cadastrar novo cliente
            </button>
          </FormSection>
          <FormSection title="Detalhes do Pedido">
            <div className="grid grid-cols-2 gap-3">
              <Select label="Canal de venda"><option>Loja própria</option><option>Mercado Livre</option><option>Shopee</option><option>Amazon</option><option>Site próprio</option></Select>
              <Input label="Data do pedido" type="date" defaultValue="2026-07-13" />
              <Input label="Número externo (marketplace)" placeholder="Ref. do pedido externo" />
              <Select label="Vendedor responsável"><option>Ana Mendes</option><option>Bruno Lima</option><option>Carlos Silva</option></Select>
            </div>
          </FormSection>
        </div>
      )}

      {step === 1 && (
        <div className="space-y-4">
          <FormSection title="Itens do Pedido">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead><tr className="text-xs text-muted-foreground bg-muted/40">
                  <th className="text-left px-3 py-2 font-medium">Produto</th>
                  <th className="text-right px-3 py-2 font-medium w-20">Qtd</th>
                  <th className="text-right px-3 py-2 font-medium w-28">Preço unit.</th>
                  <th className="text-right px-3 py-2 font-medium w-20">Desc %</th>
                  <th className="text-right px-3 py-2 font-medium w-28">Subtotal</th>
                  <th className="w-8 px-2"></th>
                </tr></thead>
                <tbody className="divide-y divide-border">
                  {itens.map((item, idx) => (
                    <tr key={idx}>
                      <td className="px-3 py-2">
                        <Select value={item.id} onChange={(e) => {
                          const p = produtosData.find(p => p.id === e.target.value);
                          if (p) { const n = [...itens]; n[idx] = { ...n[idx], id: p.id, nome: p.nome, preco: p.preco }; setItens(n); }
                        }}>
                          <option value="">Selecionar produto...</option>
                          {produtosData.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
                        </Select>
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => { const n = [...itens]; if (n[idx].qty > 1) n[idx] = { ...n[idx], qty: n[idx].qty - 1 }; setItens(n); }} className="w-6 h-6 rounded border border-border flex items-center justify-center hover:bg-muted text-muted-foreground"><Minus size={10} /></button>
                          <span className="text-xs font-medium w-8 text-center">{item.qty}</span>
                          <button onClick={() => { const n = [...itens]; n[idx] = { ...n[idx], qty: n[idx].qty + 1 }; setItens(n); }} className="w-6 h-6 rounded border border-border flex items-center justify-center hover:bg-muted text-muted-foreground"><Plus size={10} /></button>
                        </div>
                      </td>
                      <td className="px-3 py-2"><input type="number" value={item.preco} onChange={(e) => { const n = [...itens]; n[idx] = { ...n[idx], preco: +e.target.value }; setItens(n); }} className="text-xs px-2 py-1.5 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 w-full text-right" /></td>
                      <td className="px-3 py-2"><input type="number" value={item.desconto} min={0} max={100} onChange={(e) => { const n = [...itens]; n[idx] = { ...n[idx], desconto: +e.target.value }; setItens(n); }} className="text-xs px-2 py-1.5 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 w-full text-right" /></td>
                      <td className="px-3 py-2 text-xs font-semibold text-right">{fmtFull(item.qty * item.preco * (1 - item.desconto / 100))}</td>
                      <td className="px-2 py-2"><button onClick={() => removeItem(idx)} className="p-1 rounded hover:bg-muted text-muted-foreground"><Trash2 size={12} /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button onClick={addItem} className="w-full text-xs text-primary py-2 border border-dashed border-primary/40 rounded-lg hover:bg-accent flex items-center justify-center gap-1 mt-2">
              <Plus size={12} /> Adicionar item
            </button>
          </FormSection>
          <div className="bg-muted/40 rounded-lg p-4 space-y-1.5">
            <div className="flex justify-between text-xs text-muted-foreground"><span>Subtotal</span><span>{fmtFull(subtotal)}</span></div>
            <div className="flex justify-between text-xs text-muted-foreground"><span>Frete</span><span>{fmtFull(frete)}</span></div>
            <div className="flex justify-between text-xs font-semibold text-foreground border-t border-border pt-1.5"><span>Total</span><span>{fmtFull(total)}</span></div>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <FormSection title="Forma de Pagamento">
            <div className="grid grid-cols-2 gap-2">
              {["Pix", "Boleto Bancário", "Cartão de Crédito", "Cartão de Débito", "Dinheiro", "Transferência"].map((f) => (
                <label key={f} className="flex items-center gap-2 p-3 border border-border rounded-lg cursor-pointer hover:bg-muted/40 has-[:checked]:border-primary has-[:checked]:bg-accent">
                  <input type="radio" name="pagamento" className="accent-primary" defaultChecked={f === "Pix"} />
                  <span className="text-xs font-medium">{f}</span>
                </label>
              ))}
            </div>
          </FormSection>
          <FormSection title="Parcelamento">
            <div className="grid grid-cols-2 gap-3">
              <Select label="Condição de pagamento"><option>À vista</option><option>2x sem juros</option><option>3x sem juros</option><option>6x sem juros</option><option>12x com juros</option></Select>
              <Select label="Conta bancária"><option>Conta Corrente BB — 1234-5</option><option>Conta Inter — 9876-4</option><option>Conta Digital Olist</option></Select>
              <Input label="Vencimento" type="date" defaultValue="2026-07-13" />
              <Input label="Desconto adicional (%)" type="number" placeholder="0" />
            </div>
          </FormSection>
          <FormSection title="Entrega">
            <div className="grid grid-cols-2 gap-3">
              <Select label="Modalidade de entrega"><option>Sedex</option><option>PAC</option><option>Transportadora</option><option>Retirada na loja</option><option>Motoboy</option></Select>
              <Input label="Prazo estimado (dias úteis)" type="number" placeholder="3" />
              <Input label="Código de rastreio" placeholder="AA000000000BR" />
              <Select label="Endereço de entrega"><option>Endereço do cadastro</option><option>Outro endereço</option></Select>
            </div>
          </FormSection>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <div className="bg-accent rounded-lg p-4 border border-primary/20">
            <div className="flex items-center gap-2 mb-3"><Check size={16} className="text-primary" /><p className="text-sm font-semibold text-foreground" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Resumo do pedido</p></div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between"><span className="text-muted-foreground">Cliente</span><span className="font-medium">Mariana Oliveira</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Canal</span><span className="font-medium">Loja própria</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Itens</span><span className="font-medium">{itens.length} produto(s)</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Pagamento</span><span className="font-medium">Pix — À vista</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Entrega</span><span className="font-medium">Sedex — 3 dias úteis</span></div>
              <div className="flex justify-between border-t border-primary/20 pt-2"><span className="text-muted-foreground font-semibold">Total</span><span className="font-bold text-primary text-sm">{fmtFull(total)}</span></div>
            </div>
          </div>
          <FormSection title="Ações pós-criação">
            <div className="space-y-2">
              {["Gerar NF-e automaticamente", "Enviar confirmação por e-mail ao cliente", "Separar para expedição imediatamente"].map((opt) => (
                <label key={opt} className="flex items-center gap-2 text-xs cursor-pointer">
                  <input type="checkbox" defaultChecked className="rounded accent-primary" />
                  <span>{opt}</span>
                </label>
              ))}
            </div>
          </FormSection>
          <Textarea label="Observações internas" placeholder="Notas internas sobre este pedido (não visível ao cliente)..." />
        </div>
      )}

      <div className="flex justify-between pt-2 border-t border-border">
        <button onClick={onClose} className="text-xs px-4 py-2 border border-border rounded-lg text-muted-foreground hover:bg-muted">Cancelar</button>
        <div className="flex gap-2">
          {step > 0 && <button onClick={() => setStep(step - 1)} className="text-xs px-4 py-2 border border-border rounded-lg text-foreground hover:bg-muted flex items-center gap-1"><ArrowLeft size={12} /> Anterior</button>}
          {step < steps.length - 1
            ? <button onClick={() => setStep(step + 1)} className="text-xs px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 flex items-center gap-1">Próximo <ChevronRight size={12} /></button>
            : <button className="text-xs px-5 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 flex items-center gap-1 font-medium"><Check size={13} /> Confirmar pedido</button>
          }
        </div>
      </div>
    </div>
  );
}

function Pedidos() {
  const [filter, setFilter] = useState("todos");
  const [modal, setModal] = useState(false);
  const filters = ["todos", "processando", "separacao", "transito", "entregue", "cancelado"];
  const filtered = filter === "todos" ? ordersData : ordersData.filter((o) => o.status === filter);

  return (
    <div className="space-y-4">
      <Modal open={modal} onClose={() => setModal(false)} title="Novo Pedido de Venda" subtitle="Crie um pedido passo a passo" wide>
        <NovoPedidoForm onClose={() => setModal(false)} />
      </Modal>
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Total hoje", value: "127", color: "" },
          { label: "Processando", value: "14", color: "text-amber-600" },
          { label: "Em trânsito", value: "38", color: "text-blue-600" },
          { label: "Entregues", value: "71", color: "text-emerald-600" },
        ].map((s) => (
          <div key={s.label} className="bg-card rounded-xl p-4 border border-border">
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className={`text-2xl font-bold mt-1 ${s.color}`} style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{s.value}</p>
          </div>
        ))}
      </div>
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <TableToolbar title="Pedidos de Venda" count={ordersData.length} onNew={() => setModal(true)} newLabel="Novo Pedido" />
        <div className="px-5 pt-3 pb-0 flex gap-1.5 border-b border-border overflow-x-auto">
          {filters.map((f) => {
            const label = f === "todos" ? "Todos" : (statusConfig[f as keyof typeof statusConfig]?.label ?? f);
            return (
              <button key={f} onClick={() => setFilter(f)} className={`text-xs px-3 py-2 rounded-t-lg font-medium capitalize whitespace-nowrap transition-colors ${filter === f ? "border-b-2 border-primary text-primary bg-accent" : "text-muted-foreground hover:text-foreground"}`}>{label}</button>
            );
          })}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="text-xs text-muted-foreground bg-muted/40">
              <th className="text-left px-5 py-3 font-medium">Pedido</th>
              <th className="text-left px-4 py-3 font-medium">Cliente</th>
              <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Produto</th>
              <th className="text-left px-4 py-3 font-medium hidden lg:table-cell">Canal</th>
              <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Pagamento</th>
              <th className="text-right px-4 py-3 font-medium">Valor</th>
              <th className="text-left px-4 py-3 font-medium">Status</th>
              <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Data</th>
              <th className="px-4 py-3"></th>
            </tr></thead>
            <tbody className="divide-y divide-border">
              {filtered.map((o) => {
                const s = statusConfig[o.status as keyof typeof statusConfig];
                return (
                  <tr key={o.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-3.5 text-xs font-mono text-muted-foreground">{o.id}</td>
                    <td className="px-4 py-3.5 text-xs font-medium">{o.cliente}</td>
                    <td className="px-4 py-3.5 text-xs text-muted-foreground hidden md:table-cell max-w-[160px] truncate">{o.produto}</td>
                    <td className="px-4 py-3.5 text-xs hidden lg:table-cell"><Badge>{o.canal}</Badge></td>
                    <td className="px-4 py-3.5 text-xs text-muted-foreground hidden md:table-cell">{o.pagamento}</td>
                    <td className="px-4 py-3.5 text-xs font-semibold text-right">{fmtFull(o.valor)}</td>
                    <td className="px-4 py-3.5"><Badge variant={s.variant}><s.icon size={10} />{s.label}</Badge></td>
                    <td className="px-4 py-3.5 text-xs text-muted-foreground hidden md:table-cell">{o.data}</td>
                    <td className="px-4 py-3.5"><button className="p-1 rounded hover:bg-muted text-muted-foreground"><MoreHorizontal size={14} /></button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <Pagination total={ordersData.length} shown={filtered.length} />
      </div>
    </div>
  );
}

// Estoque
function Estoque() {
  const stockData = [
    { sku: "PRD-4421", produto: "Kit Organizador Escritório", estoque: 142, minimo: 50, custo: 62, preco: 189.9, status: "ok" },
    { sku: "PRD-4422", produto: "Cadeira Gamer Pro X", estoque: 18, minimo: 20, custo: 430, preco: 1249, status: "baixo" },
    { sku: "PRD-4423", produto: 'Monitor 27" IPS 144Hz', estoque: 7, minimo: 15, custo: 980, preco: 2890, status: "critico" },
    { sku: "PRD-4424", produto: "Teclado Mecânico HyperX", estoque: 89, minimo: 30, custo: 148, preco: 459.9, status: "ok" },
    { sku: "PRD-4425", produto: "Fone Bluetooth ANC Pro", estoque: 56, minimo: 25, custo: 122, preco: 379, status: "ok" },
    { sku: "PRD-4426", produto: "Webcam Full HD 1080p", estoque: 4, minimo: 20, custo: 71, preco: 219.9, status: "critico" },
  ];
  const stockStatusConfig = { ok: { label: "Normal", variant: "success" as const }, baixo: { label: "Baixo", variant: "warning" as const }, critico: { label: "Crítico", variant: "danger" as const } };
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-card rounded-xl p-4 border border-border"><p className="text-xs text-muted-foreground">Total SKUs</p><p className="text-2xl font-bold mt-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>248</p></div>
        <div className="bg-amber-50 rounded-xl p-4 border border-amber-200"><p className="text-xs text-amber-700">Estoque baixo</p><p className="text-2xl font-bold text-amber-700 mt-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>14</p></div>
        <div className="bg-red-50 rounded-xl p-4 border border-red-200"><p className="text-xs text-red-700">Crítico / Zerado</p><p className="text-2xl font-bold text-red-700 mt-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>3</p></div>
      </div>
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <TableToolbar title="Controle de Estoque" subtitle="Atualizado em 13/07/2026">
          <button className="flex items-center gap-1.5 text-xs px-3 py-2 border border-border rounded-lg bg-background text-muted-foreground hover:bg-muted"><RefreshCw size={12} /> Sincronizar</button>
          <button className="flex items-center gap-1.5 text-xs px-3 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"><Plus size={13} /> Entrada</button>
        </TableToolbar>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="text-xs text-muted-foreground bg-muted/40">
              <th className="text-left px-5 py-3 font-medium">SKU</th>
              <th className="text-left px-4 py-3 font-medium">Produto</th>
              <th className="text-right px-4 py-3 font-medium">Em estoque</th>
              <th className="text-right px-4 py-3 font-medium hidden md:table-cell">Mínimo</th>
              <th className="text-right px-4 py-3 font-medium hidden lg:table-cell">Custo unit.</th>
              <th className="text-right px-4 py-3 font-medium">Preço venda</th>
              <th className="text-left px-4 py-3 font-medium">Situação</th>
              <th className="px-4 py-3"></th>
            </tr></thead>
            <tbody className="divide-y divide-border">
              {stockData.map((s) => {
                const cfg = stockStatusConfig[s.status as keyof typeof stockStatusConfig];
                return (
                  <tr key={s.sku} className="hover:bg-muted/30">
                    <td className="px-5 py-3.5 text-xs font-mono text-muted-foreground">{s.sku}</td>
                    <td className="px-4 py-3.5 text-xs font-medium text-foreground">{s.produto}</td>
                    <td className="px-4 py-3.5 text-xs font-semibold text-right"><span className={s.status === "critico" ? "text-red-600" : s.status === "baixo" ? "text-amber-600" : ""}>{s.estoque}</span></td>
                    <td className="px-4 py-3.5 text-xs text-muted-foreground text-right hidden md:table-cell">{s.minimo}</td>
                    <td className="px-4 py-3.5 text-xs text-muted-foreground text-right hidden lg:table-cell">{fmtFull(s.custo)}</td>
                    <td className="px-4 py-3.5 text-xs font-medium text-right">{fmtFull(s.preco)}</td>
                    <td className="px-4 py-3.5"><Badge variant={cfg.variant}>{cfg.label}</Badge></td>
                    <td className="px-4 py-3.5"><button className="p-1 rounded hover:bg-muted text-muted-foreground"><Eye size={13} /></button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Financeiro
function Financeiro() {
  const [tab, setTab] = useState<"lancamentos" | "pagar" | "receber" | "caixa" | "dre">("lancamentos");
  const finTabs = [
    { id: "lancamentos" as const, label: "Lançamentos" },
    { id: "pagar" as const, label: "Contas a Pagar" },
    { id: "receber" as const, label: "Contas a Receber" },
    { id: "caixa" as const, label: "Caixa" },
    { id: "dre" as const, label: "DRE" },
  ];

  const cpPagarStatus = { aberto: { label: "Em aberto", variant: "warning" as const }, pago: { label: "Pago", variant: "success" as const }, vencido: { label: "Vencido", variant: "danger" as const } };
  const crStatus = { aberto: { label: "Em aberto", variant: "info" as const }, recebido: { label: "Recebido", variant: "success" as const }, vencido: { label: "Vencido", variant: "danger" as const } };

  const saldoCaixa = caixaData.reduce((s, e) => e.tipo === "entrada" || e.tipo === "abertura" ? s + e.valor : s - e.valor, 0);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card rounded-xl p-4 border border-border"><p className="text-xs text-muted-foreground">Receita julho</p><p className="text-xl font-bold text-foreground mt-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>R$ 241k</p><p className="text-xs text-emerald-600 flex items-center gap-0.5 mt-1"><TrendingUp size={10} />+18,4%</p></div>
        <div className="bg-card rounded-xl p-4 border border-border"><p className="text-xs text-muted-foreground">Despesas julho</p><p className="text-xl font-bold text-foreground mt-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>R$ 138k</p><p className="text-xs text-red-500 flex items-center gap-0.5 mt-1"><TrendingUp size={10} />+7,8%</p></div>
        <div className="bg-card rounded-xl p-4 border border-border"><p className="text-xs text-muted-foreground">A pagar (30d)</p><p className="text-xl font-bold text-amber-600 mt-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>R$ 17,7k</p><p className="text-xs text-muted-foreground mt-1">5 contas abertas</p></div>
        <div className="bg-card rounded-xl p-4 border border-border"><p className="text-xs text-muted-foreground">A receber (30d)</p><p className="text-xl font-bold text-blue-600 mt-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>R$ 23,8k</p><p className="text-xs text-muted-foreground mt-1">5 cobranças abertas</p></div>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="flex border-b border-border overflow-x-auto">
          {finTabs.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)} className={`text-xs px-5 py-3.5 font-medium whitespace-nowrap border-b-2 transition-colors ${tab === t.id ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>{t.label}</button>
          ))}
        </div>

        {tab === "lancamentos" && (
          <>
            <div className="p-4 border-b border-border flex justify-end gap-2">
              <button className="flex items-center gap-1.5 text-xs px-3 py-2 border border-border rounded-lg bg-background text-muted-foreground hover:bg-muted"><Filter size={12} /> Período</button>
              <button className="flex items-center gap-1.5 text-xs px-3 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"><Plus size={13} /> Lançamento</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead><tr className="text-xs text-muted-foreground bg-muted/40">
                  <th className="text-left px-5 py-3 font-medium">ID</th>
                  <th className="text-left px-4 py-3 font-medium">Descrição</th>
                  <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Categoria</th>
                  <th className="text-right px-4 py-3 font-medium">Valor</th>
                  <th className="text-left px-4 py-3 font-medium">Tipo</th>
                  <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Data</th>
                </tr></thead>
                <tbody className="divide-y divide-border">
                  {[
                    { id: "TXN-2291", descricao: "Venda Mercado Livre #8821", tipo: "entrada", valor: 189.90, data: "13/07/2026", categoria: "Vendas" },
                    { id: "TXN-2290", descricao: "Frete Correios — Lote 44", tipo: "saida", valor: 847.20, data: "13/07/2026", categoria: "Logística" },
                    { id: "TXN-2289", descricao: "Venda Amazon #8820", tipo: "entrada", valor: 1249.00, data: "12/07/2026", categoria: "Vendas" },
                    { id: "TXN-2288", descricao: "Reposição estoque — Monitor", tipo: "saida", valor: 9800.00, data: "12/07/2026", categoria: "Estoque" },
                    { id: "TXN-2287", descricao: "Taxa marketplace Shopee", tipo: "saida", valor: 312.40, data: "11/07/2026", categoria: "Taxas" },
                    { id: "TXN-2286", descricao: "Venda Loja própria #8818", tipo: "entrada", valor: 459.90, data: "11/07/2026", categoria: "Vendas" },
                  ].map((t) => (
                    <tr key={t.id} className="hover:bg-muted/30">
                      <td className="px-5 py-3.5 text-xs font-mono text-muted-foreground">{t.id}</td>
                      <td className="px-4 py-3.5 text-xs font-medium">{t.descricao}</td>
                      <td className="px-4 py-3.5 text-xs hidden md:table-cell"><Badge>{t.categoria}</Badge></td>
                      <td className={`px-4 py-3.5 text-xs font-semibold text-right ${t.tipo === "entrada" ? "text-emerald-600" : "text-red-500"}`}>{t.tipo === "entrada" ? "+" : "−"}{fmtFull(t.valor)}</td>
                      <td className="px-4 py-3.5"><Badge variant={t.tipo === "entrada" ? "success" : "danger"}>{t.tipo === "entrada" ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}{t.tipo === "entrada" ? "Entrada" : "Saída"}</Badge></td>
                      <td className="px-4 py-3.5 text-xs text-muted-foreground hidden md:table-cell">{t.data}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {tab === "pagar" && (
          <>
            <div className="p-4 border-b border-border flex justify-end gap-2">
              <button className="flex items-center gap-1.5 text-xs px-3 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"><Plus size={13} /> Nova conta</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead><tr className="text-xs text-muted-foreground bg-muted/40">
                  <th className="text-left px-5 py-3 font-medium">Cód.</th>
                  <th className="text-left px-4 py-3 font-medium">Descrição</th>
                  <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Fornecedor</th>
                  <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Vencimento</th>
                  <th className="text-right px-4 py-3 font-medium">Valor</th>
                  <th className="text-left px-4 py-3 font-medium hidden lg:table-cell">Categoria</th>
                  <th className="text-left px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3"></th>
                </tr></thead>
                <tbody className="divide-y divide-border">
                  {contasPagarData.map((c) => {
                    const cfg = cpPagarStatus[c.status as keyof typeof cpPagarStatus];
                    return (
                      <tr key={c.id} className="hover:bg-muted/30">
                        <td className="px-5 py-3.5 text-xs font-mono text-muted-foreground">{c.id}</td>
                        <td className="px-4 py-3.5 text-xs font-medium">{c.descricao}</td>
                        <td className="px-4 py-3.5 text-xs text-muted-foreground hidden md:table-cell">{c.fornecedor}</td>
                        <td className={`px-4 py-3.5 text-xs hidden md:table-cell ${c.status === "vencido" ? "text-red-600 font-medium" : "text-muted-foreground"}`}>{c.vencimento}</td>
                        <td className="px-4 py-3.5 text-xs font-semibold text-right">{fmtFull(c.valor)}</td>
                        <td className="px-4 py-3.5 text-xs hidden lg:table-cell"><Badge>{c.categoria}</Badge></td>
                        <td className="px-4 py-3.5"><Badge variant={cfg.variant}>{cfg.label}</Badge></td>
                        <td className="px-4 py-3.5">{c.status !== "pago" && <button className="text-xs px-2 py-1 bg-primary text-white rounded hover:bg-primary/90">Pagar</button>}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}

        {tab === "receber" && (
          <>
            <div className="p-4 border-b border-border flex justify-end gap-2">
              <button className="flex items-center gap-1.5 text-xs px-3 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"><Plus size={13} /> Nova cobrança</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead><tr className="text-xs text-muted-foreground bg-muted/40">
                  <th className="text-left px-5 py-3 font-medium">Cód.</th>
                  <th className="text-left px-4 py-3 font-medium">Descrição</th>
                  <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Cliente</th>
                  <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Vencimento</th>
                  <th className="text-right px-4 py-3 font-medium">Valor</th>
                  <th className="text-left px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3"></th>
                </tr></thead>
                <tbody className="divide-y divide-border">
                  {contasReceberData.map((c) => {
                    const cfg = crStatus[c.status as keyof typeof crStatus];
                    return (
                      <tr key={c.id} className="hover:bg-muted/30">
                        <td className="px-5 py-3.5 text-xs font-mono text-muted-foreground">{c.id}</td>
                        <td className="px-4 py-3.5 text-xs font-medium">{c.descricao}</td>
                        <td className="px-4 py-3.5 text-xs text-muted-foreground hidden md:table-cell">{c.cliente}</td>
                        <td className="px-4 py-3.5 text-xs text-muted-foreground hidden md:table-cell">{c.vencimento}</td>
                        <td className="px-4 py-3.5 text-xs font-semibold text-right text-emerald-600">{fmtFull(c.valor)}</td>
                        <td className="px-4 py-3.5"><Badge variant={cfg.variant}>{cfg.label}</Badge></td>
                        <td className="px-4 py-3.5 flex items-center gap-1">
                          {c.status !== "recebido" && <>
                            <button className="text-xs px-2 py-1 bg-emerald-600 text-white rounded hover:bg-emerald-700">Receber</button>
                            <button className="p-1 rounded hover:bg-muted text-muted-foreground"><Send size={12} /></button>
                          </>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}

        {tab === "caixa" && (
          <div className="p-5">
            <div className="grid grid-cols-3 gap-4 mb-5">
              <div className="bg-muted/40 rounded-lg p-4 text-center border border-border">
                <p className="text-xs text-muted-foreground">Saldo atual</p>
                <p className="text-2xl font-bold text-emerald-600 mt-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{fmtFull(saldoCaixa)}</p>
              </div>
              <div className="bg-muted/40 rounded-lg p-4 text-center border border-border">
                <p className="text-xs text-muted-foreground">Total entradas</p>
                <p className="text-xl font-bold text-foreground mt-1">{fmtFull(caixaData.filter(e => e.tipo === "entrada" || e.tipo === "abertura").reduce((s, e) => s + e.valor, 0))}</p>
              </div>
              <div className="bg-muted/40 rounded-lg p-4 text-center border border-border">
                <p className="text-xs text-muted-foreground">Total saídas</p>
                <p className="text-xl font-bold text-foreground mt-1">{fmtFull(caixaData.filter(e => e.tipo === "saida").reduce((s, e) => s + e.valor, 0))}</p>
              </div>
            </div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-foreground" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Movimentações de hoje</p>
              <div className="flex gap-2">
                <button className="flex items-center gap-1.5 text-xs px-3 py-2 border border-border rounded-lg text-muted-foreground hover:bg-muted"><Plus size={12} /> Sangria</button>
                <button className="flex items-center gap-1.5 text-xs px-3 py-2 border border-border rounded-lg text-muted-foreground hover:bg-muted"><Plus size={12} /> Suprimento</button>
                <button className="flex items-center gap-1.5 text-xs px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"><X size={12} /> Fechar caixa</button>
              </div>
            </div>
            <div className="space-y-1.5">
              {caixaData.map((e, i) => (
                <div key={i} className={`flex items-center justify-between px-4 py-3 rounded-lg border ${e.tipo === "entrada" ? "bg-emerald-50 border-emerald-100" : e.tipo === "abertura" ? "bg-blue-50 border-blue-100" : "bg-red-50 border-red-100"}`}>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-muted-foreground w-12">{e.hora}</span>
                    <span className="text-xs font-medium text-foreground">{e.descricao}</span>
                  </div>
                  <span className={`text-xs font-semibold ${e.tipo === "entrada" || e.tipo === "abertura" ? "text-emerald-600" : "text-red-600"}`}>
                    {e.tipo === "saida" ? "−" : "+"}{fmtFull(e.valor)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "dre" && (
          <div className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-semibold text-foreground" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Demonstração do Resultado — Julho 2026</p>
                <p className="text-xs text-muted-foreground">Competência 07/2026</p>
              </div>
              <div className="flex gap-2">
                <Select className="text-xs"><option>Julho 2026</option><option>Junho 2026</option><option>Maio 2026</option></Select>
                <button className="flex items-center gap-1.5 text-xs px-3 py-2 border border-border rounded-lg text-muted-foreground hover:bg-muted"><Download size={12} /> PDF</button>
                <button className="flex items-center gap-1.5 text-xs px-3 py-2 border border-border rounded-lg text-muted-foreground hover:bg-muted"><Printer size={12} /> Imprimir</button>
              </div>
            </div>
            <div className="space-y-0 border border-border rounded-lg overflow-hidden">
              {dreData.map((row, i) => (
                <div key={i} className={`flex items-center justify-between px-4 py-2.5 border-b border-border last:border-0 ${row.tipo === "total" ? "bg-primary/5 border-t-2 border-t-primary/20" : row.tipo === "subtotal" ? "bg-muted/50" : row.nivel === 2 ? "pl-10" : ""}`}>
                  <span className={`text-xs ${row.tipo === "total" ? "font-bold text-primary" : row.tipo === "subtotal" ? "font-semibold text-foreground" : row.nivel === 2 ? "text-muted-foreground pl-4" : "text-foreground"}`}>{row.conta}</span>
                  <span className={`text-xs font-medium tabular-nums ${row.tipo === "total" ? "font-bold text-primary text-sm" : row.valor < 0 ? "text-red-600" : row.tipo === "subtotal" ? "font-semibold text-foreground" : "text-foreground"}`}>{row.valor < 0 ? "−" : ""}{fmtFull(Math.abs(row.valor))}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// NF-e placeholder
function NotasFiscais() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "NF-e emitidas (mês)", value: "312", color: "" },
          { label: "Autorizadas", value: "308", color: "text-emerald-600" },
          { label: "Rejeitadas", value: "4", color: "text-red-600" },
          { label: "Canceladas", value: "2", color: "text-amber-600" },
        ].map((s) => (
          <div key={s.label} className="bg-card rounded-xl p-4 border border-border">
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className={`text-2xl font-bold mt-1 ${s.color}`} style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{s.value}</p>
          </div>
        ))}
      </div>
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <TableToolbar title="Notas Fiscais Eletrônicas" subtitle="NF-e e NFC-e emitidas">
          <button className="flex items-center gap-1.5 text-xs px-3 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"><Plus size={13} /> Emitir NF-e</button>
        </TableToolbar>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="text-xs text-muted-foreground bg-muted/40">
              <th className="text-left px-5 py-3 font-medium">Número</th>
              <th className="text-left px-4 py-3 font-medium">Chave de acesso</th>
              <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Destinatário</th>
              <th className="text-left px-4 py-3 font-medium hidden md:table-cell">CFOP</th>
              <th className="text-right px-4 py-3 font-medium">Valor</th>
              <th className="text-left px-4 py-3 font-medium">Status</th>
              <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Emissão</th>
              <th className="px-4 py-3"></th>
            </tr></thead>
            <tbody className="divide-y divide-border">
              {[
                { num: "000.312", chave: "43260712345678000199550010003120011234567890", dest: "Mariana Oliveira", cfop: "5.102", valor: 189.90, status: "autorizada", data: "13/07/2026" },
                { num: "000.311", chave: "43260712345678000199550010003110021234567891", dest: "Carlos Mendes", cfop: "5.102", valor: 1249.00, status: "autorizada", data: "13/07/2026" },
                { num: "000.310", chave: "43260712345678000199550010003100031234567892", dest: "Fernanda Costa", cfop: "6.102", valor: 2890.00, status: "autorizada", data: "12/07/2026" },
                { num: "000.309", chave: "43260712345678000199550010003090041234567893", dest: "Global Atacado S.A.", cfop: "5.102", valor: 8440.00, status: "cancelada", data: "11/07/2026" },
                { num: "000.308", chave: "43260712345678000199550010003080051234567894", dest: "Bruno Alves", cfop: "5.102", valor: 219.90, status: "autorizada", data: "11/07/2026" },
              ].map((n) => (
                <tr key={n.num} className="hover:bg-muted/30">
                  <td className="px-5 py-3.5 text-xs font-mono font-medium">{n.num}</td>
                  <td className="px-4 py-3.5 text-xs font-mono text-muted-foreground max-w-[140px] truncate hidden lg:table-cell">{n.chave.substring(0, 20)}...</td>
                  <td className="px-4 py-3.5 text-xs font-medium hidden md:table-cell">{n.dest}</td>
                  <td className="px-4 py-3.5 text-xs text-muted-foreground hidden md:table-cell">{n.cfop}</td>
                  <td className="px-4 py-3.5 text-xs font-semibold text-right">{fmtFull(n.valor)}</td>
                  <td className="px-4 py-3.5"><Badge variant={n.status === "autorizada" ? "success" : n.status === "cancelada" ? "danger" : "warning"}>{n.status.charAt(0).toUpperCase() + n.status.slice(1)}</Badge></td>
                  <td className="px-4 py-3.5 text-xs text-muted-foreground hidden md:table-cell">{n.data}</td>
                  <td className="px-4 py-3.5 flex items-center gap-1">
                    <button className="p-1 rounded hover:bg-muted text-muted-foreground"><Download size={12} /></button>
                    <button className="p-1 rounded hover:bg-muted text-muted-foreground"><Printer size={12} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination total={312} shown={5} />
      </div>
    </div>
  );
}

// ─── Nav ──────────────────────────────────────────────────────────────────────

type Module = "dashboard" | "pedidos" | "clientes" | "produtos" | "fornecedores" | "estoque" | "financeiro" | "fiscal" | "relatorios" | "configuracoes";

const navGroups = [
  {
    label: "Principal",
    items: [
      { id: "dashboard" as Module, label: "Dashboard", icon: LayoutDashboard },
    ],
  },
  {
    label: "Vendas",
    items: [
      { id: "pedidos" as Module, label: "Pedidos", icon: ShoppingCart, badge: "12" },
    ],
  },
  {
    label: "Cadastros",
    items: [
      { id: "clientes" as Module, label: "Clientes", icon: Users },
      { id: "produtos" as Module, label: "Produtos", icon: Package },
      { id: "fornecedores" as Module, label: "Fornecedores", icon: Building2 },
    ],
  },
  {
    label: "Operações",
    items: [
      { id: "estoque" as Module, label: "Estoque", icon: Warehouse, badge: "3" },
      { id: "fiscal" as Module, label: "Notas Fiscais", icon: FileText },
    ],
  },
  {
    label: "Financeiro",
    items: [
      { id: "financeiro" as Module, label: "Financeiro", icon: DollarSign },
      { id: "relatorios" as Module, label: "Relatórios", icon: BarChart3 },
    ],
  },
  {
    label: "Sistema",
    items: [
      { id: "configuracoes" as Module, label: "Configurações", icon: Settings },
    ],
  },
];

// ─── App ─────────────────────────────────────────────────────────────────────

export default function App() {
  const [active, setActive] = useState<Module>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const allItems = navGroups.flatMap((g) => g.items);
  const activeItem = allItems.find((i) => i.id === active)!;

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
      case "relatorios": return (
        <div className="flex flex-col items-center justify-center h-80 gap-4 text-center">
          <div className="w-16 h-16 rounded-2xl bg-accent flex items-center justify-center"><BarChart3 size={28} className="text-primary" /></div>
          <div><p className="text-base font-semibold" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Relatórios e Analytics</p><p className="text-sm text-muted-foreground mt-1">Curva ABC, performance de canais, DRE comparativo.</p></div>
          <button className="text-sm px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90">Gerar relatório</button>
        </div>
      );
      case "configuracoes": return (
        <div className="flex flex-col items-center justify-center h-80 gap-4 text-center">
          <div className="w-16 h-16 rounded-2xl bg-accent flex items-center justify-center"><Settings size={28} className="text-primary" /></div>
          <div><p className="text-base font-semibold" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Configurações do Sistema</p><p className="text-sm text-muted-foreground mt-1">Integrações, usuários, permissões e preferências.</p></div>
          <button className="text-sm px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90">Abrir configurações</button>
        </div>
      );
    }
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden" style={{ fontFamily: "'Inter', sans-serif" }}>
      {sidebarOpen && <div className="fixed inset-0 bg-black/40 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-30 w-56 flex flex-col transition-transform duration-200 ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`} style={{ backgroundColor: "var(--sidebar)" }}>
        <div className="px-4 pt-5 pb-3 flex items-center justify-between border-b border-white/8">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-sm" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>O</span>
            </div>
            <div>
              <p className="text-white text-sm font-semibold leading-none" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>OlistERP</p>
              <p className="text-xs mt-0.5 opacity-50" style={{ color: "var(--sidebar-foreground)" }}>v3.0 — Vendas</p>
            </div>
          </div>
          <button className="lg:hidden" onClick={() => setSidebarOpen(false)}><X size={15} style={{ color: "var(--sidebar-foreground)" }} /></button>
        </div>

        {/* Store */}
        <div className="mx-3 my-2 px-3 py-2 rounded-lg cursor-pointer flex items-center justify-between" style={{ backgroundColor: "var(--sidebar-accent)" }}>
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-6 h-6 rounded bg-primary/80 flex items-center justify-center flex-shrink-0"><span className="text-white text-xs font-bold">TL</span></div>
            <div className="min-w-0">
              <p className="text-xs font-medium truncate" style={{ color: "var(--sidebar-accent-foreground)" }}>Tech Lab Store</p>
              <p className="text-xs opacity-50 truncate" style={{ color: "var(--sidebar-foreground)", fontSize: "10px" }}>CNPJ 12.345.678/0001</p>
            </div>
          </div>
          <ChevronDown size={11} style={{ color: "var(--sidebar-foreground)", opacity: 0.5 }} />
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 overflow-y-auto space-y-3 py-2">
          {navGroups.map((group) => (
            <div key={group.label}>
              <p className="text-xs font-medium px-2 pb-1 uppercase tracking-widest" style={{ color: "var(--sidebar-foreground)", opacity: 0.35, fontSize: "10px" }}>{group.label}</p>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const isActive = active === item.id;
                  return (
                    <button key={item.id} onClick={() => { setActive(item.id); setSidebarOpen(false); }}
                      className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg transition-all"
                      style={{ backgroundColor: isActive ? "var(--sidebar-primary)" : "transparent", color: isActive ? "var(--sidebar-primary-foreground)" : "var(--sidebar-foreground)" }}>
                      <div className="flex items-center gap-2.5"><item.icon size={14} /><span className="text-xs font-medium">{item.label}</span></div>
                      {item.badge && <span className="text-xs px-1.5 py-0.5 rounded-full font-medium" style={{ backgroundColor: isActive ? "rgba(255,255,255,0.2)" : "var(--sidebar-primary)", color: "white", fontSize: "10px" }}>{item.badge}</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* User */}
        <div className="px-3 pb-4 pt-2 border-t border-white/8">
          <div className="px-2.5 py-2.5 rounded-lg flex items-center gap-2.5" style={{ backgroundColor: "var(--sidebar-accent)" }}>
            <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center flex-shrink-0"><span className="text-white text-xs font-bold">AM</span></div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium truncate" style={{ color: "var(--sidebar-accent-foreground)" }}>Ana Mendes</p>
              <p className="text-xs opacity-50 truncate" style={{ color: "var(--sidebar-foreground)", fontSize: "10px" }}>Administrador</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-14 bg-card border-b border-border flex items-center justify-between px-4 lg:px-6 flex-shrink-0">
          <div className="flex items-center gap-3">
            <button className="lg:hidden p-1.5 rounded-lg hover:bg-muted" onClick={() => setSidebarOpen(true)}><Menu size={18} /></button>
            <div>
              <h1 className="text-sm font-semibold text-foreground" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{activeItem.label}</h1>
              <p className="text-xs text-muted-foreground hidden sm:block">13 de julho de 2026</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative hidden md:block">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input className="text-xs pl-8 pr-3 py-1.5 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 w-52" placeholder="Buscar no sistema..." />
            </div>
            <button className="relative p-2 rounded-lg hover:bg-muted">
              <Bell size={16} className="text-muted-foreground" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-primary" />
            </button>
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center ml-1"><span className="text-white text-xs font-bold">AM</span></div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-4">
            <span>Início</span><ChevronRight size={11} /><span className="text-foreground font-medium">{activeItem.label}</span>
          </div>
          {renderModule()}
        </main>
      </div>
    </div>
  );
}
