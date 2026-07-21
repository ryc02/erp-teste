import React, { useState, useEffect } from "react";
import { api } from "../services/api";
import { Badge, Modal, Input, Select, FormSection } from "../components/ui/SharedUI";
import { RefreshCw, Play, Check, Plus, Factory, Wrench, Gauge, ArrowUpRight } from "lucide-react";


export function PcpForm({ onClose, onSave, produtos }: { onClose: () => void; onSave: () => void; produtos: any[]; }) {
  const [saving, setSaving] = useState(false);
  const [produtoId, setProdutoId] = useState("");
  const [quantidadePlanejada, setQuantidadePlanejada] = useState("");
  
  const [feedbackModal, setFeedbackModal] = useState<{ open: boolean; type: "success" | "error" | "warning"; title: string; message: string }>({ open: false, type: "success", title: "", message: "" });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!produtoId || !quantidadePlanejada) { setFeedbackModal({ open: true, type: "warning", title: "Atenção", message: "Preencha os campos obrigatórios." }); return; }
    setSaving(true);
    try {
      await api.post("/pcp/ordens", { produto_id: parseInt(produtoId), quantidade_planejada: parseFloat(quantidadePlanejada) });
      setFeedbackModal({ open: true, type: "success", title: "Sucesso", message: "Ordem de Produção criada!" });
      setTimeout(() => {
          onSave();
      }, 1500);
    } catch (err: any) {
      setFeedbackModal({ open: true, type: "error", title: "Erro", message: err?.message || "Erro ao criar Ordem de Produção." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormSection title="Dados da Ordem de Produção (OP)">
        <div className="grid grid-cols-2 gap-4">
          <Select label="Produto a Produzir *" name="produto_id" value={produtoId} onChange={e => setProdutoId(e.target.value)} required>
            <option value="">Selecione...</option>
            {produtos.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
          </Select>
          <Input label="Quantidade Planejada *" name="quantidade_planejada" type="number" step="0.01" value={quantidadePlanejada} onChange={e => setQuantidadePlanejada(e.target.value)} required />
        </div>
      </FormSection>
      <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-border">
        <button type="button" className="px-4 py-2 text-sm text-muted-foreground hover:bg-muted rounded-lg" onClick={onClose} disabled={saving}>Cancelar</button>
        <button type="submit" className="px-4 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary/90" disabled={saving}>
          {saving ? "Salvando..." : "Criar Ordem"}
        </button>
      </div>

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
                type="button"
                onClick={() => setFeedbackModal({ ...feedbackModal, open: false })}
                className={`px-6 py-2 rounded-lg text-sm font-medium text-white shadow-sm transition-colors ${feedbackModal.type === 'error' ? 'bg-red-600 hover:bg-red-700' : feedbackModal.type === 'warning' ? 'bg-amber-600 hover:bg-amber-700' : 'bg-emerald-600 hover:bg-emerald-700'}`}
            >
                Entendido
            </button>
        </div>
      </Modal>
    </form>
  );
}

export function Pcp() {
  const [modalOP, setModalOP] = useState(false);
  const [ordens, setOrdens] = useState<any[]>([]);
  const [maquinas, setMaquinas] = useState<any[]>([]);
  const [produtos, setProdutos] = useState<any[]>([]);

  const [feedbackModal, setFeedbackModal] = useState<{ open: boolean; type: "success" | "error" | "warning"; title: string; message: string }>({ open: false, type: "success", title: "", message: "" });
  const [confirmModal, setConfirmModal] = useState<{ open: boolean; title: string; message: string; onConfirm: () => void }>({ open: false, title: "", message: "", onConfirm: () => {} });

  async function loadData() {
    try {
      const [opRes, maqRes, prodRes] = await Promise.all([
        api.get<any[]>("/pcp/ordens"),
        api.get<any[]>("/manutencao/maquinas"),
        api.get<any[]>("/vendas/catalogo-produtos").catch(() => [])
      ]);
      setOrdens(opRes);
      setMaquinas(maqRes);
      setProdutos(prodRes);
    } catch (err: any) {
      console.error(err);
    }
  }

  useEffect(() => { loadData(); }, []);

  async function handleIniciar(id: number) {
    setConfirmModal({
        open: true,
        title: "Iniciar OP",
        message: "Tem certeza que deseja iniciar o apontamento para esta OP?",
        onConfirm: async () => {
            setConfirmModal(prev => ({ ...prev, open: false }));
            try { 
                await api.post(`/pcp/ordens/${id}/iniciar`); 
                setFeedbackModal({ open: true, type: "success", title: "Sucesso", message: "Ordem iniciada com sucesso!" });
                loadData(); 
            } catch (err: any) { 
                setFeedbackModal({ open: true, type: "error", title: "Erro", message: err?.message || "Erro ao iniciar OP" });
            }
        }
    });
  }

  const maquinasOperando = maquinas.filter(m => m.status === "OPERANTE");
  const maquinasParadas = maquinas.filter(m => m.status !== "OPERANTE");
  const ordensAndamento = ordens.filter(o => o.status === "EM_ANDAMENTO");
  const ordensPlanejadas = ordens.filter(o => o.status === "PLANEJADA");

  return (
    <div className="space-y-6">
      <Modal open={modalOP} onClose={() => setModalOP(false)} title="Nova Ordem de Produção (OP)" wide>
        <PcpForm onClose={() => setModalOP(false)} onSave={() => { setModalOP(false); loadData(); }} produtos={produtos} />
      </Modal>

      {/* Header Gestão Fábrica */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card p-6 rounded-xl border border-border">
        <div>
          <div className="text-xs text-muted-foreground uppercase font-semibold mb-1 tracking-wider">Módulo Gestão</div>
          <h2 className="text-2xl font-semibold">Gestão Fábrica</h2>
          <p className="text-muted-foreground text-sm mt-1">Painel operacional integrado de máquinas, manutenção e produção.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={loadData} className="px-3 py-2 text-sm font-medium border border-border rounded-lg hover:bg-muted flex items-center gap-2">
            <RefreshCw size={16} /> Atualizar
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Máquinas em Operação */}
        <div className="bg-card rounded-xl border border-border overflow-hidden flex flex-col h-[400px]">
          <div className="p-5 flex justify-between items-center border-b border-border">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-lg">Máquinas em Operação</h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300 text-xs font-bold">{maquinasOperando.length}</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">Equipamentos prontos para operar no momento.</p>
            </div>
          </div>
          <div className="overflow-y-auto flex-1">
            <table className="w-full">
              <thead className="bg-muted/50 sticky top-0 backdrop-blur-sm">
                <tr className="text-xs text-muted-foreground border-b border-border text-left">
                  <th className="px-4 py-3 font-medium">Equipamento</th>
                  <th className="px-4 py-3 font-medium">Tipo</th>
                  <th className="px-4 py-3 font-medium">Capacidade</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {maquinasOperando.length === 0 ? (
                  <tr><td colSpan={4} className="text-center py-8 text-muted-foreground">Nenhuma máquina operando.</td></tr>
                ) : maquinasOperando.map(m => (
                  <tr key={m.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3 text-sm font-medium">{m.nome}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{m.tipo || "—"}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{m.capacidade || "—"}</td>
                    <td className="px-4 py-3"><Badge variant="success">{m.status}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Máquinas Paradas */}
        <div className="bg-card rounded-xl border border-border overflow-hidden flex flex-col h-[400px]">
          <div className="p-5 flex justify-between items-center border-b border-border">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-lg">Máquinas Paradas</h3>
                <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400 text-xs font-bold">{maquinasParadas.length}</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">Equipamentos em manutenção ou inativos.</p>
            </div>
          </div>
          <div className="overflow-y-auto flex-1">
            <table className="w-full">
              <thead className="bg-muted/50 sticky top-0 backdrop-blur-sm">
                <tr className="text-xs text-muted-foreground border-b border-border text-left">
                  <th className="px-4 py-3 font-medium">Equipamento</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {maquinasParadas.length === 0 ? (
                  <tr><td colSpan={2} className="text-center py-8 text-muted-foreground">Nenhuma máquina parada.</td></tr>
                ) : maquinasParadas.map(m => (
                  <tr key={m.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3 text-sm font-medium">{m.nome}</td>
                    <td className="px-4 py-3"><Badge variant="danger">{m.status}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Ordens em Andamento */}
        <div className="bg-card rounded-xl border border-border overflow-hidden flex flex-col h-[400px]">
          <div className="p-5 flex justify-between items-center border-b border-border">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-lg">Ordens / Apontamento Iniciado</h3>
                <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400 text-xs font-bold">{ordensAndamento.length}</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">OPs atualmente na linha de produção.</p>
            </div>
          </div>
          <div className="overflow-y-auto flex-1">
            <table className="w-full">
              <thead className="bg-muted/50 sticky top-0 backdrop-blur-sm">
                <tr className="text-xs text-muted-foreground border-b border-border text-left">
                  <th className="px-4 py-3 font-medium">OP</th>
                  <th className="px-4 py-3 font-medium">Produto</th>
                  <th className="px-4 py-3 font-medium">Planejada</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {ordensAndamento.length === 0 ? (
                  <tr><td colSpan={3} className="text-center py-8 text-muted-foreground">Nenhuma OP com apontamento iniciado.</td></tr>
                ) : ordensAndamento.map(o => (
                  <tr key={o.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3 text-sm font-mono text-muted-foreground">#{o.id}</td>
                    <td className="px-4 py-3 text-sm font-medium">{o.produto?.nome || "—"}</td>
                    <td className="px-4 py-3 text-sm">{o.quantidade_planejada}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Ordens S/ Apontamento */}
        <div className="bg-card rounded-xl border border-border overflow-hidden flex flex-col h-[400px]">
          <div className="p-5 flex justify-between items-center border-b border-border">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-lg">Ordens Planejadas</h3>
                <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 text-xs font-bold">{ordensPlanejadas.length}</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">OPs aguardando início de produção.</p>
            </div>
            <button onClick={() => setModalOP(true)} className="px-3 py-1.5 text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20 rounded-md flex items-center gap-1 transition-colors">
              <Plus size={14} /> Nova OP
            </button>
          </div>
          <div className="overflow-y-auto flex-1">
            <table className="w-full">
              <thead className="bg-muted/50 sticky top-0 backdrop-blur-sm">
                <tr className="text-xs text-muted-foreground border-b border-border text-left">
                  <th className="px-4 py-3 font-medium">OP</th>
                  <th className="px-4 py-3 font-medium">Produto</th>
                  <th className="px-4 py-3 font-medium">Planejada</th>
                  <th className="px-4 py-3 font-medium text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {ordensPlanejadas.length === 0 ? (
                  <tr><td colSpan={4} className="text-center py-8 text-muted-foreground">Nenhuma OP aguardando.</td></tr>
                ) : ordensPlanejadas.map(o => (
                  <tr key={o.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3 text-sm font-mono text-muted-foreground">#{o.id}</td>
                    <td className="px-4 py-3 text-sm font-medium">{o.produto?.nome || "—"}</td>
                    <td className="px-4 py-3 text-sm">{o.quantidade_planejada}</td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => handleIniciar(o.id)} className="text-xs px-2 py-1 bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 hover:bg-emerald-100 rounded flex items-center gap-1 ml-auto">
                        <Play size={12} /> Iniciar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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

export default Pcp;
