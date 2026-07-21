import React, { useState } from "react";
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
import { useLocalData } from "../hooks/useLocalData";

export function Financeiro() {
  const [tab, setTab] = useState<"lancamentos" | "pagar" | "receber" | "caixa" | "dre">("lancamentos");
  const [contas, setContas] = useState<any[]>([]);
  const [dre, setDre] = useState<any>(null);
  const [caixa, setCaixa] = useState<any>({ saldo: 0, extrato: [] });
  const [loading, setLoading] = useState(true);
  const [categorias, setCategorias] = useState<any[]>([]);

  // Modals state
  const [modalNovaConta, setModalNovaConta] = useState(false);
  const [formNovaConta, setFormNovaConta] = useState({ tipo: "PAGAR", descricao: "", valor: 0, data_vencimento: "", categoria_id: "" });
  
  const [modalBaixa, setModalBaixa] = useState<{open: boolean, contaId?: number, tipo?: string, valorOriginal?: number}>({open: false});
  const [formBaixa, setFormBaixa] = useState({ data_pagamento: new Date().toISOString().split('T')[0], valor_pago: 0 });

  const loadData = async () => {
    setLoading(true);
    try {
      const [resContas, resDre, resCaixa, resCategorias] = await Promise.all([
        api.get("/financeiro/contas"),
        api.get("/financeiro/dre"),
        api.get("/financeiro/caixa"),
        api.get("/financeiro/categorias")
      ]);
      setContas(resContas as any[]);
      setDre(resDre as any);
      setCaixa(resCaixa as any);
      setCategorias(resCategorias as any[]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    loadData();
  }, []);

  const contasPagar = contas.filter(c => c.tipo === "PAGAR");
  const contasReceber = contas.filter(c => c.tipo === "RECEBER");
  
  const currentList = tab === "pagar" ? contasPagar : tab === "receber" ? contasReceber : contas;
  const { page, setPage, totalPages, paginatedData } = useLocalData(currentList, 10);

  const openBaixaModal = (c: any) => {
    setFormBaixa({ data_pagamento: new Date().toISOString().split('T')[0], valor_pago: c.valor });
    setModalBaixa({ open: true, contaId: c.id, tipo: c.tipo, valorOriginal: c.valor });
  };

  const handlePagarConta = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        status: "PAGO",
        data_pagamento: formBaixa.data_pagamento ? new Date(formBaixa.data_pagamento).toISOString() : new Date().toISOString(),
        valor_pago: formBaixa.valor_pago
      };
      await api.put(`/financeiro/contas/${modalBaixa.contaId}/status`, payload);
      setModalBaixa({ open: false });
      loadData();
    } catch (err) {
      alert("Erro ao baixar conta.");
    }
  };

  const handleCreateConta = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...formNovaConta,
        data_vencimento: new Date(formNovaConta.data_vencimento).toISOString(),
        categoria_id: formNovaConta.categoria_id ? parseInt(formNovaConta.categoria_id) : null
      };
      await api.post("/financeiro/contas", payload);
      setModalNovaConta(false);
      loadData();
    } catch (err) {
      alert("Erro ao criar conta.");
    }
  };

  const finTabs = [
    { id: "lancamentos" as const, label: "Lançamentos" },
    { id: "pagar" as const, label: "Contas a Pagar" },
    { id: "receber" as const, label: "Contas a Receber" },
    { id: "caixa" as const, label: "Caixa" },
    { id: "dre" as const, label: "DRE" },
  ];

  const cpPagarStatus = { PENDENTE: { label: "Em aberto", variant: "warning" as const }, PAGO: { label: "Pago", variant: "success" as const }, CANCELADO: { label: "Cancelado", variant: "danger" as const } };
  const crStatus = { PENDENTE: { label: "Em aberto", variant: "info" as const }, RECEBIDO: { label: "Recebido", variant: "success" as const }, CANCELADO: { label: "Cancelado", variant: "danger" as const }, PAGO: { label: "Recebido", variant: "success" as const } };

  return (
    <div className="space-y-4 fade-in">
      <Modal open={modalBaixa.open} onClose={() => setModalBaixa({ open: false })} title={`Confirmar ${modalBaixa.tipo === "RECEBER" ? "Recebimento" : "Pagamento"}`}>
        <form onSubmit={handlePagarConta} className="space-y-4">
          <Input type="date" label="Data Efetiva" value={formBaixa.data_pagamento} onChange={e => setFormBaixa({...formBaixa, data_pagamento: e.target.value})} required />
          <Input type="number" step="0.01" label="Valor (R$)" value={formBaixa.valor_pago} onChange={e => setFormBaixa({...formBaixa, valor_pago: parseFloat(e.target.value) || 0})} required />
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setModalBaixa({ open: false })} className="px-4 py-2 text-sm text-muted-foreground hover:bg-muted rounded-lg">Cancelar</button>
            <button type="submit" className="px-4 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary/90">Confirmar Baixa</button>
          </div>
        </form>
      </Modal>

      <Modal open={modalNovaConta} onClose={() => setModalNovaConta(false)} title={`Nova Conta a ${formNovaConta.tipo === "RECEBER" ? "Receber" : "Pagar"}`}>
        <form onSubmit={handleCreateConta} className="space-y-4">
          <Input label="Descrição" value={formNovaConta.descricao} onChange={e => setFormNovaConta({...formNovaConta, descricao: e.target.value})} required />
          <div className="grid grid-cols-2 gap-4">
            <Input type="number" step="0.01" label="Valor (R$)" value={formNovaConta.valor} onChange={e => setFormNovaConta({...formNovaConta, valor: parseFloat(e.target.value) || 0})} required />
            <Input type="date" label="Data de Vencimento" value={formNovaConta.data_vencimento} onChange={e => setFormNovaConta({...formNovaConta, data_vencimento: e.target.value})} required />
          </div>
          <Select label="Categoria" value={formNovaConta.categoria_id} onChange={e => setFormNovaConta({...formNovaConta, categoria_id: e.target.value})}>
            <option value="">Nenhuma / Sem categoria</option>
            {categorias.filter(c => c.tipo === "AMBOS" || c.tipo === (formNovaConta.tipo === "RECEBER" ? "RECEITA" : "DESPESA")).map(c => (
              <option key={c.id} value={c.id}>{c.descricao}</option>
            ))}
          </Select>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setModalNovaConta(false)} className="px-4 py-2 text-sm text-muted-foreground hover:bg-muted rounded-lg">Cancelar</button>
            <button type="submit" className="px-4 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary/90">Salvar Conta</button>
          </div>
        </form>
      </Modal>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card rounded-xl p-4 border border-border"><p className="text-xs text-muted-foreground">Receita mês (Estimada)</p><p className="text-xl font-bold text-foreground mt-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{dre?.receita_liquida ? fmtFull(dre.receita_liquida) : "R$ 0,00"}</p></div>
        <div className="bg-card rounded-xl p-4 border border-border"><p className="text-xs text-muted-foreground">Despesas mês (Estimada)</p><p className="text-xl font-bold text-foreground mt-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{dre?.despesas_operacionais ? fmtFull(dre.despesas_operacionais) : "R$ 0,00"}</p></div>
        <div className="bg-card rounded-xl p-4 border border-border"><p className="text-xs text-muted-foreground">A pagar (pendente)</p><p className="text-xl font-bold text-amber-600 mt-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{fmtFull(contasPagar.filter(c => c.status === "PENDENTE").reduce((a, b) => a + b.valor, 0))}</p></div>
        <div className="bg-card rounded-xl p-4 border border-border"><p className="text-xs text-muted-foreground">A receber (pendente)</p><p className="text-xl font-bold text-blue-600 mt-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{fmtFull(contasReceber.filter(c => c.status === "PENDENTE").reduce((a, b) => a + b.valor, 0))}</p></div>
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
                  {paginatedData.map((t: any) => (
                    <tr key={t.id} className="hover:bg-muted/30">
                      <td className="px-5 py-3.5 text-xs font-mono text-muted-foreground">#{t.id}</td>
                      <td className="px-4 py-3.5 text-xs font-medium">{t.descricao}</td>
                      <td className="px-4 py-3.5 text-xs hidden md:table-cell"><Badge>{t.categoria_nome || "Sem categoria"}</Badge></td>
                      <td className={`px-4 py-3.5 text-xs font-semibold text-right ${t.tipo === "RECEBER" ? "text-emerald-600" : "text-red-500"}`}>{t.tipo === "RECEBER" ? "+" : "−"}{fmtFull(t.valor)}</td>
                      <td className="px-4 py-3.5"><Badge variant={t.tipo === "RECEBER" ? "success" : "danger"}>{t.tipo === "RECEBER" ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}{t.tipo === "RECEBER" ? "Receber" : "Pagar"}</Badge></td>
                      <td className="px-4 py-3.5 text-xs text-muted-foreground hidden md:table-cell">{t.data_vencimento ? new Date(t.data_vencimento).toLocaleDateString() : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination total={contas.length} shown={paginatedData.length} page={page} totalPages={totalPages} onPageChange={setPage} />
          </>
        )}

        {tab === "pagar" && (
          <>
            <div className="p-4 border-b border-border flex justify-end gap-2">
              <button onClick={() => { setFormNovaConta({...formNovaConta, tipo: "PAGAR", descricao: "", valor: 0, data_vencimento: "", categoria_id: ""}); setModalNovaConta(true); }} className="flex items-center gap-1.5 text-xs px-3 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"><Plus size={13} /> Nova conta</button>
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
                  {paginatedData.map((c: any) => {
                    const cfg = cpPagarStatus[c.status as keyof typeof cpPagarStatus] || { label: c.status, variant: "default" };
                    return (
                      <tr key={c.id} className="hover:bg-muted/30">
                        <td className="px-5 py-3.5 text-xs font-mono text-muted-foreground">{c.id}</td>
                        <td className="px-4 py-3.5 text-xs font-medium">{c.descricao}</td>
                        <td className="px-4 py-3.5 text-xs text-muted-foreground hidden md:table-cell">—</td>
                        <td className="px-4 py-3.5 text-xs text-muted-foreground hidden md:table-cell">{c.data_vencimento ? new Date(c.data_vencimento).toLocaleDateString() : '—'}</td>
                        <td className="px-4 py-3.5 text-xs font-semibold text-right">{fmtFull(c.valor)}</td>
                        <td className="px-4 py-3.5 text-xs hidden lg:table-cell"><Badge>{c.categoria_nome || "Sem Categoria"}</Badge></td>
                        <td className="px-4 py-3.5"><Badge variant={cfg.variant as any}>{cfg.label}</Badge></td>
                        <td className="px-4 py-3.5">{c.status === "PENDENTE" && <button onClick={() => openBaixaModal(c)} className="text-xs px-2 py-1 bg-primary text-white rounded hover:bg-primary/90">Dar Baixa</button>}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <Pagination total={contasPagar.length} shown={paginatedData.length} page={page} totalPages={totalPages} onPageChange={setPage} />
          </>
        )}

        {tab === "receber" && (
          <>
            <div className="p-4 border-b border-border flex justify-end gap-2">
              <button onClick={() => { setFormNovaConta({...formNovaConta, tipo: "RECEBER", descricao: "", valor: 0, data_vencimento: "", categoria_id: ""}); setModalNovaConta(true); }} className="flex items-center gap-1.5 text-xs px-3 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"><Plus size={13} /> Nova cobrança</button>
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
                  {paginatedData.map((c: any) => {
                    const cfg = crStatus[c.status as keyof typeof crStatus] || { label: c.status, variant: "default" };
                    return (
                      <tr key={c.id} className="hover:bg-muted/30">
                        <td className="px-5 py-3.5 text-xs font-mono text-muted-foreground">{c.id}</td>
                        <td className="px-4 py-3.5 text-xs font-medium">{c.descricao}</td>
                        <td className="px-4 py-3.5 text-xs text-muted-foreground hidden md:table-cell">{c.cliente_nome || "—"}</td>
                        <td className="px-4 py-3.5 text-xs text-muted-foreground hidden md:table-cell">{c.data_vencimento ? new Date(c.data_vencimento).toLocaleDateString() : '—'}</td>
                        <td className="px-4 py-3.5 text-xs font-semibold text-right text-emerald-600">{fmtFull(c.valor)}</td>
                        <td className="px-4 py-3.5"><Badge variant={cfg.variant as any}>{cfg.label}</Badge></td>
                        <td className="px-4 py-3.5 flex items-center gap-1">
                          {c.status === "PENDENTE" && <>
                            <button onClick={() => openBaixaModal(c)} className="text-xs px-2 py-1 bg-emerald-600 text-white rounded hover:bg-emerald-700">Receber</button>
                            <button className="p-1 rounded hover:bg-muted text-muted-foreground"><Send size={12} /></button>
                          </>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <Pagination total={contasReceber.length} shown={paginatedData.length} page={page} totalPages={totalPages} onPageChange={setPage} />
          </>
        )}

        {tab === "caixa" && (
          <div className="p-5">
            <div className="grid grid-cols-3 gap-4 mb-5">
              <div className="bg-muted/40 rounded-lg p-4 text-center border border-border">
                <p className="text-xs text-muted-foreground">Saldo atual</p>
                <p className="text-2xl font-bold text-emerald-600 mt-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{fmtFull(caixa.saldo)}</p>
              </div>
              <div className="bg-muted/40 rounded-lg p-4 text-center border border-border">
                <p className="text-xs text-muted-foreground">Total entradas</p>
                <p className="text-xl font-bold text-foreground mt-1">{fmtFull(contasReceber.filter(c => c.status === "RECEBIDO" || c.status === "PAGO").reduce((s, c) => s + c.valor, 0))}</p>
              </div>
              <div className="bg-muted/40 rounded-lg p-4 text-center border border-border">
                <p className="text-xs text-muted-foreground">Total saídas</p>
                <p className="text-xl font-bold text-foreground mt-1">{fmtFull(contasPagar.filter(c => c.status === "PAGO").reduce((s, c) => s + c.valor, 0))}</p>
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
              {caixa.extrato.map((e: any, i: number) => (
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
              {dre?.linhas && dre.linhas.map((row: any, i: number) => (
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