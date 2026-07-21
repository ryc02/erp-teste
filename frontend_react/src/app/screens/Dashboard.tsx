import React, { useState, useEffect } from "react";
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
import { api } from "../services/api";

const statusConfig = {
  entregue: { label: "Entregue", variant: "success", icon: CheckCircle },
  processando: { label: "Processando", variant: "warning", icon: Clock },
  cancelado: { label: "Cancelado", variant: "danger", icon: XCircle },
  pendente: { label: "Pendente", variant: "default", icon: Minus },
} as const;

export function Dashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchDashboard = () => {
    setLoading(true);
    setErrorMsg(null);
    api.get("/dashboard/home")
      .then(res => setData(res))
      .catch((err) => {
        console.error(err);
        setErrorMsg(err?.message || "Erro ao carregar dados do dashboard.");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) return <div className="p-10 text-center text-muted-foreground">Carregando dashboard...</div>;
  if (errorMsg || !data) {
    return (
      <div className="p-10 text-center space-y-4">
        <div className="text-red-500 font-medium">{errorMsg || "Erro ao carregar dashboard."}</div>
        <button
          onClick={fetchDashboard}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors inline-flex items-center gap-2 text-sm font-medium"
        >
          <RefreshCw size={16} /> Tentar Novamente
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 fade-in">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Receita do mês", value: data.kpis.receita_mes.value, change: data.kpis.receita_mes.change, pos: data.kpis.receita_mes.pos, icon: DollarSign },
          { label: "Pedidos hoje", value: data.kpis.pedidos_hoje.value, change: data.kpis.pedidos_hoje.change, pos: data.kpis.pedidos_hoje.pos, icon: ShoppingCart },
          { label: "Ticket médio", value: data.kpis.ticket_medio.value, change: data.kpis.ticket_medio.change, pos: data.kpis.ticket_medio.pos, icon: CreditCard },
          { label: "Margem de Lucro", value: data.kpis.margem_lucro.value, change: data.kpis.margem_lucro.change, pos: data.kpis.margem_lucro.pos, icon: TrendingUp },
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
            <AreaChart data={data.revenueData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
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
          <p className="text-sm font-semibold text-foreground mb-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Curva ABC</p>
          <p className="text-xs text-muted-foreground mb-3">Top 5 Produtos Mês</p>
          <ResponsiveContainer width="100%" height={130}>
            <PieChart><Pie data={data.curvaAbcData} cx="50%" cy="50%" innerRadius={38} outerRadius={60} paddingAngle={3} dataKey="value">{data.curvaAbcData.map((e: any, i: number) => <Cell key={i} fill={e.color} />)}</Pie>
              <Tooltip formatter={(v: number) => [fmt(v), ""]} contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid rgba(26,31,54,0.1)" }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-1">{data.curvaAbcData.map((c: any) => (
            <div key={c.name} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 min-w-0"><span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ backgroundColor: c.color }} /><span className="text-muted-foreground truncate">{c.name}</span></div>
              <span className="font-medium flex-shrink-0 ml-2">{fmt(c.value)}</span>
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
          {data.ordersData.length === 0 && <div className="px-5 py-5 text-sm text-muted-foreground text-center">Nenhum pedido recente.</div>}
          {data.ordersData.slice(0, 5).map((o: any) => {
            const s = statusConfig[o.status as keyof typeof statusConfig] || statusConfig.pendente;
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
            <BarChart data={data.dailyOrdersData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
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