import React, { useState, useEffect } from "react";
import { 
  Search, Printer, CheckCircle, Plus, MoreHorizontal, Filter, Calendar, Trash2, Check, Download, AlertCircle, X, Mail, MessageCircle
} from "lucide-react";
import { Badge, fmtFull, Modal, TableToolbar } from "../components/ui/SharedUI";
import { DrawerIncluirNota } from "../components/fiscal/DrawerIncluirNota";
import { api } from "../services/api";

export function NotasFiscais() {
  const [notas, setNotas] = useState<any[]>([]);
  const [marcadores, setMarcadores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filtros
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("pendentes");
  const [alertasSefaz, setAlertasSefaz] = useState<any[]>([]);
  const [is30Days, setIs30Days] = useState(false);
  const [dateFilter, setDateFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [minValor, setMinValor] = useState("");
  
  const [selectedNotas, setSelectedNotas] = useState<number[]>([]);
  
  // Modals e Dropdowns
  const [showDropdown, setShowDropdown] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [showIncludeModal, setShowIncludeModal] = useState(false);
  const [initialData, setInitialData] = useState<any>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showCceModal, setShowCceModal] = useState(false);
  const [showInutilizarModal, setShowInutilizarModal] = useState(false);
  
  const [cceText, setCceText] = useState("");
  const [formInutilizar, setFormInutilizar] = useState({ ano: new Date().getFullYear().toString().slice(-2), serie: "1", num_inicial: "", num_final: "", justificativa: "" });

  async function loadData() {
    try {
      setLoading(true);
      const [resNotas, resMarcadores, resAlertas] = await Promise.all([
        api.get("/fiscal/notas"),
        api.get("/fiscal/marcadores"),
        api.get("/fiscal/alertas-sefaz")
      ]);
      setNotas(resNotas as any[]);
      setMarcadores(resMarcadores as any[]);
      setAlertasSefaz(resAlertas as any[]);
    } catch (err) {
      console.error(err);
      alert("Erro ao carregar Notas Fiscais.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const handleDismissAlerta = async (id: number) => {
    try {
      await api.put(`/fiscal/alertas-sefaz/${id}/lido`, {});
      setAlertasSefaz(alertasSefaz.filter(a => a.id !== id));
    } catch (err) {
      console.error("Erro ao marcar alerta como lido", err);
    }
  };

  const handleEnviarLote = async () => {
    if (selectedNotas.length === 0) return;
    try {
      const res: any = await api.post("/fiscal/enviar-lote", { notas: selectedNotas });
      alert(res.data.mensagem);
      setSelectedNotas([]);
      loadData();
    } catch (err) {
      alert("Erro ao processar envio em lote.");
    }
  };

  const handleProcessarFila = async () => {
    if (!window.confirm("ATENÇÃO: Tem certeza que deseja ativar a Contingência Offline?\n\nEsta ação forçará todas as notas travadas na fila a serem impressas com tpEmis=9. Use isso APENAS se a SEFAZ estiver comprovadamente fora do ar ou sua internet local estiver inativa.")) {
      return;
    }
    try {
      const res: any = await api.post("/fiscal/processar-fila-contingencia");
      alert(`${res.data.contingencias_ativadas} notas foram processadas em Contingência Offline (tpEmis=9).`);
      loadData();
    } catch (e: any) {
      alert("Erro ao processar fila.");
    }
  };
  
  const handleEnviarEmail = async (id: number) => {
    try {
      const res: any = await api.post(`/fiscal/notas/${id}/enviar-email`);
      alert(res.data.message);
      loadData();
    } catch (e: any) {
      alert("Erro ao enviar e-mail: " + (e.response?.data?.detail || e.message));
    }
  };
  
  const handleCompartilharWhatsApp = (n: any) => {
    const text = encodeURIComponent(`Olá! A Nota Fiscal nº ${n.numero} (R$ ${fmtFull(n.valor)}) foi emitida com sucesso.\nAcesse: https://sistema.erp.local/danfe/${n.chave_acesso || n.id}`);
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };
  
  const handleIncluirManual = async (dados: any, isEdit?: boolean) => {
    try {
        const payload = {
            pedido_id: null,
            natureza_operacao: dados.cabecalho.natureza_operacao,
            tipo: "S",
            cliente: {
                nome: dados.cabecalho.dest_nome,
                cpf_cnpj: dados.cabecalho.dest_cnpj,
                cep: dados.cabecalho.dest_cep,
                numero: dados.cabecalho.dest_numero
            },
            valor_produtos: dados.totais.produtos,
            frete: dados.totais.frete,
            desconto: dados.totais.desconto,
            valor_total: dados.totais.total_nota,
            base_icms: dados.totais.base_icms,
            valor_icms: dados.totais.valor_icms,
            valor_ipi: dados.totais.valor_ipi,
            valor_ibs: 0,
            valor_cbs: 0,
            valor_is: 0,
            itens: dados.itens.map((it: any) => ({
                produto_id: null,
                codigo: "",
                descricao: it.descricao,
                unidade: it.unidade || "UN",
                ncm: it.ncm,
                cfop: it.cfop,
                quantidade: it.qtde,
                valor_unitario: it.preco_un,
                valor_total: it.total
            }))
        };

        // Envia para o backend
        if (isEdit && editingId) {
            const res: any = await api.put(`/fiscal/editar/${editingId}`, payload);
            alert(res.data.mensagem);
        } else {
            const res: any = await api.post("/fiscal/emitir", payload);
            alert(`Nota gerada com sucesso! NF-e ID: ${res.data.nota_id}. Total: R$ ${dados.totais.total_nota}`);
        }
        setShowIncludeModal(false);
        setEditingId(null);
        setInitialData(null);
        loadData();
    } catch (e: any) {
        let msg = "Ocorreu um erro inesperado ao emitir a nota.";
        if (e.response?.data?.detail) {
            const detail = e.response.data.detail;
            if (Array.isArray(detail)) {
                msg = "❌ Campos Incompletos:\n\nFaltam informações obrigatórias (como quantidades, valores, NCM ou CFOP). Verifique se você preencheu corretamente a tabela de produtos.";
            } else if (typeof detail === 'string') {
                if (detail.includes("CNPJ") || detail.includes("CPF")) {
                    msg = "❌ Documento Inválido:\n\nO CPF ou CNPJ do destinatário está em branco, incompleto ou é inválido.\nPor segurança, a SEFAZ exige um documento real para autorizar a nota. Verifique os números digitados na aba 'Destinatário'.";
                } else if (detail.includes("CEP")) {
                    msg = "❌ CEP Inválido:\n\nO CEP digitado não possui 8 números. Por favor, corrija na aba 'Destinatário'.";
                } else {
                    msg = "❌ Atenção:\n\n" + detail;
                }
            }
        }
        alert(msg);
    }
  };
  
  const handleCancelarNotas = async () => {
      if (selectedNotas.length === 0) return;
      if(window.confirm(`Deseja realmente cancelar ${selectedNotas.length} nota(s)?`)) {
          try {
              const res: any = await api.post("/fiscal/cancelar-lote", { notas: selectedNotas });
              alert(res.data.mensagem);
              setSelectedNotas([]);
              setShowDropdown(false);
              loadData();
          } catch (err: any) {
              alert(err.response?.data?.detail || "Erro ao cancelar o lote de notas.");
          }
      }
  };

  const handleAbrirCce = () => {
      if (selectedNotas.length !== 1) {
          alert("Para emitir uma Carta de Correção (CC-e), selecione exatamente 1 (uma) nota fiscal.");
          return;
      }
      setShowDropdown(false);
      setShowCceModal(true);
  };

  const handleAbrirInutilizar = () => {
      setShowDropdown(false);
      setShowInutilizarModal(true);
  };

  const handleEditarNota = async () => {
      if (selectedNotas.length !== 1) {
          alert("Selecione apenas 1 (uma) nota para editar.");
          return;
      }
      setShowDropdown(false);
      try {
          const res: any = await api.get(`/fiscal/notas/local/${selectedNotas[0]}`);
          setInitialData(res.data);
          setEditingId(selectedNotas[0]);
          setShowIncludeModal(true);
      } catch(err: any) {
          alert(err.response?.data?.detail || "Nota não pode ser editada (pode ser uma nota apenas da Olist).");
      }
  };

  const handleGerarReentrada = async () => {
      if (selectedNotas.length !== 1) {
          alert("Selecione apenas 1 (uma) nota base para gerar a Reentrada.");
          return;
      }
      setShowDropdown(false);
      try {
          const res: any = await api.get(`/fiscal/notas/local/${selectedNotas[0]}`);
          const dados = res.data;
          
          // Inverte dados para Reentrada
          dados.cabecalho.natureza_operacao = "Devolução de Venda";
          dados.cabecalho.tipo_saida = "Entrada"; // mock (poderíamos mapear no drawer)
          dados.itens = dados.itens.map((it: any) => ({
              ...it,
              cfop: it.cfop.startsWith("5") ? it.cfop.replace("5", "1") : it.cfop.startsWith("6") ? it.cfop.replace("6", "2") : it.cfop
          }));

          setInitialData(dados);
          setEditingId(null); // Vai criar uma nova
          setShowIncludeModal(true);
      } catch(err: any) {
          alert(err.response?.data?.detail || "Erro ao carregar dados locais para reentrada.");
      }
  };

  const handleEnviarInutilizacao = async () => {
      if (formInutilizar.justificativa.length < 15) {
          alert("A justificativa deve ter pelo menos 15 caracteres.");
          return;
      }
      try {
          const res: any = await api.post("/fiscal/inutilizar-numeracao", {
              ...formInutilizar,
              num_inicial: parseInt(formInutilizar.num_inicial),
              num_final: parseInt(formInutilizar.num_final)
          });
          alert(res.data.mensagem);
          setShowInutilizarModal(false);
          setFormInutilizar({ ano: new Date().getFullYear().toString().slice(-2), serie: "1", num_inicial: "", num_final: "", justificativa: "" });
      } catch (err: any) {
          alert(err.response?.data?.detail || "Erro ao inutilizar numeração.");
      }
  };

  const handleEnviarCce = async () => {
      if (cceText.length < 15 || cceText.length > 1000) {
          alert("A correção deve ter entre 15 e 1000 caracteres.");
          return;
      }
      try {
          const res: any = await api.post("/fiscal/carta-correcao", {
              nota_id: selectedNotas[0],
              texto: cceText
          });
          alert(res.data.mensagem);
          setShowCceModal(false);
          setCceText("");
          setSelectedNotas([]);
          loadData();
      } catch (err: any) {
          alert(err.response?.data?.detail || "Erro ao emitir CC-e.");
      }
  };

  const toggleSelect = (id: number) => {
    if (selectedNotas.includes(id)) {
      setSelectedNotas(selectedNotas.filter(n => n !== id));
    } else {
      setSelectedNotas([...selectedNotas, id]);
    }
  };

  const filteredNotas = notas.filter(n => {
    if (search && !n.destinatario?.toLowerCase().includes(search.toLowerCase())) return false;
    if (activeTab === "pendentes" && n.status !== "Pendente") return false;
    if (activeTab === "emitidas" && !(n.status === "Autorizada" || n.status === "Emitida DANFE")) return false;
    if (activeTab === "canceladas" && n.status === "Cancelada") return false;
    
    // Filtro 30 dias (Simulado verificando a string, mas o correto seria parse de Date)
    if (is30Days) {
        // Mock: Se não for 2026, finge que é mais antigo
        if(!n.data_emissao?.includes("2026")) return false;
    }
    
    if (dateFilter) {
        const parts = dateFilter.split("-"); // yyyy-mm-dd
        if(parts.length === 3) {
            const formatBR = `${parts[2]}/${parts[1]}/${parts[0]}`;
            if(n.data_emissao && !n.data_emissao.includes(formatBR)) return false;
        }
    }
    
    if (minValor) {
        if((n.valor || 0) < parseFloat(minValor)) return false;
    }
    
    return true;
  });
  
  const totalValor = filteredNotas.reduce((acc, curr) => acc + (curr.valor || 0), 0);

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] bg-card text-foreground rounded-xl overflow-hidden shadow-sm border border-border fade-in">
      
      {/* Alert Headers (Sefaz Monitor) */}
      {alertasSefaz.map(alerta => (
        <div key={alerta.id} className={`p-3 border-b flex gap-3 items-start justify-between text-xs ${alerta.tipo === 'CRITICAL' ? 'bg-red-50/50 border-red-100 text-red-800' : 'bg-amber-50/50 border-amber-100 text-amber-800'}`}>
          <div className="flex gap-3 items-start">
            <div className={`${alerta.tipo === 'CRITICAL' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'} p-1.5 rounded-md mt-0.5`}>
              <AlertCircle size={14} />
            </div>
            <div>
              <p><strong>{alerta.fonte}:</strong> {alerta.mensagem}</p>
              <span className="text-[10px] opacity-70">Lido em {alerta.data}</span>
            </div>
          </div>
          <button 
            onClick={() => handleDismissAlerta(alerta.id)}
            className="text-muted-foreground hover:text-foreground opacity-70 hover:opacity-100 transition-opacity p-1 rounded-md hover:bg-background/50"
            title="Marcar como lido"
          >
            <X size={16} />
          </button>
        </div>
      ))}

      {/* Top Header Controls */}
      <div className="p-4 border-b border-border flex flex-col gap-4 bg-background/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Pesquise pelo nome do cliente" 
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="bg-background border border-border rounded-full pl-9 pr-4 py-1.5 text-sm w-80 text-foreground focus:outline-none focus:border-primary"
              />
            </div>
            <button 
              onClick={() => setIs30Days(!is30Days)} 
              className={`px-3 py-1.5 text-xs font-medium border border-border rounded-full transition-colors ${is30Days ? 'bg-primary text-primary-foreground' : 'text-primary hover:bg-muted'}`}
            >
              Últimos 30 dias
            </button>
            <div className="relative flex items-center border border-border rounded-full px-2">
                <Calendar size={12} className="text-muted-foreground mr-1" />
                <input 
                    type="date" 
                    value={dateFilter} 
                    onChange={e => setDateFilter(e.target.value)}
                    className="bg-transparent text-xs text-muted-foreground py-1.5 focus:outline-none"
                />
            </div>
            <button onClick={() => setShowFilters(!showFilters)} className={`px-3 py-1.5 text-xs flex items-center gap-1.5 border border-border rounded-full transition-colors ${showFilters ? 'bg-muted text-foreground' : 'text-muted-foreground hover:bg-muted'}`}><Filter size={12} /> filtros</button>
            <button className="px-3 py-1.5 text-xs flex items-center gap-1.5 text-muted-foreground hover:text-foreground" onClick={() => { setSearch(""); setIs30Days(false); setDateFilter(""); setMinValor(""); }}><Trash2 size={12} /> limpar filtros</button>
          </div>
          
          <div className="flex items-center gap-2">
            <button onClick={handleProcessarFila} className="px-3 py-1.5 text-xs flex items-center gap-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full border border-orange-200 bg-orange-50/10 text-orange-600"><CheckCircle size={14} /> Processar Fila Offline (SEFAZ Inativa)</button>
            <button onClick={() => selectedNotas.length ? setShowPrintModal(true) : alert("Selecione ao menos uma nota para imprimir.")} className="px-3 py-1.5 text-xs flex items-center gap-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full"><Printer size={14} /> imprimir DANFEs</button>
            
            <button onClick={() => {setShowIncludeModal(true); setInitialData(null); setEditingId(null);}} className="flex items-center gap-2 px-3 py-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm font-medium transition-colors shadow-sm">
              <Plus size={16} /> Incluir Nota Fiscal
            </button>
            
            <div className="relative">
              <button onClick={() => setShowDropdown(!showDropdown)} className="flex items-center gap-2 px-3 py-1.5 border border-border bg-background text-foreground rounded-lg hover:bg-muted text-sm transition-colors">
                Ações <MoreHorizontal size={16} />
              </button>
              {showDropdown && (
                <div className="absolute right-0 mt-2 w-56 bg-card border border-border rounded-xl shadow-lg z-50 py-1 flex flex-col animate-in fade-in zoom-in-95 duration-100">
                  <button onClick={handleEditarNota} className="px-4 py-2 text-left text-sm hover:bg-muted text-foreground flex items-center gap-2"><Check size={14} /> Editar Nota (Malha Fina)</button>
                  <button onClick={handleGerarReentrada} className="px-4 py-2 text-left text-sm hover:bg-muted text-foreground flex items-center gap-2"><Check size={14} /> Gerar Reentrada (Devolução)</button>
                  <button onClick={handleEnviarLote} className="px-4 py-2 text-left text-sm hover:bg-muted text-foreground flex items-center gap-2"><Check size={14} /> Enviar em Lote para SEFAZ</button>
                  <button onClick={handleAbrirCce} className="px-4 py-2 text-left text-sm hover:bg-muted text-foreground flex items-center gap-2"><Check size={14} /> Emitir Carta de Correção</button>
                  <button onClick={handleAbrirInutilizar} className="px-4 py-2 text-left text-sm hover:bg-muted text-foreground flex items-center gap-2"><Check size={14} /> Inutilizar Numeração</button>
                  <div className="border-t border-border my-1"></div>
                  <button onClick={handleCancelarNotas} className="px-4 py-2 text-left text-sm hover:bg-red-50 text-red-600 flex items-center gap-2"><Trash2 size={14} /> Cancelar Notas</button>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Painel Filtros Avançados */}
        {showFilters && (
            <div className="flex gap-4 p-3 bg-muted/30 rounded-lg border border-border fade-in">
                <div>
                    <label className="text-[10px] text-muted-foreground font-semibold uppercase block mb-1">Valor Mínimo (R$)</label>
                    <input type="number" value={minValor} onChange={e => setMinValor(e.target.value)} placeholder="Ex: 1000" className="bg-background border border-border px-3 py-1 rounded text-sm w-32" />
                </div>
            </div>
        )}
      </div>

      {/* Tabs */}
      <div className="px-6 flex gap-6 border-b border-border bg-card">
        {[
          { id: "todas", label: "todas", color: "bg-slate-400", count: notas.length },
          { id: "pendentes", label: "pendentes", color: "bg-amber-400", count: notas.filter(n => n.status === "Pendente").length },
          { id: "emitidas", label: "emitidas", color: "bg-emerald-500", count: notas.filter(n => n.status === "Autorizada" || n.status === "Emitida DANFE").length },
          { id: "canceladas", label: "canceladas", color: "bg-red-500", count: notas.filter(n => n.status === "Cancelada").length },
        ].map(t => (
          <button 
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`pb-2 pt-3 flex flex-col items-center gap-1 px-2 border-b-2 transition-colors ${activeTab === t.id ? "border-primary text-foreground font-medium" : "border-transparent text-muted-foreground hover:text-foreground"}`}
          >
            <div className="flex items-center gap-1.5 text-xs"><div className={`w-1.5 h-1.5 rounded-full ${t.color}`}></div> {t.label}</div>
            <span className="text-sm font-semibold">{t.count.toString().padStart(2, '0')}</span>
          </button>
        ))}
      </div>

      {/* Table Area */}
      <div className="flex-1 overflow-auto bg-background">
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 bg-muted/80 backdrop-blur z-10 border-b border-border text-xs text-muted-foreground font-medium">
            <tr>
              <th className="py-3 px-4 w-12 text-center">
                <input 
                  type="checkbox" 
                  onChange={(e) => setSelectedNotas(e.target.checked ? filteredNotas.map(n => n.id) : [])}
                  checked={selectedNotas.length === filteredNotas.length && filteredNotas.length > 0}
                  className="rounded border-border accent-primary" 
                />
              </th>
              <th className="py-3 px-2 font-medium">Nº</th>
              <th className="py-3 px-2 font-medium">Data emissão</th>
              <th className="py-3 px-2 font-medium">Cliente</th>
              <th className="py-3 px-2 font-medium">UF</th>
              <th className="py-3 px-2 font-medium text-right">Valor</th>
              <th className="py-3 px-4 font-medium">Marcadores</th>
              <th className="py-3 px-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              <tr><td colSpan={8} className="py-8 text-center text-sm text-muted-foreground">Carregando notas...</td></tr>
            ) : filteredNotas.length === 0 ? (
              <tr><td colSpan={8} className="py-8 text-center text-sm text-muted-foreground">Nenhuma nota encontrada.</td></tr>
            ) : (
              filteredNotas.map((n, i) => (
                <tr key={n.id} className={`text-xs hover:bg-muted/50 transition-colors ${selectedNotas.includes(n.id) ? 'bg-primary/5' : ''}`}>
                  <td className="py-2.5 px-4 text-center">
                    <input 
                      type="checkbox" 
                      checked={selectedNotas.includes(n.id)}
                      onChange={() => toggleSelect(n.id)}
                      className="rounded border-border accent-primary cursor-pointer" 
                    />
                  </td>
                  <td className="py-2.5 px-2">
                    <span className="font-mono text-foreground font-medium">{n.numero || "Pendente"}</span>
                  </td>
                  <td className="py-2.5 px-2 text-muted-foreground">{n.data_emissao}</td>
                  <td className="py-2.5 px-2 font-medium text-foreground">{n.destinatario}</td>
                  <td className="py-2.5 px-2 text-muted-foreground">SP</td>
                  <td className="py-2.5 px-2 text-right text-foreground font-medium">{fmtFull(n.valor)}</td>
                  <td className="py-2.5 px-4 flex gap-1.5 flex-wrap">
                    {n.status.toLowerCase().includes("emitida") && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-[10px] text-emerald-800 flex items-center gap-1 border border-emerald-200">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div> impresso
                      </span>
                    )}
                    {n.status === "Pendente" && i % 2 !== 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-amber-100 text-[10px] text-amber-800 flex items-center gap-1 border border-amber-200">
                        <div className="w-1.5 h-1.5 bg-amber-500 rounded-full"></div> falta de mp - aguardando aço
                      </span>
                    )}
                    {i % 2 === 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-[10px] text-slate-700 flex items-center gap-1 border border-slate-200">
                        <div className="w-1.5 h-1.5 bg-slate-400 rounded-full"></div> 1ª venda
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 hover:opacity-100 transition-opacity">
                      {(n.status.toLowerCase().includes("autorizada") || n.status.toLowerCase().includes("emitida")) && (
                        <>
                          <button 
                            onClick={() => handleCompartilharWhatsApp(n)}
                            title="Compartilhar via WhatsApp"
                            className="w-6 h-6 rounded-md border border-green-200 bg-green-50 flex items-center justify-center text-green-600 hover:bg-green-100"
                          >
                            <MessageCircle size={14} />
                          </button>
                          <button 
                            onClick={() => handleEnviarEmail(n.id)}
                            title={n.email_enviado ? "Reenviar E-mail" : "Enviar por E-mail"}
                            className={`w-6 h-6 rounded-md border flex items-center justify-center transition-colors ${n.email_enviado ? 'border-primary bg-primary text-white' : 'border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground'}`}
                          >
                            <Mail size={14} />
                          </button>
                        </>
                      )}
                      <button className="w-5 h-5 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground"><span className="text-[9px] font-bold">V</span></button>
                      <button className="text-muted-foreground hover:text-primary"><MoreHorizontal size={14}/></button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer Totals */}
      <div className="p-4 border-t border-border bg-card flex justify-end gap-12 text-right pr-8">
        <div>
          <p className="text-xl font-light text-foreground">{filteredNotas.length}</p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">quantidade</p>
        </div>
        <div>
          <p className="text-xl font-light text-foreground">{totalValor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">valor total (r$)</p>
        </div>
      </div>
      
      {/* Modals Extras */}
      
      {/* Drawer de Inclusão Manual */}
      <DrawerIncluirNota 
        open={showIncludeModal} 
        onClose={() => {setShowIncludeModal(false); setEditingId(null); setInitialData(null);}} 
        onSave={(dados, isEdit) => handleIncluirManual(dados, isEdit)} 
        initialData={initialData}
      />
      
      {/* Modal Imprimir DANFE */}
      <Modal title="Impressão de DANFEs" open={showPrintModal} onClose={() => setShowPrintModal(false)}>
        <div className="flex flex-col items-center">
            <div className="w-full p-4 bg-muted/30 border border-border rounded-lg mb-6 flex flex-col items-center text-center gap-2">
                <Printer size={32} className="text-muted-foreground" />
                <h3 className="font-bold text-lg">Pronto para Imprimir</h3>
                <p className="text-sm text-muted-foreground">{selectedNotas.length} DANFE(s) gerada(s) com sucesso na fila de impressão.</p>
            </div>
            <div className="w-full h-40 bg-white border border-gray-300 rounded shadow-inner flex flex-col items-center justify-center text-gray-400 p-4">
                {/* Mock Visual do DANFE */}
                <div className="w-full flex justify-between border-b pb-2 mb-2">
                    <div className="w-1/2 h-8 bg-gray-200 rounded"></div>
                    <div className="w-1/3 h-12 bg-gray-200 flex items-center justify-center"><span className="text-xs text-gray-500">CÓDIGO DE BARRAS</span></div>
                </div>
                <div className="w-full flex gap-2">
                    <div className="w-full h-16 bg-gray-100 rounded"></div>
                </div>
            </div>
            <div className="w-full pt-4 flex justify-end gap-2 mt-6">
                <button onClick={() => setShowPrintModal(false)} className="px-4 py-2 border border-border rounded-lg text-sm">Voltar</button>
                <button onClick={() => { window.print(); setShowPrintModal(false); }} className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium flex gap-2 items-center"><Printer size={14}/> Imprimir PDF</button>
            </div>
        </div>
      </Modal>

      {/* Modal Carta de Correção */}
      <Modal title="Emitir Carta de Correção (CC-e)" open={showCceModal} onClose={() => setShowCceModal(false)}>
        <div className="space-y-4">
            <p className="text-sm text-muted-foreground mb-2">
                A Carta de Correção é disciplinada pelo § 1º-A do art. 7º do Convênio S/N, de 15 de dezembro de 1970.
                Apenas erros simples podem ser corrigidos. Não use para corrigir valores de impostos, datas de emissão ou mudança de destinatário.
            </p>
            <div>
                <label className="text-xs font-medium block mb-1">Texto da Correção (Mínimo 15 caracteres)</label>
                <textarea 
                    value={cceText} 
                    onChange={e => setCceText(e.target.value)} 
                    rows={4}
                    placeholder="Descreva a correção aqui..."
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm resize-none focus:outline-primary" 
                />
                <p className="text-[10px] text-muted-foreground text-right mt-1">{cceText.length}/1000 caracteres</p>
            </div>
            <div className="pt-4 flex justify-end gap-2 border-t border-border mt-2">
                <button onClick={() => setShowCceModal(false)} className="px-4 py-2 border border-border rounded-lg text-sm">Cancelar</button>
                <button onClick={handleEnviarCce} disabled={cceText.length < 15} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium disabled:opacity-50">Transmitir CC-e</button>
            </div>
        </div>
      </Modal>

      {/* Modal Inutilizar Numeração */}
      <Modal title="Inutilizar Numeração (NFC-e / NF-e)" open={showInutilizarModal} onClose={() => setShowInutilizarModal(false)}>
        <div className="space-y-4">
            <p className="text-sm text-muted-foreground mb-4">
                Comunique à SEFAZ a quebra de sequência da numeração de notas fiscais.
                O pedido deve ser enviado até o 10º dia do mês subsequente.
            </p>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="text-xs font-medium block mb-1">Ano (2 dígitos)</label>
                    <input type="text" maxLength={2} value={formInutilizar.ano} onChange={e => setFormInutilizar({...formInutilizar, ano: e.target.value})} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm" />
                </div>
                <div>
                    <label className="text-xs font-medium block mb-1">Série</label>
                    <input type="text" maxLength={3} value={formInutilizar.serie} onChange={e => setFormInutilizar({...formInutilizar, serie: e.target.value})} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm" />
                </div>
                <div>
                    <label className="text-xs font-medium block mb-1">Número Inicial</label>
                    <input type="number" value={formInutilizar.num_inicial} onChange={e => setFormInutilizar({...formInutilizar, num_inicial: e.target.value})} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm" />
                </div>
                <div>
                    <label className="text-xs font-medium block mb-1">Número Final</label>
                    <input type="number" value={formInutilizar.num_final} onChange={e => setFormInutilizar({...formInutilizar, num_final: e.target.value})} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm" />
                </div>
            </div>
            <div className="mt-4">
                <label className="text-xs font-medium block mb-1">Justificativa (Mínimo 15 caracteres)</label>
                <textarea 
                    value={formInutilizar.justificativa} 
                    onChange={e => setFormInutilizar({...formInutilizar, justificativa: e.target.value})} 
                    rows={3}
                    placeholder="Motivo da quebra de sequência (ex: Falha no sistema, salto acidental)"
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm resize-none focus:outline-primary" 
                />
            </div>
            <div className="pt-4 flex justify-end gap-2 border-t border-border mt-2">
                <button onClick={() => setShowInutilizarModal(false)} className="px-4 py-2 border border-border rounded-lg text-sm">Cancelar</button>
                <button onClick={handleEnviarInutilizacao} disabled={formInutilizar.justificativa.length < 15 || !formInutilizar.num_inicial || !formInutilizar.num_final} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium disabled:opacity-50">Inutilizar Numeração</button>
            </div>
        </div>
      </Modal>

    </div>
  );
}