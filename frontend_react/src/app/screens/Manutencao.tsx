import React, { useState, useEffect } from "react";
import { api } from "../services/api";
import { Badge, Modal, Input, Select, FormSection } from "../components/ui/SharedUI";
import { Trash2, Check, Plus, Wrench, Factory } from "lucide-react";

export function NovaMaquinaForm({ onClose, onSave }: { onClose: () => void; onSave: () => void; }) {
  const [saving, setSaving] = useState(false);
  const [nome, setNome] = useState("");
  const [tipo, setTipo] = useState("");
  const [capacidade, setCapacidade] = useState("");

  const [feedbackModal, setFeedbackModal] = useState<{ open: boolean; type: "success" | "error" | "warning"; title: string; message: string }>({ open: false, type: "success", title: "", message: "" });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nome) { setFeedbackModal({ open: true, type: "warning", title: "Atenção", message: "Nome é obrigatório." }); return; }
    setSaving(true);
    try {
      await api.post("/manutencao/maquinas", { nome, tipo, capacidade });
      setFeedbackModal({ open: true, type: "success", title: "Sucesso", message: "Máquina cadastrada!" });
      setTimeout(() => {
          onSave();
      }, 1500);
    } catch (err: any) {
      setFeedbackModal({ open: true, type: "error", title: "Erro", message: err?.message || "Erro ao criar máquina." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Input label="Nome da Máquina *" name="nome" value={nome} onChange={e => setNome(e.target.value)} required />
        <Input label="Tipo (Injetora, Prensa...)" name="tipo" value={tipo} onChange={e => setTipo(e.target.value)} />
        <div className="col-span-2">
          <Input label="Capacidade / Observações" name="capacidade" value={capacidade} onChange={e => setCapacidade(e.target.value)} />
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-4">
        <button type="button" className="px-4 py-2 text-sm hover:bg-muted rounded-lg" onClick={onClose} disabled={saving}>Cancelar</button>
        <button type="submit" className="px-4 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary/90" disabled={saving}>
          {saving ? "Salvando..." : "Salvar Máquina"}
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

export function NovaOsForm({ onClose, onSave, maquinas }: { onClose: () => void; onSave: () => void; maquinas: any[]; }) {
  const [saving, setSaving] = useState(false);
  const [maquinaId, setMaquinaId] = useState("");
  const [tipo, setTipo] = useState("PREVENTIVA");
  const [problema, setProblema] = useState("");

  const [feedbackModal, setFeedbackModal] = useState<{ open: boolean; type: "success" | "error" | "warning"; title: string; message: string }>({ open: false, type: "success", title: "", message: "" });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!maquinaId) { setFeedbackModal({ open: true, type: "warning", title: "Atenção", message: "Selecione a máquina." }); return; }
    setSaving(true);
    try {
      await api.post("/manutencao/os", { maquina_id: parseInt(maquinaId), tipo, problema_desc: problema });
      setFeedbackModal({ open: true, type: "success", title: "Sucesso", message: "OS aberta com sucesso!" });
      setTimeout(() => {
          onSave();
      }, 1500);
    } catch (err: any) {
      setFeedbackModal({ open: true, type: "error", title: "Erro", message: err?.message || "Erro ao abrir OS." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Select label="Máquina *" name="maquina_id" value={maquinaId} onChange={e => setMaquinaId(e.target.value)} required>
        <option value="">Selecione...</option>
        {maquinas.map(m => <option key={m.id} value={m.id}>{m.nome}</option>)}
      </Select>
      <Select label="Tipo de Manutenção *" name="tipo" value={tipo} onChange={e => setTipo(e.target.value)} required>
        <option value="PREVENTIVA">Preventiva</option>
        <option value="CORRETIVA">Corretiva</option>
        <option value="MELHORIA">Melhoria</option>
      </Select>
      <Input label="Descrição do Problema / Serviço" name="problema" value={problema} onChange={e => setProblema(e.target.value)} />
      <div className="flex justify-end gap-2 pt-4">
        <button type="button" className="px-4 py-2 text-sm hover:bg-muted rounded-lg" onClick={onClose} disabled={saving}>Cancelar</button>
        <button type="submit" className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700" disabled={saving}>
          {saving ? "Salvando..." : "Abrir OS"}
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

export function Manutencao() {
  const [modalMaq, setModalMaq] = useState(false);
  const [modalOS, setModalOS] = useState(false);
  const [ordens, setOrdens] = useState<any[]>([]);
  const [maquinas, setMaquinas] = useState<any[]>([]);

  const [feedbackModal, setFeedbackModal] = useState<{ open: boolean; type: "success" | "error" | "warning"; title: string; message: string }>({ open: false, type: "success", title: "", message: "" });
  const [confirmModal, setConfirmModal] = useState<{ open: boolean; title: string; message: string; onConfirm: () => void }>({ open: false, title: "", message: "", onConfirm: () => {} });
  
  const [promptModal, setPromptModal] = useState<{ open: boolean; title: string; message: string; value: string; onConfirm: (val: string) => void }>({ open: false, title: "", message: "", value: "", onConfirm: () => {} });

  async function loadData() {
    try {
      const [osRes, maqRes] = await Promise.all([
        api.get<any[]>("/manutencao/os"),
        api.get<any[]>("/manutencao/maquinas")
      ]);
      setOrdens(osRes);
      setMaquinas(maqRes);
    } catch (err: any) { console.error(err); }
  }

  useEffect(() => { loadData(); }, []);

  async function handleDeleteOS(id: number) {
    setConfirmModal({
        open: true,
        title: "Excluir OS",
        message: "Tem certeza que deseja excluir esta OS?",
        onConfirm: async () => {
            setConfirmModal(prev => ({ ...prev, open: false }));
            try { 
                await api.delete(`/manutencao/os/${id}`); 
                loadData(); 
                setFeedbackModal({ open: true, type: "success", title: "Sucesso", message: "OS excluída." });
            } catch (err: any) { 
                setFeedbackModal({ open: true, type: "error", title: "Erro", message: err?.message || "Erro ao excluir" }); 
            }
        }
    });
  }
  
  async function handleDeleteMaquina(id: number) {
    setConfirmModal({
        open: true,
        title: "Excluir Máquina",
        message: "Excluir esta Máquina? (Requer que não haja OS atrelada a ela)",
        onConfirm: async () => {
            setConfirmModal(prev => ({ ...prev, open: false }));
            try { 
                await api.delete(`/manutencao/maquinas/${id}`); 
                loadData(); 
                setFeedbackModal({ open: true, type: "success", title: "Sucesso", message: "Máquina excluída." });
            } catch (err: any) { 
                setFeedbackModal({ open: true, type: "error", title: "Erro", message: err?.message || "Erro ao excluir" }); 
            }
        }
    });
  }

  async function handleFinalizarOS(id: number) {
    setPromptModal({
        open: true,
        title: "Finalizar OS",
        message: "Informe o Custo com Mão de Obra (R$):",
        value: "0",
        onConfirm: async (val: string) => {
            setPromptModal(prev => ({ ...prev, open: false }));
            try { 
                await api.post(`/manutencao/os/${id}/finalizar`, { custo_mao_obra: parseFloat(val) || 0 }); 
                setFeedbackModal({ open: true, type: "success", title: "Sucesso", message: "OS finalizada com sucesso." });
                loadData(); 
            } catch (err: any) { 
                setFeedbackModal({ open: true, type: "error", title: "Erro", message: err?.message || "Erro ao finalizar OS" }); 
            }
        }
    });
  }

  const osAbertas = ordens.filter(o => o.status === "ABERTA");

  return (
    <div className="space-y-6">
      <Modal open={modalMaq} onClose={() => setModalMaq(false)} title="Cadastrar Máquina">
        <NovaMaquinaForm onClose={() => setModalMaq(false)} onSave={() => { setModalMaq(false); loadData(); }} />
      </Modal>
      <Modal open={modalOS} onClose={() => setModalOS(false)} title="Abrir Ordem de Serviço">
        <NovaOsForm onClose={() => setModalOS(false)} onSave={() => { setModalOS(false); loadData(); }} maquinas={maquinas} />
      </Modal>

      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <div className="text-xs text-muted-foreground uppercase mb-2">módulo gestão</div>
          <h2 className="text-2xl font-semibold m-0">Manutenção Industrial</h2>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setModalMaq(true)} className="px-4 py-2 text-sm font-medium bg-[#0ea5e9] text-white hover:bg-[#0284c7] rounded-md flex items-center gap-2">
            <Plus size={16} /> Nova Máquina
          </button>
          <button onClick={() => setModalOS(true)} className="px-4 py-2 text-sm font-medium bg-[#334155] text-white hover:bg-[#1e293b] rounded-md flex items-center gap-2">
            <Wrench size={16} /> Abrir OS
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-card p-6 rounded-xl border border-border">
          <div className="text-xs text-muted-foreground uppercase font-semibold tracking-wider mb-2">MÁQUINAS ATIVAS</div>
          <div className="text-4xl font-bold">{maquinas.length}</div>
        </div>
        <div className="bg-card p-6 rounded-xl border border-border">
          <div className="text-xs text-muted-foreground uppercase font-semibold tracking-wider mb-2">OS EM ABERTO</div>
          <div className="text-4xl font-bold">{osAbertas.length}</div>
        </div>
      </div>

      {/* Ordens Recentes */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="p-5 border-b border-border font-semibold">
          Ordens de Serviço Recentes
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/30">
              <tr className="text-xs text-muted-foreground text-left uppercase tracking-wider">
                <th className="px-5 py-3">OS #</th>
                <th className="px-5 py-3">MÁQUINA</th>
                <th className="px-5 py-3">TIPO</th>
                <th className="px-5 py-3">STATUS</th>
                <th className="px-5 py-3">CUSTO TOTAL</th>
                <th className="px-5 py-3 text-right">AÇÕES</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {ordens.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-8 text-muted-foreground">Nenhuma OS encontrada.</td></tr>
              ) : ordens.map(o => (
                <tr key={o.id} className="hover:bg-muted/20">
                  <td className="px-5 py-3 font-mono text-sm">#{o.id}</td>
                  <td className="px-5 py-3 text-sm font-medium">{o.maquina?.nome || "—"}</td>
                  <td className="px-5 py-3 text-sm">{o.tipo}</td>
                  <td className="px-5 py-3"><Badge variant={o.status === "FINALIZADA" ? "success" : "warning"}>{o.status}</Badge></td>
                  <td className="px-5 py-3 text-sm font-medium">R$ {(o.custo_total || o.custo_mao_obra || 0).toFixed(2)}</td>
                  <td className="px-5 py-3 flex justify-end gap-2">
                    {o.status === "ABERTA" && (
                      <button onClick={() => handleFinalizarOS(o.id)} className="text-xs text-blue-600 hover:underline">Finalizar</button>
                    )}
                    <button onClick={() => handleDeleteOS(o.id)} className="text-xs text-red-500 hover:underline">Excluir</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Parque de Máquinas */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="p-5 border-b border-border font-semibold">
          Parque de Máquinas
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/30">
              <tr className="text-xs text-muted-foreground text-left uppercase tracking-wider">
                <th className="px-5 py-3">NOME</th>
                <th className="px-5 py-3">TIPO</th>
                <th className="px-5 py-3">CAPACIDADE</th>
                <th className="px-5 py-3">STATUS</th>
                <th className="px-5 py-3 text-right">AÇÕES</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {maquinas.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-8 text-muted-foreground">Nenhuma máquina encontrada.</td></tr>
              ) : maquinas.map(m => (
                <tr key={m.id} className="hover:bg-muted/20">
                  <td className="px-5 py-3 text-sm font-medium">{m.nome}</td>
                  <td className="px-5 py-3 text-sm text-muted-foreground">{m.tipo || "—"}</td>
                  <td className="px-5 py-3 text-sm text-muted-foreground">{m.capacidade || "—"}</td>
                  <td className="px-5 py-3"><Badge variant={m.status === "OPERANTE" ? "success" : "danger"}>{m.status}</Badge></td>
                  <td className="px-5 py-3 flex justify-end">
                    <button onClick={() => handleDeleteMaquina(m.id)} className="text-xs text-red-500 hover:underline">Excluir</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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

      {/* Modal de Prompt */}
      <Modal title={promptModal.title} open={promptModal.open} onClose={() => setPromptModal({ ...promptModal, open: false })}>
        <div className="flex flex-col gap-4">
            <div>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed mb-4">{promptModal.message}</p>
                <Input 
                    type="number"
                    step="0.01"
                    value={promptModal.value}
                    onChange={(e) => setPromptModal({ ...promptModal, value: e.target.value })}
                />
            </div>
        </div>
        <div className="mt-6 flex justify-end gap-3">
            <button 
                onClick={() => setPromptModal({ ...promptModal, open: false })}
                className="px-5 py-2 rounded-lg text-sm font-medium border border-border text-muted-foreground hover:bg-muted transition-colors"
            >
                Cancelar
            </button>
            <button 
                onClick={() => promptModal.onConfirm(promptModal.value)}
                className="px-6 py-2 rounded-lg text-sm font-medium bg-[#0ea5e9] hover:bg-[#0284c7] text-white shadow-sm transition-colors"
            >
                Salvar e Finalizar
            </button>
        </div>
      </Modal>
    </div>
  );
}

export default Manutencao;
