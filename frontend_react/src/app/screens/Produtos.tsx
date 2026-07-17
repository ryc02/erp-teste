import React, { useState, useEffect } from "react";
import { api } from "../services/api";
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

export function ProdutoForm({ onClose, onSave }: { onClose: () => void, onSave: (d: any) => void }) {
  const [tab, setTab] = useState(0);
  const tabs = ["Dados Básicos", "Preços", "Estoque", "Tributação", "Logística"];
  
  const [form, setForm] = useState({
    nome: "", sku: "", categoria: "Periféricos", unidade_medida: "UN",
    preco_venda: 0, ncm: "", estoque_medio: 0, tipo_produto: "COMPRADO"
  });

  const handleChange = (field: string, val: any) => setForm(f => ({ ...f, [field]: val }));

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
              <div className="col-span-2"><Input label="Nome do produto" required value={form.nome} onChange={e => handleChange("nome", e.target.value)} /></div>
              <Input label="Código interno / SKU" value={form.sku} onChange={e => handleChange("sku", e.target.value)} />
              <Select label="Categoria" value={form.categoria} onChange={e => handleChange("categoria", e.target.value)}><option>Periféricos</option><option>Eletrônicos</option><option>Mobiliário</option></Select>
              <Select label="Unidade de medida" value={form.unidade_medida} onChange={e => handleChange("unidade_medida", e.target.value)}><option>UN</option><option>KG</option><option>CX</option></Select>
              <Select label="Origem do Produto" value={form.tipo_produto} onChange={e => handleChange("tipo_produto", e.target.value)}>
                <option value="COMPRADO">Comprado (Matéria-prima / Revenda)</option>
                <option value="FABRICADO">Fabricado (Produção Interna)</option>
              </Select>
            </div>
          </FormSection>
        </div>
      )}
      {tab === 1 && (
        <div className="space-y-4">
          <FormSection title="Preços de Venda">
            <div className="grid grid-cols-2 gap-3">
              <Input label="Preço de venda (R$)" type="number" required value={form.preco_venda} onChange={e => handleChange("preco_venda", +e.target.value)} />
            </div>
          </FormSection>
        </div>
      )}
      {tab === 2 && (
        <div className="space-y-4">
          <FormSection title="Controle de Estoque">
            <div className="grid grid-cols-2 gap-3">
              <Input label="Estoque inicial" type="number" value={form.estoque_medio} onChange={e => handleChange("estoque_medio", +e.target.value)} />
            </div>
          </FormSection>
        </div>
      )}
      {tab === 3 && (
        <div className="space-y-4">
          <FormSection title="Classificação Fiscal">
            <div className="grid grid-cols-2 gap-3">
              <Input label="NCM" value={form.ncm} onChange={e => handleChange("ncm", e.target.value)} />
            </div>
          </FormSection>
        </div>
      )}
      {tab === 4 && (
        <div className="space-y-4">
          <FormSection title="Dimensões e Peso">
            <div className="p-4 text-sm text-muted-foreground">Configurações de logística simplificadas para este cadastro rápido.</div>
          </FormSection>
        </div>
      )}
      <div className="flex justify-between pt-2 border-t border-border">
        <button onClick={onClose} className="text-xs px-4 py-2 border border-border rounded-lg text-muted-foreground hover:bg-muted">Cancelar</button>
        <div className="flex gap-2">
          {tab > 0 && <button onClick={() => setTab(tab - 1)} className="text-xs px-4 py-2 border border-border rounded-lg text-foreground hover:bg-muted">Anterior</button>}
          {tab < tabs.length - 1
            ? <button onClick={() => setTab(tab + 1)} className="text-xs px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90">Próximo</button>
            : <button onClick={() => onSave(form)} className="text-xs px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90">Salvar produto</button>
          }
        </div>
      </div>
    </div>
  );
}

export function Produtos() {
  const [modal, setModal] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadData() {
    try {
      const res = await api.get<any[]>("/produtos");
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleSave(formData: any) {
    try {
      await api.post("/produtos", formData);
      setModal(false);
      loadData();
    } catch (err) {
      alert("Erro ao salvar produto");
    }
  }

  return (
    <div className="space-y-4">
      <Modal open={modal} onClose={() => setModal(false)} title="Cadastrar Produto" subtitle="Preencha os dados completos do produto" wide>
        <ProdutoForm onClose={() => setModal(false)} onSave={handleSave} />
      </Modal>
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Total de produtos", value: data.length.toString(), color: "" },
          { label: "Ativos", value: data.filter((p: any) => p.ativo !== false).length.toString(), color: "text-emerald-600" },
          { label: "Inativos", value: data.filter((p: any) => p.ativo === false).length.toString(), color: "text-muted-foreground" },
          { label: "Sem estoque", value: data.filter((p: any) => p.estoque_medio <= 0).length.toString(), color: "text-red-600" },
        ].map((s) => (
          <div key={s.label} className="bg-card rounded-xl p-4 border border-border">
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className={`text-2xl font-bold mt-1 ${s.color}`} style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{s.value}</p>
          </div>
        ))}
      </div>
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <TableToolbar title="Catálogo de Produtos" count={data.length} onNew={() => setModal(true)} newLabel="Novo Produto" />
        <div className="overflow-x-auto min-h-[300px]">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">Carregando produtos...</div>
          ) : (
            <table className="w-full">
              <thead><tr className="text-xs text-muted-foreground bg-muted/40 border-b border-border">
                <th className="text-left px-5 py-3 font-medium">SKU</th>
                <th className="text-left px-4 py-3 font-medium">Produto</th>
                <th className="text-left px-4 py-3 font-medium">Origem</th>
                <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Categoria</th>
                <th className="text-left px-4 py-3 font-medium hidden lg:table-cell">NCM</th>
                <th className="text-right px-4 py-3 font-medium">Venda</th>
                <th className="text-right px-4 py-3 font-medium">Estoque</th>
                <th className="px-4 py-3"></th>
              </tr></thead>
              <tbody className="divide-y divide-border">
                {data.map((p) => (
                  <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-3.5 text-xs font-mono text-muted-foreground">{p.sku}</td>
                    <td className="px-4 py-3.5 text-xs font-medium text-foreground max-w-[180px] truncate">{p.nome}</td>
                    <td className="px-4 py-3.5 text-xs">
                      <span className={`px-2 py-1 rounded-md ${p.tipo_produto === "FABRICADO" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-700"}`}>
                        {p.tipo_produto === "FABRICADO" ? "Fabricado" : "Comprado"}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-xs hidden md:table-cell"><Badge>{p.categoria}</Badge></td>
                    <td className="px-4 py-3.5 text-xs font-mono text-muted-foreground hidden lg:table-cell">{p.ncm || '-'}</td>
                    <td className="px-4 py-3.5 text-xs text-right font-semibold">{fmtFull(p.preco_venda || 0)}</td>
                    <td className="px-4 py-3.5 text-xs text-right font-semibold">
                      <span className={p.estoque_medio <= 0 ? "text-red-600" : "text-foreground"}>{p.estoque_medio || 0}</span>
                    </td>
                    <td className="px-4 py-3.5 flex items-center justify-end gap-1">
                      <button className="p-1.5 rounded-md hover:bg-muted text-muted-foreground"><Edit3 size={14} /></button>
                      <button onClick={async () => {
                          if (confirm('Excluir?')) {
                            await api.delete(`/produtos/${p.id}`);
                            loadData();
                          }
                      }} className="p-1.5 rounded-md hover:bg-red-500/10 text-red-500"><Trash2 size={14} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
