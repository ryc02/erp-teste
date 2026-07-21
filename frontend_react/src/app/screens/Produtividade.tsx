import React, { useState, useEffect } from "react";
import { api } from "../services/api";
import { Badge, Input, Select, Modal } from "../components/ui/SharedUI";
import { RefreshCw, LayoutGrid, Save, UserPlus, CheckCircle, Trash2 } from "lucide-react";

export function Produtividade() {
  const [apontamentos, setApontamentos] = useState<any[]>([]);
  const [setores, setSetores] = useState<any[]>([]);
  const [colaboradores, setColaboradores] = useState<any[]>([]);
  
  const [periodo, setPeriodo] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
  });

  // Forms states
  const [sNome, setSNome] = useState("");
  const [sMetaDiaria, setSMetaDiaria] = useState("");
  const [sMetaColab, setSMetaColab] = useState("");

  const [cSetorId, setCSetorId] = useState("");
  const [cNome, setCNome] = useState("");

  const [aData, setAData] = useState(new Date().toISOString().split("T")[0]);
  const [aSetorId, setASetorId] = useState("");
  const [aColabId, setAColabId] = useState("");
  const [aQtd, setAQtd] = useState("");
  const [aOcorrencia, setAOcorrencia] = useState("PRODUCAO");
  const [aObs, setAObs] = useState("");

  const [feedbackModal, setFeedbackModal] = useState<{ open: boolean; type: "success" | "error" | "warning"; title: string; message: string }>({ open: false, type: "success", title: "", message: "" });
  const [confirmModal, setConfirmModal] = useState<{ open: boolean; title: string; message: string; onConfirm: () => void }>({ open: false, title: "", message: "", onConfirm: () => {} });

  async function loadData() {
    try {
      // Filtrar apontamentos por periodo seria ideal, mas para simplificar aqui vamos buscar tudo ou ajustar conforme a API.
      // O backend pode ter ?ano=X&mes=Y. Aqui pegamos todos por simplicidade de re-render.
      const [aptRes, setRes, colRes] = await Promise.all([
        api.get<any[]>("/produtividade/apontamentos"),
        api.get<any[]>("/produtividade/setores"),
        api.get<any[]>("/produtividade/colaboradores")
      ]);
      setApontamentos(aptRes);
      setSetores(setRes);
      setColaboradores(colRes);
    } catch (err: any) {
      console.error(err);
    }
  }

  useEffect(() => { loadData(); }, [periodo]);

  // Handlers
  async function saveSetor(e: React.FormEvent) {
    e.preventDefault();
    try {
      await api.post("/produtividade/setores", { nome: sNome, meta_diaria: parseFloat(sMetaDiaria), meta_colaborador_diaria: parseFloat(sMetaColab)||0 });
      setSNome(""); setSMetaDiaria(""); setSMetaColab(""); loadData();
      setFeedbackModal({ open: true, type: "success", title: "Sucesso", message: "Setor salvo com sucesso!" });
    } catch(err:any) { setFeedbackModal({ open: true, type: "error", title: "Erro", message: err.message || "Erro ao salvar setor" }); }
  }

  async function saveColaborador(e: React.FormEvent) {
    e.preventDefault();
    try {
      await api.post("/produtividade/colaboradores", { nome: cNome, setor_id: parseInt(cSetorId) });
      setCNome(""); loadData();
      setFeedbackModal({ open: true, type: "success", title: "Sucesso", message: "Colaborador salvo com sucesso!" });
    } catch(err:any) { setFeedbackModal({ open: true, type: "error", title: "Erro", message: err.message || "Erro ao salvar colaborador" }); }
  }

  async function saveApontamento(e: React.FormEvent) {
    e.preventDefault();
    try {
      await api.post("/produtividade/apontamentos", { 
        data_referencia: aData, 
        setor_id: parseInt(aSetorId), 
        colaborador_id: aColabId ? parseInt(aColabId) : null,
        quantidade: parseFloat(aQtd),
        ocorrencia: aOcorrencia,
        observacao: aObs
      });
      setAQtd(""); setAObs(""); loadData();
      setFeedbackModal({ open: true, type: "success", title: "Sucesso", message: "Apontamento registrado!" });
    } catch(err:any) { setFeedbackModal({ open: true, type: "error", title: "Erro", message: err.message || "Erro ao salvar apontamento" }); }
  }

  async function deleteApontamento(id: number) {
    setConfirmModal({
        open: true,
        title: "Excluir Apontamento",
        message: "Tem certeza que deseja excluir este apontamento?",
        onConfirm: async () => {
            setConfirmModal(prev => ({ ...prev, open: false }));
            try { 
                await api.delete(`/produtividade/apontamentos/${id}`); 
                loadData(); 
                setFeedbackModal({ open: true, type: "success", title: "Sucesso", message: "Apontamento excluído." });
            } catch(err:any) { 
                setFeedbackModal({ open: true, type: "error", title: "Erro", message: err.message || "Erro ao excluir" }); 
            }
        }
    });
  }

  // Filter cols by sector
  const colsNoSetor = aSetorId ? colaboradores.filter(c => c.setor_id.toString() === aSetorId) : colaboradores;

  // Calculos simplificados
  const totalQtd = apontamentos.reduce((acc, a) => acc + (a.quantidade||0), 0);
  const dateObj = new Date(periodo + "-01T00:00:00");
  const monthName = dateObj.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-card p-6 rounded-xl border border-border">
        <div>
          <h2 className="text-2xl font-semibold m-0">Produtividade Real x Teórica</h2>
          <p className="text-muted-foreground text-sm mt-1">Apontamento diário, metas por setor e consolidado mensal direto do banco de dados.</p>
        </div>
        <div className="flex gap-2 mt-4 md:mt-0">
          <button onClick={loadData} className="px-4 py-2 text-sm font-medium border border-border rounded-lg hover:bg-muted flex items-center gap-2">
            <RefreshCw size={16} /> Atualizar
          </button>
          <button className="px-4 py-2 text-sm font-medium bg-[#0ea5e9] text-white hover:bg-[#0284c7] rounded-lg flex items-center gap-2">
            <LayoutGrid size={16} /> Gestão Fábrica
          </button>
        </div>
      </div>

      {/* Period Selector Card */}
      <div className="bg-card p-5 rounded-xl border border-border">
        <div className="mb-4">
          <label className="text-xs font-semibold text-muted-foreground uppercase mb-1 block">Período</label>
          <input type="month" value={periodo} onChange={e => setPeriodo(e.target.value)} className="w-full max-w-xs border border-border rounded p-2 bg-muted/20" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-muted/30 p-4 rounded-lg border border-border/50">
            <div className="text-xs uppercase text-muted-foreground mb-1">Período ativo</div>
            <div className="text-xl font-semibold capitalize">{monthName}</div>
          </div>
          <div className="bg-muted/30 p-4 rounded-lg border border-border/50">
            <div className="text-xs uppercase text-muted-foreground mb-1">Setores ativos</div>
            <div className="text-xl font-semibold">{setores.length} setor(es)</div>
          </div>
          <div className="bg-muted/30 p-4 rounded-lg border border-border/50">
            <div className="text-xs uppercase text-muted-foreground mb-1">Apontamentos</div>
            <div className="text-xl font-semibold">{apontamentos.length} apontamento(s)</div>
          </div>
        </div>
        <div className="text-xs text-muted-foreground mt-3">Painel conectado ao banco de dados do ERP.</div>
      </div>

      {/* Setores e Colaboradores Forms */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Setores */}
        <div className="bg-card rounded-xl border border-border flex flex-col h-full">
          <div className="p-5 border-b border-border">
            <h3 className="font-semibold text-lg">Setores e Meta Padrão</h3>
            <p className="text-sm text-muted-foreground">Cadastre a meta total do setor e a meta individual diária por colaborador.</p>
          </div>
          <div className="p-5 flex-1">
            <form onSubmit={saveSetor} className="space-y-4 mb-6">
              <div className="grid grid-cols-2 gap-4">
                <Input label="Setor" name="snome" value={sNome} onChange={e=>setSNome(e.target.value)} placeholder="Ex.: Montagem" required />
                <Input label="Meta diária do setor" name="smetadiaria" type="number" step="any" value={sMetaDiaria} onChange={e=>setSMetaDiaria(e.target.value)} placeholder="Ex.: 4000" required />
              </div>
              <Input label="Meta individual por dia" name="smetacolab" type="number" step="any" value={sMetaColab} onChange={e=>setSMetaColab(e.target.value)} placeholder="Ex.: 500 para montagem de kits" />
              <button type="submit" className="px-4 py-2 bg-[#0ea5e9] text-white rounded flex items-center gap-2 text-sm font-medium hover:bg-[#0284c7]"><Save size={16}/> Salvar Setor</button>
            </form>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-muted/30 border-b border-border text-xs uppercase text-muted-foreground">
                  <tr><th className="py-2 px-3">Setor</th><th className="py-2 px-3">Meta Setor</th><th className="py-2 px-3">Meta Colaborador</th></tr>
                </thead>
                <tbody className="divide-y divide-border text-sm">
                  {setores.length===0 ? <tr><td colSpan={3} className="py-4 text-center text-muted-foreground">Sem setores.</td></tr> : 
                    setores.map(s => <tr key={s.id}><td className="py-2 px-3 font-medium">{s.nome}</td><td className="py-2 px-3">{s.meta_diaria}</td><td className="py-2 px-3">{s.meta_colaborador_diaria}</td></tr>)
                  }
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Colaboradores */}
        <div className="bg-card rounded-xl border border-border flex flex-col h-full">
          <div className="p-5 border-b border-border">
            <h3 className="font-semibold text-lg">Cadastro de Colaboradores</h3>
            <p className="text-sm text-muted-foreground">Cadastre os colaboradores por setor para usar a seleção no apontamento.</p>
          </div>
          <div className="p-5 flex-1">
            <form onSubmit={saveColaborador} className="space-y-4 mb-6">
              <div className="grid grid-cols-2 gap-4">
                <Select label="Setor" value={cSetorId} onChange={e=>setCSetorId(e.target.value)} required>
                  <option value="">Selecione...</option>
                  {setores.map(s => <option key={s.id} value={s.id}>{s.nome}</option>)}
                </Select>
                <Input label="Colaborador" value={cNome} onChange={e=>setCNome(e.target.value)} placeholder="Ex.: Cristiane" required />
              </div>
              <button type="submit" className="px-4 py-2 bg-[#0ea5e9] text-white rounded flex items-center gap-2 text-sm font-medium hover:bg-[#0284c7]"><UserPlus size={16}/> Salvar Colaborador</button>
            </form>
            <div className="overflow-x-auto max-h-[250px]">
              <table className="w-full text-left">
                <thead className="bg-muted/30 border-b border-border text-xs uppercase text-muted-foreground">
                  <tr><th className="py-2 px-3">Setor</th><th className="py-2 px-3">Colaborador</th><th className="py-2 px-3">Status</th></tr>
                </thead>
                <tbody className="divide-y divide-border text-sm">
                  {colaboradores.length===0 ? <tr><td colSpan={3} className="py-4 text-center text-muted-foreground">Sem colaboradores.</td></tr> : 
                    colaboradores.map(c => <tr key={c.id}><td className="py-2 px-3 text-muted-foreground">{c.setor?.nome}</td><td className="py-2 px-3 font-medium">{c.nome}</td><td className="py-2 px-3"><Badge variant="success">Ativo</Badge></td></tr>)
                  }
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Novo Apontamento */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="p-5 border-b border-border">
          <h3 className="font-semibold text-lg">Novo Apontamento</h3>
          <p className="text-sm text-muted-foreground">Um lançamento por colaborador, setor e dia, sempre escolhendo a partir do cadastro.</p>
        </div>
        <div className="p-5 bg-muted/10">
          <form onSubmit={saveApontamento} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input type="date" label="Data" value={aData} onChange={e=>setAData(e.target.value)} required />
              <Select label="Setor" value={aSetorId} onChange={e=>setASetorId(e.target.value)} required>
                <option value="">Selecione...</option>
                {setores.map(s => <option key={s.id} value={s.id}>{s.nome}</option>)}
              </Select>
              <Select label="Colaborador" value={aColabId} onChange={e=>setAColabId(e.target.value)}>
                <option value="">Selecione um colaborador...</option>
                {colsNoSetor.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
              </Select>
              <Input type="number" step="any" label="Quantidade produzida" value={aQtd} onChange={e=>setAQtd(e.target.value)} required />
            </div>
            <Select label="Ocorrência" value={aOcorrencia} onChange={e=>setAOcorrencia(e.target.value)} required>
              <option value="PRODUCAO">Produção</option>
              <option value="FALTA">Falta</option>
              <option value="RETRABALHO">Retrabalho</option>
              <option value="MANUTENCAO">Manutenção</option>
            </Select>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">Observação</label>
              <textarea value={aObs} onChange={e=>setAObs(e.target.value)} rows={2} className="border border-border rounded-md bg-transparent p-2 text-sm" placeholder="Detalhes adicionais do dia..."></textarea>
            </div>
            <button type="submit" className="px-5 py-2.5 bg-[#0ea5e9] text-white rounded flex items-center gap-2 text-sm font-medium hover:bg-[#0284c7]"><CheckCircle size={16}/> Salvar Apontamento</button>
          </form>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card p-5 rounded-xl border-t-4 border-t-blue-500 border-l border-r border-b border-border shadow-sm">
          <div className="text-xs font-semibold text-muted-foreground uppercase mb-2">Eficiência Consolidada</div>
          <div className="text-3xl font-bold">0,0%</div>
          <div className="text-xs text-muted-foreground mt-1">Aguardando dados...</div>
        </div>
        <div className="bg-card p-5 rounded-xl border-t-4 border-t-orange-400 border-l border-r border-b border-border shadow-sm">
          <div className="text-xs font-semibold text-muted-foreground uppercase mb-2">Produção Real Acumulada</div>
          <div className="text-3xl font-bold">{totalQtd}</div>
          <div className="text-xs text-muted-foreground mt-1">teórico para o período</div>
        </div>
        <div className="bg-card p-5 rounded-xl border-t-4 border-t-red-400 border-l border-r border-b border-border shadow-sm">
          <div className="text-xs font-semibold text-muted-foreground uppercase mb-2">Gap Para a Meta</div>
          <div className="text-3xl font-bold">-</div>
          <div className="text-xs text-muted-foreground mt-1">Menor desempenho</div>
        </div>
        <div className="bg-card p-5 rounded-xl border-t-4 border-t-emerald-400 border-l border-r border-b border-border shadow-sm">
          <div className="text-xs font-semibold text-muted-foreground uppercase mb-2">Apontamentos no Período</div>
          <div className="text-3xl font-bold">{apontamentos.length}</div>
          <div className="text-xs text-muted-foreground mt-1">{setores.length} setor(es) no filtro atual</div>
        </div>
      </div>

      {/* Apontamentos Recentes Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="p-5 border-b border-border">
          <h3 className="font-semibold text-lg">Apontamentos Recentes</h3>
          <p className="text-sm text-muted-foreground">Histórico do período com opção de correção rápida.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-muted/30 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="py-3 px-5 font-medium">Data</th>
                <th className="py-3 px-4 font-medium">Setor</th>
                <th className="py-3 px-4 font-medium">Colaborador</th>
                <th className="py-3 px-4 font-medium">Quantidade</th>
                <th className="py-3 px-4 font-medium">Ocorrência</th>
                <th className="py-3 px-4 text-right font-medium">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-sm">
              {apontamentos.length === 0 ? <tr><td colSpan={6} className="py-8 text-center text-muted-foreground">Nenhum apontamento registrado.</td></tr> :
                apontamentos.map(a => (
                  <tr key={a.id} className="hover:bg-muted/20">
                    <td className="py-3 px-5 font-mono text-muted-foreground">{new Date(a.data_referencia+"T00:00:00").toLocaleDateString("pt-BR")}</td>
                    <td className="py-3 px-4 font-medium">{a.setor?.nome}</td>
                    <td className="py-3 px-4">{a.colaborador?.nome || a.colaborador_nome || "—"}</td>
                    <td className="py-3 px-4 font-semibold">{a.quantidade}</td>
                    <td className="py-3 px-4"><Badge variant={a.ocorrencia==="PRODUCAO"?"success":a.ocorrencia==="FALTA"?"danger":"warning"}>{a.ocorrencia}</Badge></td>
                    <td className="py-3 px-4 text-right">
                      <button onClick={()=>deleteApontamento(a.id)} className="text-red-500 hover:text-red-600 p-1"><Trash2 size={16}/></button>
                    </td>
                  </tr>
                ))
              }
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
    </div>
  );
}

export default Produtividade;
