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

export function ProdutoForm({ initialData, onClose, onSave }: { initialData?: any, onClose: () => void, onSave: (d: any) => void }) {
  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(!!initialData);
  const [catalogo, setCatalogo] = useState<any[]>([]);
  
  const [form, setForm] = useState(initialData || {
    nome: "", sku: "", categoria: "Periféricos", unidade_medida: "UN",
    preco_venda: 0, ncm: "", estoque_medio: 0, tipo_produto: "Simples",
    itens_kit: [], peso_liquido: 0, peso_bruto: 0
  });

  useEffect(() => {
    async function loadData() {
      if (initialData?.id) {
        try {
          const res = await api.get<any>(`/produtos/${initialData.id}`);
          setForm((prev: any) => ({ ...prev, ...res, itens_kit: res.itens_kit || [] }));
        } catch (e) { console.error(e); }
      }
      try {
        const catRes = await api.get<any[]>('/produtos/catalogo?status=ativos');
        setCatalogo(catRes);
      } catch (e) { console.error(e); }
      setLoading(false);
    }
    loadData();
  }, [initialData]);

  const baseTabs = ["Dados Básicos", "Preços", "Estoque", "Tributação", "Logística"];
  const tabs = form.tipo_produto === "Kit" ? [...baseTabs, "Composição (Kit)"] : baseTabs;

  const handleChange = (field: string, val: any) => setForm((f: any) => ({ ...f, [field]: val }));

  return (
    <div className="space-y-5 relative">
      {loading && <div className="absolute inset-0 bg-background/50 flex items-center justify-center z-10">Carregando...</div>}
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
              <Select label="Tipo de Produto" value={form.tipo_produto} onChange={e => handleChange("tipo_produto", e.target.value)}>
                <option value="Simples">Simples</option>
                <option value="Kit">Kit</option>
                <option value="Variacao">Com variações</option>
                <option value="Fabricado">Fabricado</option>
                <option value="Materia-Prima">Matéria-prima</option>
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
            <div className="grid grid-cols-2 gap-3">
              <Input label="Peso Líquido (KG)" type="number" value={form.peso_liquido} onChange={e => handleChange("peso_liquido", +e.target.value)} />
              <Input label="Peso Bruto (KG)" type="number" value={form.peso_bruto} onChange={e => handleChange("peso_bruto", +e.target.value)} />
            </div>
            <div className="p-4 mt-2 text-sm text-muted-foreground">Configurações de logística simplificadas para este cadastro rápido.</div>
          </FormSection>
        </div>
      )}
      {tab === 5 && (
        <div className="space-y-4">
          <FormSection title="Itens do Kit">
            <div className="flex gap-2 items-end mb-4">
              <div className="flex-1">
                <Select label="Adicionar Produto" onChange={(e) => {
                  const prodId = parseInt(e.target.value);
                  if (prodId && !form.itens_kit?.find((i: any) => i.produto_id === prodId)) {
                    handleChange("itens_kit", [...(form.itens_kit || []), { produto_id: prodId, quantidade: 1 }]);
                  }
                  e.target.value = "";
                }}>
                  <option value="">Selecione um produto do catálogo...</option>
                  {catalogo.filter(c => c.tipo_produto !== "Kit").map(c => (
                    <option key={c.id} value={c.id}>{c.sku} - {c.nome} (Venda: {fmt(c.preco_venda)})</option>
                  ))}
                </Select>
              </div>
            </div>
            {form.itens_kit?.length > 0 ? (
              <table className="w-full text-left text-sm mb-4">
                <thead><tr className="border-b"><th className="pb-2">Produto</th><th className="pb-2 w-24">Qtd</th><th className="pb-2 w-10"></th></tr></thead>
                <tbody>
                  {form.itens_kit.map((item: any, idx: number) => {
                    const prod = catalogo.find(c => c.id === item.produto_id);
                    return (
                      <tr key={idx} className="border-b border-border/50">
                        <td className="py-2">{prod ? `${prod.sku} - ${prod.nome}` : 'Carregando...'}</td>
                        <td className="py-2">
                          <Input type="number" value={item.quantidade} onChange={e => {
                            const newItens = [...form.itens_kit];
                            newItens[idx].quantidade = +e.target.value;
                            handleChange("itens_kit", newItens);
                          }} />
                        </td>
                        <td className="py-2 text-right">
                          <button className="text-red-500 hover:text-red-700 p-1" onClick={() => {
                            handleChange("itens_kit", form.itens_kit.filter((_: any, i: number) => i !== idx));
                          }}><Trash2 size={16} /></button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div className="text-sm text-muted-foreground mb-4">Nenhum item adicionado ao kit.</div>
            )}
            <div className="flex gap-2">
              <button className="text-xs px-3 py-1.5 border rounded hover:bg-muted" onClick={() => {
                const soma = form.itens_kit?.reduce((acc: number, item: any) => {
                  const p = catalogo.find(c => c.id === item.produto_id);
                  return acc + (p?.preco_venda || 0) * item.quantidade;
                }, 0) || 0;
                handleChange("preco_venda", soma);
              }}>Calcular Preço Sugerido</button>
            </div>
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
  const [editData, setEditData] = useState<any>(null);
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [feedbackModal, setFeedbackModal] = useState<{ open: boolean; type: "success" | "error" | "warning"; title: string; message: string }>({ open: false, type: "success", title: "", message: "" });
  const [confirmModal, setConfirmModal] = useState<{ open: boolean; title: string; message: string; onConfirm: () => void }>({ open: false, title: "", message: "", onConfirm: () => {} });

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
      if (formData.id) {
        await api.put(`/produtos/${formData.id}`, formData);
      } else {
        await api.post("/produtos", formData);
      }
      setModal(false);
      setFeedbackModal({ open: true, type: "success", title: "Sucesso", message: "Produto salvo com sucesso!" });
      loadData();
    } catch (err: any) {
      setFeedbackModal({ open: true, type: "error", title: "Erro", message: err?.message || "Erro ao salvar produto" });
    }
  }

  const handleImprimirZPL = async (id: number) => {
    try {
      const token = localStorage.getItem("venner_jwt");
      const emp = localStorage.getItem("empresa_ativa");
      const headers: any = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;
      if (emp) headers["X-Empresa-Id"] = emp;
      
      const res = await fetch(`http://localhost:8000/api/v1/produtos/${id}/etiqueta`, {
        method: "GET",
        headers
      });
      if (!res.ok) throw new Error("Erro ao gerar etiqueta");
      
      const html = await res.text();
      const newWin = window.open("", "_blank", "width=800,height=600");
      if (newWin) {
        newWin.document.write(html);
        newWin.document.close();
      }
    } catch (err: any) {
      setFeedbackModal({ open: true, type: "error", title: "Erro", message: err?.message || "Erro ao abrir etiqueta" });
    }
  };

  return (
    <div className="space-y-4">
      <Modal open={modal} onClose={() => setModal(false)} title={editData ? "Editar Produto" : "Cadastrar Produto"} subtitle="Preencha os dados completos do produto" wide>
        <ProdutoForm initialData={editData} onClose={() => setModal(false)} onSave={handleSave} />
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
        <TableToolbar title="Catálogo de Produtos" count={data.length} onNew={() => { setEditData(null); setModal(true); }} newLabel="Novo Produto" />
        <div className="overflow-x-auto min-h-[300px]">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">Carregando produtos...</div>
          ) : (
            <table className="w-full">
              <thead><tr className="text-xs text-muted-foreground bg-muted/40 border-b border-border">
                <th className="text-left px-5 py-3 font-medium">SKU</th>
                <th className="text-left px-4 py-3 font-medium">Produto</th>
                <th className="text-left px-4 py-3 font-medium">Tipo</th>
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
                      <span className={`px-2 py-1 rounded-md ${p.tipo_produto === "Fabricado" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-700"}`}>
                        {p.tipo_produto === "Variacao" ? "Com variações" : p.tipo_produto === "Materia-Prima" ? "Matéria-prima" : p.tipo_produto === "COMPRADO" ? "Simples" : p.tipo_produto === "FABRICADO" ? "Fabricado" : p.tipo_produto || "Simples"}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-xs hidden md:table-cell"><Badge>{p.categoria}</Badge></td>
                    <td className="px-4 py-3.5 text-xs font-mono text-muted-foreground hidden lg:table-cell">{p.ncm || '-'}</td>
                    <td className="px-4 py-3.5 text-xs text-right font-semibold">{fmtFull(p.preco_venda || 0)}</td>
                    <td className="px-4 py-3.5 text-xs text-right font-semibold">
                      <span className={p.estoque_medio <= 0 ? "text-red-600" : "text-foreground"}>{p.estoque_medio || 0}</span>
                    </td>
                    <td className="px-4 py-3.5 flex items-center justify-end gap-1">
                      <button onClick={() => handleImprimirZPL(p.id)} title="Imprimir Etiqueta ZPL" className="p-1.5 rounded-md hover:bg-muted text-muted-foreground"><Printer size={14} /></button>
                      <button onClick={() => { setEditData(p); setModal(true); }} className="p-1.5 rounded-md hover:bg-muted text-muted-foreground"><Edit3 size={14} /></button>
                      <button onClick={() => {
                          setConfirmModal({
                              open: true,
                              title: "Excluir Produto",
                              message: `Tem certeza que deseja excluir o produto ${p.nome}?`,
                              onConfirm: async () => {
                                  setConfirmModal(prev => ({ ...prev, open: false }));
                                  try {
                                      await api.delete(`/produtos/${p.id}`);
                                      setFeedbackModal({ open: true, type: "success", title: "Sucesso", message: "Produto excluído!" });
                                      loadData();
                                  } catch (err: any) {
                                      setFeedbackModal({ open: true, type: "error", title: "Erro", message: err?.message || "Erro ao excluir" });
                                  }
                              }
                          });
                      }} className="p-1.5 rounded-md hover:bg-red-500/10 text-red-500"><Trash2 size={14} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal de Feedback */}
      <Modal title={feedbackModal.title} open={feedbackModal.open} onClose={() => setFeedbackModal({ ...feedbackModal, open: false })}>
        <div className="flex items-start gap-4">
            <div className={`mt-1 p-2 rounded-full flex-shrink-0 ${feedbackModal.type === 'error' ? 'bg-red-100 text-red-600' : feedbackModal.type === 'warning' ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'}`}>
                <div className="w-6 h-6 flex items-center justify-center font-bold text-lg">{feedbackModal.type === 'success' ? '✓' : '!'}</div>
            </div>
            <div>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">{feedbackModal.message}</p>
            </div>
        </div>
        <div className="mt-6 flex justify-end">
            <button 
                onClick={() => setFeedbackModal({ ...feedbackModal, open: false })}
                className={`px-6 py-2 rounded-lg text-sm font-medium text-white shadow-sm transition-colors ${feedbackModal.type === 'error' ? 'bg-red-600 hover:bg-red-700' : feedbackModal.type === 'warning' ? 'bg-amber-600 hover:bg-amber-700' : 'bg-emerald-600 hover:bg-emerald-700'}`}
            >
                Entendido
            </button>
        </div>
      </Modal>

      {/* Modal de Confirmação */}
      <Modal title={confirmModal.title} open={confirmModal.open} onClose={() => setConfirmModal({ ...confirmModal, open: false })}>
        <div className="flex items-start gap-4">
            <div className="mt-1 p-2 rounded-full flex-shrink-0 bg-orange-100 text-orange-600">
                <div className="w-6 h-6 flex items-center justify-center font-bold text-lg">!</div>
            </div>
            <div>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">{confirmModal.message}</p>
            </div>
        </div>
        <div className="mt-6 flex justify-end gap-3">
            <button 
                onClick={() => setConfirmModal({ ...confirmModal, open: false })}
                className="px-5 py-2 rounded-lg text-sm font-medium border border-border text-muted-foreground hover:bg-muted transition-colors"
            >
                Cancelar
            </button>
            <button 
                onClick={confirmModal.onConfirm}
                className="px-6 py-2 rounded-lg text-sm font-medium bg-orange-600 hover:bg-orange-700 text-white shadow-sm shadow-orange-600/20 transition-colors"
            >
                Confirmar
            </button>
        </div>
      </Modal>
    </div>
  );
}
