import React, { useState, useEffect } from "react";
import { api } from "../services/api";
import { RefreshCw, Plus, Minus, Search, ShoppingCart } from "lucide-react";
import { Badge, Input, Select, Textarea, Modal, TableToolbar, fmtFull, Pagination } from "../components/ui/SharedUI";
import { SugestaoComprasModal } from "./SugestaoComprasModal";
import { useAuth } from "../hooks/useAuth";

export function Estoque() {
  const { user } = useAuth();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  // Modal de Movimentação
  const [modal, setModal] = useState(false);
  const [suprimentosModal, setSuprimentosModal] = useState(false);
  const [movForm, setMovForm] = useState({
    produto_id: "",
    tipo: "ENTRADA",
    quantidade: 1,
    observacao: ""
  });
  const [saving, setSaving] = useState(false);

  const [feedbackModal, setFeedbackModal] = useState<{ open: boolean; type: "success" | "error" | "warning"; title: string; message: string }>({ open: false, type: "success", title: "", message: "" });

  async function loadData() {
    try {
      setLoading(true);
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

  async function handleMovimentacao(e: React.FormEvent) {
    e.preventDefault();
    if (!movForm.produto_id) {
      setFeedbackModal({ open: true, type: "warning", title: "Atenção", message: "Selecione um produto." });
      return;
    }
    setSaving(true);
    try {
      await api.post("/movimentacoes", {
        produto_id: parseInt(movForm.produto_id),
        tipo: movForm.tipo,
        quantidade: movForm.quantidade,
        observacao: movForm.observacao,
        usuario: user?.nome_completo || user?.username || "Sistema",
        origem: "Ajuste Manual"
      });
      setModal(false);
      setMovForm({ produto_id: "", tipo: "ENTRADA", quantidade: 1, observacao: "" });
      setFeedbackModal({ open: true, type: "success", title: "Sucesso", message: "Movimentação registrada com sucesso!" });
      loadData();
    } catch (err: any) {
      setFeedbackModal({ open: true, type: "error", title: "Erro", message: err?.message || "Erro ao registrar movimentação" });
    } finally {
      setSaving(false);
    }
  }

  const filtered = data.filter(p => 
    p.nome?.toLowerCase().includes(search.toLowerCase()) || 
    p.sku?.toLowerCase().includes(search.toLowerCase())
  );

  const ITEMS_PER_PAGE = 20;
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const totalSkus = data.length;
  const baixo = data.filter(p => p.estoque_atual > 0 && p.estoque_atual <= p.estoque_minimo).length;
  const critico = data.filter(p => p.estoque_atual <= 0).length;

  return (
    <div className="space-y-4">
      <SugestaoComprasModal open={suprimentosModal} onClose={() => setSuprimentosModal(false)} produtos={data} />
      {/* Modal de Movimentação */}
      <Modal open={modal} onClose={() => setModal(false)} title="Nova Movimentação" subtitle="Entrada ou Saída Manual">
        <form onSubmit={handleMovimentacao} className="space-y-4">
          <Select 
            label="Produto" 
            value={movForm.produto_id} 
            onChange={e => setMovForm({...movForm, produto_id: e.target.value})}
            required
          >
            <option value="">Selecione o produto...</option>
            {data.map(p => (
              <option key={p.id} value={p.id}>{p.sku} - {p.nome} (Estoque: {p.estoque_atual})</option>
            ))}
          </Select>
          
          <div className="grid grid-cols-2 gap-4">
            <Select 
              label="Tipo de Movimentação" 
              value={movForm.tipo} 
              onChange={e => setMovForm({...movForm, tipo: e.target.value})}
            >
              <option value="ENTRADA">Entrada (+)</option>
              <option value="SAIDA">Saída (-)</option>
            </Select>
            <Input 
              label="Quantidade" 
              type="number" 
              min={0.01} 
              step="any"
              required 
              value={movForm.quantidade} 
              onChange={e => setMovForm({...movForm, quantidade: parseFloat(e.target.value) || 0})} 
            />
          </div>

          <Textarea 
            label="Observação / Justificativa" 
            value={movForm.observacao} 
            onChange={e => setMovForm({...movForm, observacao: e.target.value})} 
          />

          <div className="flex justify-end gap-2 pt-4">
            <button type="button" onClick={() => setModal(false)} className="px-4 py-2 text-sm border rounded-lg text-muted-foreground hover:bg-muted">Cancelar</button>
            <button type="submit" disabled={saving} className="px-4 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary/90">
              {saving ? "Salvando..." : "Confirmar Movimentação"}
            </button>
          </div>
        </form>
      </Modal>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-card rounded-xl p-4 border border-border">
          <p className="text-xs text-muted-foreground">Total SKUs</p>
          <p className="text-2xl font-bold mt-1">{totalSkus}</p>
        </div>
        <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
          <p className="text-xs text-amber-700">Estoque baixo</p>
          <p className="text-2xl font-bold text-amber-700 mt-1">{baixo}</p>
        </div>
        <div className="bg-red-50 rounded-xl p-4 border border-red-200">
          <p className="text-xs text-red-700">Crítico / Zerado</p>
          <p className="text-2xl font-bold text-red-700 mt-1">{critico}</p>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <TableToolbar 
          title="Controle de Estoque" 
          subtitle="Posição atual" 
          count={filtered.length}
          search={search}
          onSearch={(val) => { setSearch(val); setPage(1); }}
        >
          <button onClick={loadData} className="flex items-center gap-1.5 text-xs px-3 py-2 border border-border rounded-lg bg-background text-muted-foreground hover:bg-muted">
            <RefreshCw size={12} /> Sincronizar
          </button>
          <button onClick={() => setSuprimentosModal(true)} className="flex items-center gap-1.5 text-xs px-3 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">
            <ShoppingCart size={13} /> Necessidades de Compra
          </button>
          <button onClick={() => setModal(true)} className="flex items-center gap-1.5 text-xs px-3 py-2 bg-primary text-white rounded-lg hover:bg-primary/90">
            <Plus size={13} /> Movimentação
          </button>
        </TableToolbar>
        
        <div className="overflow-x-auto min-h-[300px]">
          {loading ? (
             <div className="p-8 text-center text-muted-foreground">Carregando estoque...</div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="text-xs text-muted-foreground bg-muted/40">
                  <th className="text-left px-5 py-3 font-medium">SKU</th>
                  <th className="text-left px-4 py-3 font-medium">Produto</th>
                  <th className="text-left px-4 py-3 font-medium hidden lg:table-cell">Origem</th>
                  <th className="text-right px-4 py-3 font-medium">Em estoque</th>
                  <th className="text-right px-4 py-3 font-medium hidden md:table-cell">Mínimo</th>
                  <th className="text-right px-4 py-3 font-medium">Preço venda</th>
                  <th className="text-left px-4 py-3 font-medium">Situação</th>
                  <th className="text-right px-4 py-3 font-medium w-16"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {paginated.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-8 text-muted-foreground">Nenhum produto encontrado.</td></tr>
                ) : (
                  paginated.map((s) => {
                    let statusObj: { label: string; variant: "success" | "danger" | "warning"; colorCls: string } = { label: "Normal", variant: "success", colorCls: "text-foreground" };
                    if (s.estoque_atual <= 0) {
                      statusObj = { label: "Crítico", variant: "danger", colorCls: "text-red-600" };
                    } else if (s.estoque_atual <= s.estoque_minimo) {
                      statusObj = { label: "Baixo", variant: "warning", colorCls: "text-amber-600" };
                    }

                    return (
                      <tr key={s.id} className="hover:bg-muted/30">
                        <td className="px-5 py-3.5 text-xs font-mono text-muted-foreground">{s.sku}</td>
                        <td className="px-4 py-3.5 text-xs font-medium text-foreground">
                          <div className="text-xs font-medium max-w-[180px] truncate">{s.nome}</div>
                          {s.categoria && <div className="text-[10px] text-muted-foreground mt-0.5">{s.categoria}</div>}
                        </td>
                        <td className="px-4 py-3 hidden lg:table-cell">
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-md ${s.tipo_produto === "Fabricado" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-700"}`}>
                            {s.tipo_produto === "Variacao" ? "Com variações" : s.tipo_produto === "Materia-Prima" ? "Matéria-prima" : s.tipo_produto === "COMPRADO" ? "Simples" : s.tipo_produto === "FABRICADO" ? "Fabricado" : s.tipo_produto || "Simples"}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-xs font-semibold text-right">
                          <span className={statusObj.colorCls}>{s.estoque_atual} {s.unidade_medida}</span>
                        </td>
                        <td className="px-4 py-3.5 text-xs text-muted-foreground text-right hidden md:table-cell">{s.estoque_minimo}</td>
                        <td className="px-4 py-3.5 text-xs font-medium text-right">{fmtFull(s.preco_venda)}</td>
                        <td className="px-4 py-3.5"><Badge variant={statusObj.variant}>{statusObj.label}</Badge></td>
                        <td className="px-4 py-3.5 text-right">
                          <button
                            onClick={() => {
                              setMovForm({ produto_id: s.id.toString(), tipo: "ENTRADA", quantidade: 1, observacao: "" });
                              setModal(true);
                            }}
                            className="p-1.5 text-muted-foreground hover:bg-primary/10 hover:text-primary rounded-md transition-colors"
                            title="Ajustar Estoque"
                          >
                            <RefreshCw size={14} />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          )}
        </div>
        {!loading && totalPages > 1 && (
          <Pagination total={filtered.length} shown={paginated.length} page={page} totalPages={totalPages} onPageChange={setPage} />
        )}
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
    </div>
  );
}