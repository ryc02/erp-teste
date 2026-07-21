import React, { useState, useEffect, useRef } from "react";
import { api } from "../services/api";
import { 
  Search, Trash2, ArrowLeft, Plus, FileText, ChevronDown, X, Save, Printer
} from "lucide-react";
import { Badge, FormSection, TableToolbar, fmtFull, Modal, Input } from "../components/ui/SharedUI";
import { useAuth } from "../hooks/useAuth";
import { PrintableProposal } from "../components/ui/PrintableProposal";
import { PrintableProductionOrder } from "../components/ui/PrintableProductionOrder";
import { toast } from "sonner";

// ── helpers ───────────────────────────────────────────────────────────────────
function brl(v: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);
}

// ── Field components (tema claro via design system) ───────────────────────────
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">{label}</label>
      {children}
    </div>
  );
}

const inputCls = "w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-shadow";

// ── NovoPedidoForm ──────────────────────────────────────────────────────────
export function NovoPedidoForm({ onCancel, onSave, pedidoId }: { onCancel: () => void; onSave: () => void; pedidoId?: number }) {
  type Item = { produto_id: number; nome: string; sku: string; qty: number; preco: number; descPerc: number };
  
  const [itens, setItens] = useState<Item[]>([]);
  const [clientes, setClientes] = useState<any[]>([]);
  const [produtos, setProdutos] = useState<any[]>([]);
  const [representantes, setRepresentantes] = useState<any[]>([]);
  const [representanteId, setRepresentanteId] = useState("");
  const [saving, setSaving] = useState(false);

  // Autocomplete cliente
  const [clienteId, setClienteId] = useState("");
  const [clienteBusca, setClienteBusca] = useState("");
  const [showClientes, setShowClientes] = useState(false);

  // Autocomplete produto
  const [produtoBusca, setProdutoBusca] = useState("");
  const [showProdutos, setShowProdutos] = useState(false);

  // Extras
  const [naturezaOperacao, setNaturezaOperacao] = useState("Venda");
  const [descontoGlobal, setDescontoGlobal] = useState(0);
  const [gerarNota, setGerarNota] = useState(true);
  const [freteCliente, setFreteCliente] = useState(0);
  const [freteEmpresa, setFreteEmpresa] = useState(0);
  const [despesas, setDespesas] = useState(0);
  const [dataPrevista, setDataPrevista] = useState("");
  const [codigoRastreamento, setCodigoRastreamento] = useState("");
  const [urlRastreamento, setUrlRastreamento] = useState("");
  const [formaRecebimento, setFormaRecebimento] = useState("");
  const [condicaoPagamento, setCondicaoPagamento] = useState("");
  const [formaEnvio, setFormaEnvio] = useState("");
  const [fretePorConta, setFretePorConta] = useState("");
  const [obsPublica, setObsPublica] = useState("");
  const [obsInterna, setObsInterna] = useState("");
  const [isEnderecoEntregaDiferente, setIsEnderecoEntregaDiferente] = useState(false);
  const [enderecoEntrega, setEnderecoEntrega] = useState({
    cep: "", endereco: "", numero: "", complemento: "", bairro: "", cidade: "", uf: "",
    destinatario: "", tipoPessoa: "Física", cpfCnpj: "", inscEstadual: "", fone: ""
  });
  const [buscandoCep, setBuscandoCep] = useState(false);
  const [buscandoCnpj, setBuscandoCnpj] = useState(false);
  
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [advancedSearchQuery, setAdvancedSearchQuery] = useState("");

  const [showPagModal, setShowPagModal] = useState(false);
  const [pagModalConta, setPagModalConta] = useState("");
  const [pagModalCategoria, setPagModalCategoria] = useState("");
  const [pagModalMeio, setPagModalMeio] = useState("Banco");
  const [pagModalParcelas, setPagModalParcelas] = useState<{ v: string, val: number }[]>([]);
  const [showGerarParcelas, setShowGerarParcelas] = useState(false);

  function gerarParcelas(n: number) {
    const today = new Date();
    const arr = [];
    const val = totalVenda / n;
    for (let i = 1; i <= n; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + (i * 30));
      arr.push({ v: d.toISOString().split('T')[0], val: +val.toFixed(2) });
    }
    setPagModalParcelas(arr);
    setShowGerarParcelas(false);
  }

  const updateEnd = (field: keyof typeof enderecoEntrega, val: string) => {
    setEnderecoEntrega(prev => ({ ...prev, [field]: val }));
  };

  const handleCepBlur = async () => {
    const cep = enderecoEntrega.cep.replace(/\D/g, "");
    if (cep.length !== 8) return;
    setBuscandoCep(true);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await res.json();
      if (!data.erro) {
        setEnderecoEntrega(prev => ({
          ...prev,
          endereco: data.logradouro || prev.endereco,
          bairro: data.bairro || prev.bairro,
          cidade: data.localidade || prev.cidade,
          uf: data.uf || prev.uf
        }));
      }
    } catch (e) {
      console.error("Erro ao buscar CEP:", e);
    } finally {
      setBuscandoCep(false);
    }
  };

  const handleCnpjBlur = async () => {
    const cnpj = enderecoEntrega.cpfCnpj.replace(/\D/g, "");
    if (cnpj.length !== 14 || enderecoEntrega.tipoPessoa !== "Jurídica") return;
    setBuscandoCnpj(true);
    try {
      // 1. Tenta API que traz Inscrição Estadual (publica.cnpj.ws)
      const resWs = await fetch(`https://publica.cnpj.ws/cnpj/${cnpj}`);
      if (resWs.ok) {
        const data = await resWs.json();
        const estabelecimento = data.estabelecimento || {};
        const ie = estabelecimento.inscricoes_estaduais && estabelecimento.inscricoes_estaduais.length > 0 
          ? estabelecimento.inscricoes_estaduais[0].inscricao_estadual 
          : enderecoEntrega.inscEstadual;

        setEnderecoEntrega(prev => ({
          ...prev,
          destinatario: data.razao_social || prev.destinatario,
          cep: estabelecimento.cep || prev.cep,
          endereco: `${estabelecimento.tipo_logradouro || ''} ${estabelecimento.logradouro || ''}`.trim() || prev.endereco,
          numero: estabelecimento.numero || prev.numero,
          complemento: estabelecimento.complemento || prev.complemento,
          bairro: estabelecimento.bairro || prev.bairro,
          cidade: estabelecimento.cidade?.nome || prev.cidade,
          uf: estabelecimento.estado?.sigla || prev.uf,
          fone: (estabelecimento.ddd1 && estabelecimento.telefone1) ? `(${estabelecimento.ddd1}) ${estabelecimento.telefone1}` : prev.fone,
          inscEstadual: ie || prev.inscEstadual
        }));
        return;
      }
      
      // 2. Fallback para BrasilAPI (não traz IE, mas garante os outros dados caso a 1ª falhe)
      const res = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpj}`);
      if (res.ok) {
        const data = await res.json();
        setEnderecoEntrega(prev => ({
          ...prev,
          destinatario: data.razao_social || prev.destinatario,
          cep: data.cep || prev.cep,
          endereco: data.logradouro || prev.endereco,
          numero: data.numero || prev.numero,
          complemento: data.complemento || prev.complemento,
          bairro: data.bairro || prev.bairro,
          cidade: data.municipio || prev.cidade,
          uf: data.uf || prev.uf,
          fone: data.ddd_telefone_1 || prev.fone
        }));
      }
    } catch (e) {
      console.error("Erro ao buscar CNPJ:", e);
    } finally {
      setBuscandoCnpj(false);
    }
  };

  useEffect(() => {
    api.get<any[]>("/comercial/clientes").then(setClientes).catch(console.error);
    api.get<any[]>("/vendas/catalogo-produtos").then(setProdutos).catch(console.error);
    api.get<any[]>("/comercial/representantes?include_inativos=false").then(setRepresentantes).catch(console.error);

    if (pedidoId) {
      api.get<any>(`/vendas/pedidos/${pedidoId}`).then((data) => {
        if (data.cliente_id) {
          setClienteId(String(data.cliente_id));
          setClienteBusca(data.cliente_nome || "");
        }
        if (data.itens) {
           setItens(data.itens.map((i: any) => ({
              produto_id: i.produto_id,
              nome: i.produto?.nome || "Produto sem nome",
              sku: i.produto?.sku || "—",
              qty: i.quantidade,
              preco: i.preco_unitario,
              descPerc: i.desconto_percentual || 0
           })));
        }
        setDescontoGlobal(data.desconto_valor || 0);
        setFreteCliente(data.valor_frete || 0);
        setObsPublica(data.observacoes || "");
        if (data.natureza_operacao) {
          setNaturezaOperacao(data.natureza_operacao);
        }
        setGerarNota(data.gerar_nota !== false);
        if (data.representante_id) {
          setRepresentanteId(String(data.representante_id));
        }
        if (data.codigo_rastreamento) setCodigoRastreamento(data.codigo_rastreamento);
        if (data.url_rastreamento) setUrlRastreamento(data.url_rastreamento);
        if (data.data_prevista) setDataPrevista(data.data_prevista.split("T")[0]);
      }).catch(console.error);
    }
  }, [pedidoId]);

  // Cálculos reativos
  const somaQtdes = itens.reduce((s, i) => s + i.qty, 0);
  const totalProdutos = itens.reduce((s, i) => s + (i.qty * i.preco * (1 - i.descPerc / 100)), 0);
  const totalVenda = totalProdutos + freteCliente + despesas - descontoGlobal;

  function addItem(prodId: string) {
    const p = produtos.find(x => x.id.toString() === prodId);
    if (!p) return;
    // Evita duplicata — apenas incrementa qty
    const existing = itens.findIndex(i => i.produto_id === p.id);
    if (existing >= 0) {
      const n = [...itens];
      n[existing].qty += 1;
      setItens(n);
    } else {
      setItens([...itens, { produto_id: p.id, nome: p.nome, sku: p.sku || "—", qty: 1, preco: p.preco_venda, descPerc: 0 }]);
    }
    setProdutoBusca("");
    setShowProdutos(false);
  }

  function updateItem(idx: number, field: keyof Item, value: any) {
    const n = [...itens];
    (n[idx] as any)[field] = value;
    setItens(n);
  }

  const [showMaisAcoes, setShowMaisAcoes] = useState(false);
  const [showAlterarStatus, setShowAlterarStatus] = useState(false);
  const [printData, setPrintData] = useState<any>(null);

  async function handleClonar() {
    if (!pedidoId) return;
    if (!confirm("Clonar este pedido?")) return;
    try {
      const res = await api.post<any>(`/vendas/pedidos/${pedidoId}/clonar`);
      alert(`Pedido clonado com sucesso! Novo ID: #${res.id}`);
      onSave();
    } catch {
      // ponytail: endpoint may not exist yet, fallback
      alert("Função de clonar não disponível no servidor.");
    }
  }

  async function handleExcluir() {
    if (!pedidoId) return;
    if (!confirm("Excluir este pedido de venda? Esta ação não pode ser desfeita.")) return;
    try {
      await api.delete<any>(`/vendas/pedidos/${pedidoId}`);
      onSave();
    } catch {
      alert("Erro ao excluir pedido.");
    }
  }

  async function handleAlterarStatus(novoStatus: string) {
    if (!pedidoId) return;
    try {
      await api.post(`/vendas/pedidos/${pedidoId}/alterar-status`, { status: novoStatus });
      setShowAlterarStatus(false);
      onSave();
    } catch {
      alert("Erro ao alterar status.");
    }
  }

  function handleCompartilhar() {
    const url = `${window.location.origin}?modulo=pedidos&id=${pedidoId}`;
    navigator.clipboard.writeText(url).then(() => alert(`Link copiado: ${url}`));
  }

  const [printProductionData, setPrintProductionData] = useState<any>(null);

  function handleImprimir() {
    if (!pedidoId) return;
    api.get<any>(`/vendas/pedidos/${pedidoId}`).then(res => {
      setPrintData(res);
      setTimeout(() => window.print(), 300);
    }).catch(() => window.print());
  }

  function handleImprimirProducao(customId?: any) {
    const idToUse = customId || pedidoId;
    if (!idToUse) return;
    api.get<any>(`/vendas/pedidos/${idToUse}`).then(res => {
      setPrintProductionData(res);
      setTimeout(() => window.print(), 300);
    }).catch(err => {
      toast.error("Erro ao carregar dados para impressão da produção");
    });
  }

  async function handleGerarOP(customPedido?: any) {
    const p = customPedido || (pedidoId ? { id: pedidoId, itens: itens } : null);
    if (!p) return;
    try {
      const prodId = p.itens && p.itens.length > 0 ? (p.itens[0].produto_id || p.itens[0].id) : 1;
      const qty = p.itens && p.itens.length > 0 ? (p.itens[0].quantidade || p.itens[0].qty || 1) : 1;
      await api.post("/pcp/ordens", {
        produto_id: prodId,
        quantidade_planejada: qty,
        observacoes: `OP gerada automaticamente via Pedido #${p.id}`
      });
      toast.success(`Ordem de Produção gerada com sucesso para o Pedido #${p.id}!`);
    } catch (e: any) {
      toast.error(e?.message || "Erro ao gerar Ordem de Produção no PCP");
    }
  }

  async function handleSave(aprovar: boolean) {
    if (!clienteId) { alert("Selecione um cliente."); return; }
    if (itens.length === 0) { alert("Adicione pelo menos um produto."); return; }
    
    const cli = clientes.find(c => c.id.toString() === clienteId);
    setSaving(true);
    try {
      const parcelasStr = pagModalParcelas.length > 0 
        ? `\n\n[Pagamento Configurado]\nMeio: ${pagModalMeio}\nConta: ${pagModalConta}\nCategoria: ${pagModalCategoria}\nParcelas:\n${pagModalParcelas.map((p, i) => `${i+1}x - Venc: ${p.v.split('-').reverse().join('/')} - R$ ${p.val}`).join('\n')}` 
        : "";

      const payload = {
        tipo: "PEDIDO",
        cliente_id: cli.id,
        cliente_nome: cli.nome_razao_social,
        valor_frete: freteCliente,
        desconto_valor: descontoGlobal,
        observacoes: obsPublica + parcelasStr,
        gerar_nota: gerarNota,
        natureza_operacao: naturezaOperacao,
        representante_id: representanteId ? parseInt(representanteId) : null,
        vendedor_id: representanteId ? parseInt(representanteId) : null,
        data_prevista: dataPrevista ? new Date(dataPrevista).toISOString() : null,
        codigo_rastreamento: codigoRastreamento,
        url_rastreamento: urlRastreamento,
        itens: itens.map(i => ({
          produto_id: i.produto_id,
          quantidade: i.qty,
          preco_unitario: +(i.preco * (1 - i.descPerc / 100)).toFixed(2),
        })),
      };

      const res = await api.post<any>("/vendas/pedidos", payload);

      if (aprovar) {
        await api.post(`/vendas/pedidos/${res.id}/aprovar`);
      }
      onSave();
    } catch (err: any) {
      alert(err?.message ?? "Erro ao salvar pedido");
    } finally {
      setSaving(false);
    }
  }

  // Filtros autocomplete
  const clientesFiltrados = clienteBusca.length < 1 ? [] : clientes.filter(c => {
    const t = clienteBusca.toLowerCase();
    return (
      c.nome_razao_social?.toLowerCase().includes(t) ||
      c.nome_fantasia?.toLowerCase().includes(t) ||
      c.email?.toLowerCase().includes(t) ||
      c.cpf_cnpj?.replace(/\D/g, "").includes(t.replace(/\D/g, ""))
    );
  }).slice(0, 8);

  const produtosFiltrados = produtos.filter(p => {
    if (!produtoBusca) return true;
    const t = produtoBusca.toLowerCase();
    return p.nome?.toLowerCase().includes(t) || p.sku?.toLowerCase().includes(t);
  }).slice(0, 10);

  const clienteSelecionado = clientes.find(c => c.id.toString() === clienteId);

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden flex flex-col h-full">
      
      {/* Sticky header */}
      <div className="h-16 px-6 border-b border-border flex items-center justify-between bg-card sticky top-0 z-20 shadow-sm">
        <div className="flex items-center gap-3">
          <button onClick={onCancel} className="p-2 -ml-2 text-muted-foreground hover:bg-muted rounded-lg transition-colors">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h2 className="text-base font-bold text-foreground" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              {pedidoId ? `Pedido de Venda #${pedidoId}` : "Nova Pedido de Venda"}
            </h2>
            <p className="text-xs text-muted-foreground">{pedidoId ? "Detalhes do pedido" : "Preencha os dados do pedido"}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {pedidoId ? (
            <>
              {/* Compartilhar */}
              <button
                onClick={handleCompartilhar}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium border border-border bg-card text-foreground hover:bg-muted rounded-lg transition-colors"
              >
                🔗 Compartilhar
              </button>

              {/* Imprimir */}
              <button
                onClick={handleImprimir}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium border border-border bg-card text-foreground hover:bg-muted rounded-lg transition-colors"
              >
                <Printer size={13} /> Imprimir
              </button>

              {/* Mais Ações */}
              <div className="relative">
                <button
                  onClick={() => setShowMaisAcoes(v => !v)}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium border border-border bg-card text-foreground hover:bg-muted rounded-lg transition-colors"
                >
                  Mais ações ⋯
                </button>
                {showMaisAcoes && (
                  <div className="absolute right-0 top-full mt-1 w-52 bg-card border border-border rounded-xl shadow-xl z-50 py-1 text-xs">
                    <div className="px-3 py-1.5 text-muted-foreground text-[10px] uppercase tracking-wider font-semibold">Fiscal</div>
                    <button onClick={async () => { 
                      setShowMaisAcoes(false); 
                      try {
                        const payload = {
                          pedido_id: pedidoId,
                          cliente_id: clienteId ? parseInt(clienteId) : null,
                          cliente_nome: clienteSelecionado?.nome_razao_social,
                          cliente_cpf_cnpj: clienteSelecionado?.cpf_cnpj,
                          valor_produtos: totalProdutos,
                          valor_frete: freteCliente,
                          valor_total: totalVenda,
                          vendedor_id: representanteId ? parseInt(representanteId) : null,
                          nome_vendedor: representantes.find(r => r.id.toString() === representanteId)?.nome
                        };
                        const res = await api.post<any>("/fiscal/notas", payload);
                        alert(`Nota Fiscal de Rascunho Gerada: #${res.id}`);
                      } catch (err: any) {
                        alert(err?.message || "Erro ao gerar NFe");
                      }
                    }} className="w-full text-left px-4 py-2 hover:bg-muted transition-colors flex items-center gap-2 font-medium text-emerald-600">
                      Gerar nota fiscal
                    </button>
                    <button onClick={() => { setShowMaisAcoes(false); alert("Funcionalidade em breve."); }} className="w-full text-left px-4 py-2 hover:bg-muted transition-colors flex items-center gap-2">Faturar parcialmente</button>
                    <div className="border-t border-border my-1" />
                    <div className="px-3 py-1.5 text-muted-foreground text-[10px] uppercase tracking-wider font-semibold">Impressão</div>
                    <button onClick={() => { setShowMaisAcoes(false); handleImprimir(); }} className="w-full text-left px-4 py-2 hover:bg-muted transition-colors">Imprimir</button>
                    <button onClick={() => { setShowMaisAcoes(false); handleImprimir(); }} className="w-full text-left px-4 py-2 hover:bg-muted transition-colors">Salvar em PDF</button>
                    <button onClick={() => { setShowMaisAcoes(false); alert("Funcionalidade em breve."); }} className="w-full text-left px-4 py-2 hover:bg-muted transition-colors">Imprimir carnet</button>
                    <button onClick={() => { setShowMaisAcoes(false); handleImprimirProducao(); }} className="w-full text-left px-4 py-2 hover:bg-muted transition-colors font-medium text-amber-600">Imprimir pedido para produção (PCP)</button>
                    <div className="border-t border-border my-1" />
                    <div className="px-3 py-1.5 text-muted-foreground text-[10px] uppercase tracking-wider font-semibold">Operações</div>
                    <button onClick={() => { setShowMaisAcoes(false); handleClonar(); }} className="w-full text-left px-4 py-2 hover:bg-muted transition-colors">Clonar venda</button>
                    <button onClick={() => { setShowMaisAcoes(false); alert("Funcionalidade em breve."); }} className="w-full text-left px-4 py-2 hover:bg-muted transition-colors">Devolver produtos</button>
                    <button onClick={() => { setShowMaisAcoes(false); setShowAlterarStatus(true); }} className="w-full text-left px-4 py-2 hover:bg-muted transition-colors">Alterar situação</button>
                    <button onClick={() => { setShowMaisAcoes(false); handleGerarOP(); }} className="w-full text-left px-4 py-2 hover:bg-muted transition-colors font-medium text-blue-600">Gerar ordem de produção (OP)</button>
                    <button onClick={() => { setShowMaisAcoes(false); alert("Funcionalidade em breve."); }} className="w-full text-left px-4 py-2 hover:bg-muted transition-colors">Cotar fretes</button>
                    <div className="border-t border-border my-1" />
                    <button onClick={() => { setShowMaisAcoes(false); handleExcluir(); }} className="w-full text-left px-4 py-2 hover:bg-muted transition-colors text-red-500 font-semibold">Excluir venda</button>
                  </div>
                )}
              </div>

              {/* Salvar alterações */}
              <button
                onClick={() => handleSave(false)}
                disabled={saving}
                className="px-4 py-2 text-xs font-medium bg-primary text-white hover:bg-primary/90 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <Save size={14} /> {saving ? "Salvando..." : "Salvar"}
              </button>

              {/* Modal Alterar Status */}
              {showAlterarStatus && (
                <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center" onClick={() => setShowAlterarStatus(false)}>
                  <div className="bg-card rounded-xl border border-border p-6 shadow-xl w-72" onClick={e => e.stopPropagation()}>
                    <h3 className="font-bold text-sm mb-4">Alterar Situação</h3>
                    <div className="space-y-2">
                      {["EM_ABERTO","PENDENTE","AGUARDANDO","APROVADA","CONCLUIDA","NAO_APROVADA","CANCELADO"].map(s => (
                        <button key={s} onClick={() => handleAlterarStatus(s)} className="w-full text-left px-4 py-2.5 rounded-lg hover:bg-muted text-sm border border-border transition-colors">
                          {s.replace(/_/g, ' ')}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              <button
                onClick={() => handleSave(false)}
                disabled={saving}
                className="px-4 py-2 text-xs font-medium bg-muted text-foreground hover:bg-muted/80 rounded-lg transition-colors disabled:opacity-50"
              >
                {saving ? "Salvando..." : "Salvar Rascunho"}
              </button>
              <button
                onClick={() => handleSave(true)}
                disabled={saving}
                className="px-4 py-2 text-xs font-medium bg-primary text-white hover:bg-primary/90 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <Save size={14} /> {saving ? "Salvando..." : "Salvar e Aprovar"}
              </button>
            </>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-muted/5 custom-scrollbar">

        {/* ── Bloco 1: Cabeçalho ─────────────────────────── */}
        <div className="bg-card rounded-xl border border-border p-6 space-y-5">
          <h3 className="text-sm font-bold text-foreground border-b border-border pb-3">1. Cabeçalho</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
            {/* Cliente Autocomplete */}
            <div className="md:col-span-5 relative">
              <Field label="Cliente *">
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    value={clienteSelecionado && !showClientes
                      ? `${clienteSelecionado.nome_razao_social} — ${clienteSelecionado.cpf_cnpj}`
                      : clienteBusca}
                    onChange={e => {
                      setClienteBusca(e.target.value);
                      setShowClientes(true);
                      if (clienteId) setClienteId("");
                    }}
                    onFocus={() => setShowClientes(true)}
                    onBlur={() => setTimeout(() => setShowClientes(false), 200)}
                    placeholder="Pesquise por nome, razão social, CPF/CNPJ ou e-mail..."
                    className={`${inputCls} pl-9`}
                  />
                  {showClientes && clientesFiltrados.length > 0 && (
                    <div className="absolute z-30 w-full mt-1 bg-card border border-border rounded-xl shadow-xl max-h-64 overflow-y-auto custom-scrollbar">
                      {clientesFiltrados.map(c => (
                        <button
                          key={c.id}
                          className="w-full text-left px-4 py-2.5 hover:bg-muted/50 border-b border-border/40 last:border-0 transition-colors"
                          onClick={() => { 
                            setClienteId(c.id.toString()); 
                            setClienteBusca(""); 
                            setShowClientes(false); 
                            if (c.representante_id) setRepresentanteId(String(c.representante_id));
                            if (c.vendedor_padrao_id) setRepresentanteId(String(c.vendedor_padrao_id));
                          }}
                        >
                          <span className="block text-sm font-semibold text-foreground">{c.nome_razao_social}</span>
                          <span className="text-xs text-muted-foreground font-mono">{c.cpf_cnpj} · {c.cidade}/{c.uf}</span>
                        </button>
                      ))}
                    </div>
                  )}
                  {showClientes && clienteBusca.length > 0 && clientesFiltrados.length === 0 && (
                    <div className="absolute z-30 w-full mt-1 bg-card border border-border rounded-xl shadow-xl p-4 text-center text-sm text-muted-foreground">
                      Nenhum cliente encontrado.
                    </div>
                  )}
                </div>
              </Field>
            </div>

            <div className="md:col-span-4">
              <Field label="Vendedor / Representante">
                <select value={representanteId} onChange={e => setRepresentanteId(e.target.value)} className={inputCls}>
                  <option value="">Nenhum</option>
                  {representantes.map(r => <option key={r.id} value={r.id}>{r.nome}</option>)}
                </select>
              </Field>
            </div>

            <div className="md:col-span-3">
              <Field label="Natureza da Operação">
                <select
                  value={naturezaOperacao}
                  onChange={e => setNaturezaOperacao(e.target.value)}
                  className={inputCls}
                >
                  <optgroup label="Vendas">
                    <option value="Venda">Venda (Geral)</option>
                    <option value="Venda de produção própria">Venda de produção própria</option>
                    <option value="Venda de produção própria para contribuinte">Venda de produção própria para contribuinte</option>
                    <option value="Venda de mercadoria adquirida de terceiros">Venda de mercadoria adquirida de terceiros</option>
                    <option value="Venda Consignada">Venda Consignada</option>
                    <option value="Entrega Futura">Venda para Entrega Futura</option>
                  </optgroup>
                  <optgroup label="Remessas e Retornos">
                    <option value="Remessa">Remessa (Geral)</option>
                    <option value="Remessa para conserto ou reparo">Remessa para conserto ou reparo</option>
                    <option value="Remessa em bonificação, doação ou brinde">Remessa em bonificação, doação ou brinde</option>
                    <option value="Remessa para demonstração">Remessa para demonstração</option>
                    <option value="Retorno">Retorno (Geral)</option>
                    <option value="Retorno de mercadoria recebida para conserto">Retorno de mercadoria recebida para conserto</option>
                  </optgroup>
                  <optgroup label="Devoluções">
                    <option value="Devolução">Devolução (Geral)</option>
                    <option value="Devolução de venda de produção própria">Devolução de venda de produção própria</option>
                    <option value="Devolução de venda de mercadoria de terceiros">Devolução de venda de mercadoria de terceiros</option>
                  </optgroup>
                  <optgroup label="Outras Operações">
                    <option value="Transferência de mercadoria">Transferência de mercadoria</option>
                    <option value="Exportação/Importação">Exportação/Importação</option>
                    <option value="Prestação de serviço">Prestação de serviço</option>
                    <option value="Nota Complementar">Nota Complementar</option>
                  </optgroup>
                </select>
              </Field>
            </div>
            
            <div className="md:col-span-2 flex items-center pt-6">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input 
                  type="checkbox" 
                  checked={gerarNota}
                  onChange={(e) => setGerarNota(e.target.checked)}
                  className="w-4 h-4 text-primary rounded border-border focus:ring-primary focus:ring-offset-background"
                />
                <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                  Gerar Nota Fiscal
                </span>
              </label>
            </div>

            <div className="md:col-span-3">
              <Field label="Lista de preço">
                <select className={inputCls}>
                  <option>Padrão</option>
                  <option>Atacado</option>
                </select>
              </Field>
            </div>

            <div className="md:col-span-3">
              <Field label="Data prevista de entrega">
                <input
                  type="date"
                  value={dataPrevista}
                  onChange={e => setDataPrevista(e.target.value)}
                  className={inputCls}
                />
              </Field>
            </div>

            <div className="md:col-span-3">
              <Field label="Cód. Rastreamento (Correios/Transp.)">
                <input
                  type="text"
                  value={codigoRastreamento}
                  onChange={e => setCodigoRastreamento(e.target.value)}
                  className={inputCls}
                  placeholder="Ex: BR123456789BR"
                />
              </Field>
            </div>

            <div className="md:col-span-12">
              <label className="flex items-center gap-2.5 text-sm text-foreground cursor-pointer group w-fit">
                <input 
                  type="checkbox" 
                  checked={isEnderecoEntregaDiferente}
                  onChange={(e) => setIsEnderecoEntregaDiferente(e.target.checked)}
                  className="w-4 h-4 rounded border-border text-primary focus:ring-primary/30" 
                />
                <span className="text-muted-foreground group-hover:text-foreground transition-colors">
                  O endereço de entrega do cliente é diferente do endereço de cobrança
                </span>
              </label>
            </div>
            
            {isEnderecoEntregaDiferente && (
              <div className="md:col-span-12 mt-4 p-5 rounded-xl border border-border bg-muted/10 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                <h4 className="text-sm font-semibold text-foreground mb-4">Endereço de entrega</h4>
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  <div className="md:col-span-3"><Field label="CEP"><input type="text" value={enderecoEntrega.cep} onChange={e => updateEnd("cep", e.target.value)} onBlur={handleCepBlur} className={inputCls} placeholder={buscandoCep ? "Buscando..." : ""} disabled={buscandoCep} /></Field></div>
                  <div className="md:col-span-7"><Field label="Endereço"><input type="text" value={enderecoEntrega.endereco} onChange={e => updateEnd("endereco", e.target.value)} className={inputCls} /></Field></div>
                  <div className="md:col-span-2"><Field label="Número"><input type="text" value={enderecoEntrega.numero} onChange={e => updateEnd("numero", e.target.value)} className={inputCls} /></Field></div>
                  
                  <div className="md:col-span-4"><Field label="Complemento"><input type="text" value={enderecoEntrega.complemento} onChange={e => updateEnd("complemento", e.target.value)} className={inputCls} /></Field></div>
                  <div className="md:col-span-3"><Field label="Bairro"><input type="text" value={enderecoEntrega.bairro} onChange={e => updateEnd("bairro", e.target.value)} className={inputCls} /></Field></div>
                  <div className="md:col-span-4"><Field label="Cidade"><input type="text" value={enderecoEntrega.cidade} onChange={e => updateEnd("cidade", e.target.value)} className={inputCls} /></Field></div>
                  <div className="md:col-span-1"><Field label="UF"><input type="text" value={enderecoEntrega.uf} onChange={e => updateEnd("uf", e.target.value)} className={inputCls} maxLength={2} /></Field></div>
                  
                  <div className="md:col-span-6"><Field label="Destinatário (Razão Social)"><input type="text" value={enderecoEntrega.destinatario} onChange={e => updateEnd("destinatario", e.target.value)} className={inputCls} /></Field></div>
                  <div className="md:col-span-2">
                    <Field label="Tipo de Pessoa">
                      <select value={enderecoEntrega.tipoPessoa} onChange={e => updateEnd("tipoPessoa", e.target.value)} className={inputCls}>
                        <option>Física</option>
                        <option>Jurídica</option>
                      </select>
                    </Field>
                  </div>
                  <div className="md:col-span-4"><Field label="CPF/CNPJ"><input type="text" value={enderecoEntrega.cpfCnpj} onChange={e => updateEnd("cpfCnpj", e.target.value)} onBlur={handleCnpjBlur} className={inputCls} placeholder={buscandoCnpj ? "Buscando CNPJ..." : "Digite para buscar"} disabled={buscandoCnpj} /></Field></div>
                  <div className="md:col-span-4"><Field label="Insc. estadual"><input type="text" value={enderecoEntrega.inscEstadual} onChange={e => updateEnd("inscEstadual", e.target.value)} className={inputCls} /></Field></div>
                  <div className="md:col-span-4"><Field label="Fone"><input type="text" value={enderecoEntrega.fone} onChange={e => updateEnd("fone", e.target.value)} className={inputCls} /></Field></div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Bloco 2: Itens ─────────────────────────────── */}
        <div className="bg-card rounded-xl border border-border">
          <div className="px-6 py-3 border-b border-border flex items-center justify-between bg-muted/20 rounded-t-xl">
            <h3 className="text-sm font-bold text-foreground">2. Itens do Pedido</h3>
          </div>

          <div className="w-full">
            <table className="w-full text-sm">
              <thead className="bg-muted/30 border-b border-border text-xs text-muted-foreground">
                <tr>
                  <th className="text-left px-3 py-3 font-semibold w-10">Nº</th>
                  <th className="text-left px-3 py-3 font-semibold">Descrição</th>
                  <th className="text-left px-3 py-3 font-semibold w-32">SKU</th>
                  <th className="text-right px-3 py-3 font-semibold w-20">Qtde</th>
                  <th className="text-right px-3 py-3 font-semibold w-36">Preço lista</th>
                  <th className="text-right px-3 py-3 font-semibold w-28">Desc %</th>
                  <th className="text-right px-3 py-3 font-semibold w-32">Preço un</th>
                  <th className="text-right px-3 py-3 font-semibold w-36">Total</th>
                  <th className="px-2 py-3 w-8"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {itens.map((item, i) => {
                  const precoUn = item.preco * (1 - item.descPerc / 100);
                  const total = precoUn * item.qty;
                  return (
                    <tr key={i} className="hover:bg-muted/20 transition-colors group">
                      <td className="px-3 py-2.5 text-xs text-muted-foreground">{i + 1}</td>
                      <td className="px-3 py-2.5 font-medium text-foreground">{item.nome}</td>
                      <td className="px-3 py-2.5 text-xs font-mono text-muted-foreground max-w-[8rem] truncate">{item.sku}</td>
                      <td className="px-3 py-2.5">
                        <input
                          type="number"
                          min={1}
                          value={item.qty}
                          onChange={e => updateItem(i, "qty", Math.max(1, +e.target.value))}
                          className="w-full border border-border rounded-md px-2 py-1 text-right text-sm focus:ring-1 focus:ring-primary/30 focus:outline-none bg-background text-foreground"
                        />
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="relative">
                          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">R$</span>
                          <input
                            type="number"
                            min={0}
                            step={0.01}
                            value={item.preco}
                            onChange={e => updateItem(i, "preco", Math.max(0, +e.target.value))}
                            className="w-full border border-border rounded-md pl-7 pr-2 py-1 text-right text-sm focus:ring-1 focus:ring-primary/30 focus:outline-none bg-background text-foreground"
                          />
                        </div>
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="relative">
                          <input
                            type="number"
                            min={0}
                            max={100}
                            step={0.1}
                            value={item.descPerc}
                            onChange={e => updateItem(i, "descPerc", Math.min(100, +e.target.value))}
                            className="w-full border border-border rounded-md px-2 py-1 pr-6 text-right text-sm focus:ring-1 focus:ring-primary/30 focus:outline-none bg-background text-foreground"
                          />
                          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground pointer-events-none">%</span>
                        </div>
                      </td>
                      <td className="px-3 py-2.5 text-right font-medium text-sm">{brl(precoUn)}</td>
                      <td className="px-3 py-2.5 text-right font-bold text-foreground text-sm">{brl(total)}</td>
                      <td className="px-2 py-2.5">
                        <button
                          onClick={() => setItens(itens.filter((_, j) => j !== i))}
                          className="p-1.5 rounded-md text-muted-foreground hover:bg-red-500/10 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
                
                {/* Linha de Busca Rápida (Sempre presente no final) */}
                <tr className="bg-muted/10">
                  <td className="px-3 py-2.5 text-xs text-muted-foreground">{itens.length + 1}</td>
                  <td className="px-3 py-2.5" colSpan={8}>
                    <div className="relative w-full max-w-sm">
                      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <input
                        type="text"
                        value={produtoBusca}
                        onChange={e => { setProdutoBusca(e.target.value); setShowProdutos(true); }}
                        onFocus={() => setShowProdutos(true)}
                        onBlur={() => setTimeout(() => setShowProdutos(false), 200)}
                        placeholder="Pesquise por descrição ou código (SKU)"
                        className="w-full bg-background border border-border rounded-md pl-9 pr-3 py-1.5 text-sm focus:ring-1 focus:ring-primary/30 focus:outline-none"
                      />
                      {showProdutos && produtosFiltrados.length > 0 && (
                        <div className="absolute z-30 left-0 w-[500px] mt-1 bg-card border border-border rounded-xl shadow-xl max-h-64 overflow-y-auto custom-scrollbar">
                          {produtosFiltrados.map(p => (
                            <button
                              key={p.id}
                              className="w-full text-left px-4 py-2.5 hover:bg-muted/50 border-b border-border/40 last:border-0 transition-colors flex justify-between items-center"
                              onClick={() => {
                                addItem(p.id.toString());
                                setProdutoBusca("");
                                setShowProdutos(false);
                              }}
                            >
                              <div>
                                <span className="block text-sm font-medium text-foreground">{p.nome}</span>
                                <span className="text-xs text-muted-foreground font-mono">{p.sku} · Estoque: {p.estoque_atual}</span>
                              </div>
                              <span className="text-xs font-semibold text-primary ml-4">{brl(p.preco_venda)}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          
          {/* Rodapé de Ações da Tabela */}
          <div className="px-4 py-3 bg-card border-t border-border flex items-center gap-6">
            <button 
              className="flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
              onClick={() => {
                // Focar no input de busca se houver botão adicionar item
                const input = document.querySelector('input[placeholder="Pesquise por descrição ou código (SKU)"]') as HTMLInputElement;
                if (input) input.focus();
              }}
            >
              <Plus size={16} /> adicionar outro item
            </button>
            <button 
              className="flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
              onClick={() => setShowAdvancedSearch(true)}
            >
              <Search size={16} /> busca avançada de itens
            </button>
          </div>
        </div>

        {/* ── Bloco 3: Totais ────────────────────────────── */}
        <div className="bg-card rounded-xl border border-border p-6">
          <h3 className="text-sm font-bold text-foreground border-b border-border pb-3 mb-5">3. Totais</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { label: "Nº de itens", value: String(itens.length) },
              { label: "Soma de qtdes", value: String(somaQtdes) },
              { label: "Total produtos", value: brl(totalProdutos) },
              { label: "Desconto global", value: `- ${brl(descontoGlobal)}` },
              { label: "Total da venda", value: brl(totalVenda), highlight: true },
            ].map(s => (
              <div key={s.label} className={`rounded-lg border p-3 ${s.highlight ? "border-primary/30 bg-primary/5" : "border-border bg-muted/20"}`}>
                <p className="text-xs text-muted-foreground mb-1">{s.label}</p>
                <p className={`text-sm font-bold ${s.highlight ? "text-primary" : "text-foreground"}`}>{s.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Bloco 4: Detalhes ──────────────────────────── */}
        <div className="bg-card rounded-xl border border-border p-6 space-y-5">
          <h3 className="text-sm font-bold text-foreground border-b border-border pb-3">4. Detalhes da Venda</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            <Field label="Data da venda">
              <input type="date" defaultValue={new Date().toISOString().split("T")[0]} className={inputCls} readOnly />
            </Field>
            <Field label="Data prevista de entrega">
              <input type="date" value={dataPrevista} onChange={e => setDataPrevista(e.target.value)} className={inputCls} />
            </Field>
            <Field label="Data de envio">
              <input type="date" className={inputCls} />
            </Field>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            <Field label="Desconto global (R$)">
              <input type="number" min={0} value={descontoGlobal} onChange={e => setDescontoGlobal(+e.target.value)} className={inputCls} placeholder="0,00" />
            </Field>
            <Field label="Frete pago pelo cliente">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">R$</span>
                <input type="number" min={0} value={freteCliente} onChange={e => setFreteCliente(+e.target.value)} className={`${inputCls} pl-8`} />
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">Transferido para a nota fiscal</p>
            </Field>
            <Field label="Frete pago pela empresa">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">R$</span>
                <input type="number" min={0} value={freteEmpresa} onChange={e => setFreteEmpresa(+e.target.value)} className={`${inputCls} pl-8`} />
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">Uso interno — custo de frete</p>
            </Field>
            <Field label="Despesas">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">R$</span>
                <input type="number" min={0} value={despesas} onChange={e => setDespesas(+e.target.value)} className={`${inputCls} pl-8`} />
              </div>
            </Field>
          </div>
        </div>

        {/* ── Bloco 5: Pagamento ─────────────────────────── */}
        <div className="bg-card rounded-xl border border-border p-6 space-y-5">
          <h3 className="text-sm font-bold text-foreground border-b border-border pb-3">5. Pagamento</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            <Field label="Forma de recebimento">
              <select 
                value={formaRecebimento} 
                onChange={e => {
                  const val = e.target.value;
                  setFormaRecebimento(val);
                  if (["Boleto", "Cheque", "Cartão de Crédito"].includes(val)) {
                    setShowPagModal(true);
                  } else {
                    setShowPagModal(false);
                  }
                }} 
                className={inputCls}
              >
                <option value="">Selecione...</option>
                <option>Boleto</option>
                <option>Pix</option>
                <option>Pix Entrega ou Retirada</option>
                <option>Cheque</option>
                <option>Dinheiro</option>
                <option>Cartão de Crédito</option>
                <option>Transferência</option>
              </select>
            </Field>
            {!showPagModal && (
              <Field label="Condição de pagamento">
                <input
                  type="text"
                  value={condicaoPagamento}
                  onChange={e => setCondicaoPagamento(e.target.value)}
                  placeholder="Ex: 30 60, 3x, À vista"
                  className={inputCls}
                />
              </Field>
            )}
          </div>

          {showPagModal && (
            <div className="mt-6 pt-6 border-t border-border space-y-6 animate-in fade-in slide-in-from-top-4 duration-300">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <Field label="Meio">
                  <select value={pagModalMeio} onChange={e => setPagModalMeio(e.target.value)} className={inputCls}>
                    <option>Banco</option>
                    <option>Dinheiro</option>
                  </select>
                </Field>
                <Field label="Conta bancária">
                  <select value={pagModalConta} onChange={e => setPagModalConta(e.target.value)} className={inputCls}>
                    <option value="">Não definida</option>
                    <option>Conta Principal</option>
                  </select>
                </Field>
                <Field label="Categoria">
                  <select value={pagModalCategoria} onChange={e => setPagModalCategoria(e.target.value)} className={inputCls}>
                    <option value="">Selecione...</option>
                    <option>Vendas</option>
                  </select>
                </Field>
              </div>

              <div>
                <Field label="Condição de pagamento">
                  <div className="flex items-center gap-2 relative">
                    <input type="text" value={condicaoPagamento} onChange={e => setCondicaoPagamento(e.target.value)} placeholder="Ex: 30 60, 3x" className={`${inputCls} flex-1`} />
                    <button onClick={() => setShowGerarParcelas(!showGerarParcelas)} className="px-4 py-2 border border-border rounded-lg text-sm hover:bg-muted transition-colors whitespace-nowrap bg-background text-foreground">
                      gerar parcelas
                    </button>
                    {showGerarParcelas && (
                      <div className="absolute right-0 top-full mt-1 w-48 bg-card border border-border rounded-lg shadow-xl z-50 py-1 max-h-64 overflow-y-auto">
                        {[1,2,3,4,5,6,7,8,9,10,11,12].map(n => (
                          <button key={n} onClick={() => gerarParcelas(n)} className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-primary hover:text-primary-foreground transition-colors">
                            parcelado em {n}x
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </Field>

                {pagModalParcelas.length > 0 && (
                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {pagModalParcelas.map((p, idx) => (
                      <div key={idx} className="bg-muted/30 border border-border rounded-lg p-3 space-y-2">
                        <div className="text-xs font-semibold text-muted-foreground uppercase">Parcela {idx+1}</div>
                        <input type="date" value={p.v} onChange={e => {
                          const n = [...pagModalParcelas];
                          n[idx].v = e.target.value;
                          setPagModalParcelas(n);
                        }} className={`${inputCls} text-sm py-1 px-2`} />
                        <div className="relative">
                          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">R$</span>
                          <input type="number" value={p.val} onChange={e => {
                            const n = [...pagModalParcelas];
                            n[idx].val = +e.target.value;
                            setPagModalParcelas(n);
                          }} className={`${inputCls} text-sm py-1 pl-7`} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ── Bloco 6: Transporte ────────────────────────── */}
        <div className="bg-card rounded-xl border border-border p-6 space-y-5">
          <h3 className="text-sm font-bold text-foreground border-b border-border pb-3">6. Transporte</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            <Field label="Frete por conta">
              <select value={fretePorConta} onChange={e => setFretePorConta(e.target.value)} className={inputCls}>
                <option value="">Selecione...</option>
                <option>Contratação do Frete por conta do Remetente (CIF)</option>
                <option>Contratação do Frete por conta do Destinatário (FOB)</option>
                <option>Contratação do Frete por conta de Terceiros</option>
                <option>Transporte Próprio por conta do Remetente</option>
                <option>Transporte Próprio por conta do Destinatário</option>
                <option>Sem Ocorrência de Transporte</option>
              </select>
            </Field>
            <Field label="Forma de envio">
              <select value={formaEnvio} onChange={e => setFormaEnvio(e.target.value)} className={inputCls}>
                <option value="">Não definida</option>
                <option>Correios</option>
                <option>Transportadora</option>
                <option>Retirar pessoalmente</option>
              </select>
            </Field>
            <Field label="Enviar para expedição">
              <select className={inputCls}>
                <option>Sim</option>
                <option>Não</option>
              </select>
            </Field>
            <Field label="Depósito de saída">
              <select className={inputCls}>
                <option>Padrão</option>
              </select>
            </Field>
          </div>
        </div>

        {/* ── Bloco 7: Observações ───────────────────────── */}
        <div className="bg-card rounded-xl border border-border p-6 space-y-4">
          <h3 className="text-sm font-bold text-foreground border-b border-border pb-3">7. Observações</h3>
          <Field label="Observações para o cliente">
            <textarea
              rows={3}
              value={obsPublica}
              onChange={e => setObsPublica(e.target.value)}
              placeholder="Será impressa no orçamento e transferida para a nota fiscal..."
              className={`${inputCls} resize-none`}
            />
          </Field>
          <Field label="Observações internas">
            <textarea
              rows={2}
              value={obsInterna}
              onChange={e => setObsInterna(e.target.value)}
              placeholder="Uso interno — não aparece na nota ou no orçamento do cliente..."
              className={`${inputCls} resize-none`}
            />
          </Field>
        </div>

        {/* ── Modal de Busca Avançada ────────────────────── */}
        {showAdvancedSearch && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-card w-full max-w-4xl rounded-2xl shadow-2xl border border-border flex flex-col h-[80vh] overflow-hidden animate-in zoom-in-95 duration-200">
              
              <div className="px-6 py-4 border-b border-border flex justify-between items-center bg-muted/10">
                <h2 className="text-lg font-bold text-foreground">Busca avançada de produtos</h2>
                <button 
                  onClick={() => setShowAdvancedSearch(false)}
                  className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 text-sm font-medium"
                >
                  fechar <X size={16} />
                </button>
              </div>

              <div className="p-6 flex-1 flex flex-col overflow-hidden gap-4">
                <div className="relative">
                  <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    value={advancedSearchQuery}
                    onChange={e => setAdvancedSearchQuery(e.target.value)}
                    placeholder="Pesquisar por descrição, SKU, código de barras..."
                    className="w-full bg-background border border-border rounded-xl pl-11 pr-4 py-3 text-sm focus:ring-2 focus:ring-primary/30 focus:outline-none"
                    autoFocus
                  />
                </div>

                <div className="flex-1 overflow-y-auto border border-border rounded-xl bg-background custom-scrollbar">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/30 border-b border-border text-xs text-muted-foreground sticky top-0 z-10 backdrop-blur-md">
                      <tr>
                        <th className="text-left px-4 py-3 font-semibold w-10"></th>
                        <th className="text-left px-4 py-3 font-semibold">Descrição</th>
                        <th className="text-left px-4 py-3 font-semibold">Código</th>
                        <th className="text-right px-4 py-3 font-semibold">Preço</th>
                        <th className="text-right px-4 py-3 font-semibold">Estoque</th>
                        <th className="px-4 py-3"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {produtos
                        .filter(p => p.nome.toLowerCase().includes(advancedSearchQuery.toLowerCase()) || p.sku.toLowerCase().includes(advancedSearchQuery.toLowerCase()))
                        .map(p => (
                          <tr key={p.id} className="hover:bg-muted/10 transition-colors cursor-pointer group" onClick={() => {
                            addItem(p.id.toString());
                            setShowAdvancedSearch(false);
                            setAdvancedSearchQuery("");
                          }}>
                            <td className="px-4 py-3">
                              <div className="w-4 h-4 rounded-full border border-primary/50 flex items-center justify-center group-hover:border-primary">
                                <div className="w-2 h-2 rounded-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                              </div>
                            </td>
                            <td className="px-4 py-3 font-medium text-foreground">{p.nome}</td>
                            <td className="px-4 py-3 text-muted-foreground font-mono text-xs">{p.sku}</td>
                            <td className="px-4 py-3 text-right text-foreground">{brl(p.preco_venda)}</td>
                            <td className="px-4 py-3 text-right font-medium text-primary">{p.estoque_atual}</td>
                            <td className="px-4 py-3 text-right text-primary text-xs hover:underline">adicionar</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
      <PrintableProposal data={printData} />
      <PrintableProductionOrder data={printProductionData} />
    </div>
  );
}

// ── Propostas (listagem) ──────────────────────────────────────────────────────
export function Pedidos() {

  const [printData, setPrintData] = useState<any>(null);
  const [printProductionData, setPrintProductionData] = useState<any>(null);
  
  async function handlePrint(id: number, e: React.MouseEvent) {
    e.stopPropagation();
    try {
      const res = await api.get<any>(`/vendas/pedidos/${id}`);
      setPrintData(res);
      setTimeout(() => window.print(), 300);
    } catch {
      alert("Erro ao carregar dados para impressão");
    }
  }
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filterDataInicial, setFilterDataInicial] = useState("");
  const [filterDataFinal, setFilterDataFinal] = useState("");
  const [filterValorMin, setFilterValorMin] = useState("");
  const [filterValorMax, setFilterValorMax] = useState("");
  const [filterVendedor, setFilterVendedor] = useState("");
  
  const hasActiveFilters = !!(filterDataInicial || filterDataFinal || filterValorMin || filterValorMax || filterVendedor);
  const [view, setView] = useState<"list" | "new" | number>("list");
  const [filter, setFilter] = useState("todos");
  const { can } = useAuth();

  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadData(silent: boolean = false) {
    try {
      if (!silent) setLoading(true);
      const res = await api.get<any[]>("/vendas/pedidos?tipo=PEDIDO");
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      if (!silent) setLoading(false);
    }
  }

  useEffect(() => { if (view === "list") loadData(); }, [view]);

  const filters = [
    { label: "Todas", value: "todos" },
    { label: "Em aberto", value: "EM_ABERTO" },
    { label: "Aprovado", value: "APROVADO" },
    { label: "Enviado para a Produção", value: "ENVIADO_PRODUCAO" },
    { label: "Em Produção", value: "EM_PRODUCAO" },
    { label: "Faturado", value: "FATURADO" },
    { label: "Pronto para Envio", value: "PRONTO_ENVIO" },
    { label: "Enviado", value: "ENVIADO" },
    { label: "Entregue", value: "ENTREGUE" },
    { label: "Cancelados", value: "CANCELADO" }
  ];
  
  const [searchVendedor, setSearchVendedor] = useState("");

  const filteredData = data.filter(o => {
    const passStatus = filter === "todos" || o.status === filter;
    
    let passSearch = true;
    if (searchVendedor) {
      const term = searchVendedor.toLowerCase();
      passSearch = (o.cliente_nome?.toLowerCase() || "").includes(term) ||
                   (o.vendedor_interno?.nome_completo?.toLowerCase() || "").includes(term) ||
                   (o.representante?.nome?.toLowerCase() || "").includes(term) ||
                   o.id.toString().includes(term);
    }
    
    let passDate = true;
    if (filterDataInicial) passDate = passDate && new Date(o.criado_em) >= new Date(filterDataInicial + "T00:00:00");
    if (filterDataFinal) passDate = passDate && new Date(o.criado_em) <= new Date(filterDataFinal + "T23:59:59");
    
    let passValor = true;
    if (filterValorMin) passValor = passValor && Number(o.valor_total) >= Number(filterValorMin);
    if (filterValorMax) passValor = passValor && Number(o.valor_total) <= Number(filterValorMax);
    
    let passVend = true;
    if (filterVendedor) {
      const term = filterVendedor.toLowerCase();
      passVend = (o.vendedor_interno?.nome_completo?.toLowerCase() || "").includes(term) ||
                 (o.representante?.nome?.toLowerCase() || "").includes(term);
    }

    return passStatus && passSearch && passDate && passValor && passVend;
  });

  function exportCSV() {
    if (filteredData.length === 0) return alert("Nenhum dado para exportar.");
    const headers = ["ID", "Data", "Cliente", "Total", "Status", "Vendedor"];
    const rows = filteredData.map(o => [
      o.id,
      new Date(o.criado_em).toLocaleDateString("pt-BR"),
      `"${o.cliente_nome || ''}"`,
      o.valor_total,
      o.status,
      `"${o.vendedor_interno?.nome_completo || o.representante?.nome || ''}"`
    ]);
    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `export_pedidos.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }


  const statusMap: Record<string, { label: string; variant: any }> = {
    EM_ABERTO:          { label: "Em aberto",               variant: "neutral" },
    APROVADO:           { label: "Aprovado",                variant: "success" },
    ENVIADO_PRODUCAO:   { label: "Enviado para a Produção", variant: "warning" },
    EM_PRODUCAO:        { label: "Em Produção",             variant: "warning" },
    FATURADO:           { label: "Faturado",                variant: "success" },
    PRONTO_ENVIO:       { label: "Pronto para Envio",       variant: "success" },
    ENVIADO:            { label: "Enviado",                 variant: "success" },
    ENTREGUE:           { label: "Entregue",                variant: "success" },
    CANCELADO:          { label: "Cancelado",               variant: "danger"  },
  };

  if (view === "new" || typeof view === "number") {
    return (
      <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex flex-col p-4 sm:p-6">
        <div className="max-w-[1400px] w-full mx-auto h-full">
          <NovoPedidoForm 
            pedidoId={typeof view === "number" ? view : undefined}
            onCancel={() => setView("list")} 
            onSave={() => { setView("list"); loadData(); }} 
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm">
        <TableToolbar
          title="Pedidos de Venda"
          count={filteredData.length}
          onNew={can("pedidos", "create") ? () => setView("new") : undefined}
          newLabel="Novo Pedido"
          search={searchVendedor}
          onSearch={setSearchVendedor}
          onFilterClick={() => setShowFilterModal(true)}
          onExportClick={exportCSV}
          hasActiveFilters={hasActiveFilters}
        />

        <div className="px-5 pt-3 pb-0 flex gap-1.5 border-b border-border overflow-x-auto custom-scrollbar bg-card">
          {filters.map(f => {
            const count = data.filter(d => {
              const passStatus = f.value === "todos" || d.status === f.value;
              if (!searchVendedor) return passStatus;
              const term = searchVendedor.toLowerCase();
              return passStatus && (
                (d.vendedor_interno?.nome_completo?.toLowerCase() || "").includes(term) ||
                (d.representante?.nome?.toLowerCase() || "").includes(term)
              );
            }).length;
            return (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={`text-[11px] px-3 py-2 font-medium whitespace-nowrap transition-colors flex flex-col items-center justify-start gap-1 min-w-[85px] ${
                  filter === f.value
                    ? "border-b-2 border-foreground text-foreground"
                    : "border-b-2 border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <div className="flex items-center gap-1.5 h-4">
                  {f.value !== 'todos' && f.value !== 'EM_ABERTO' && (
                    <div className={`w-1.5 h-1.5 rounded-full ${
                      f.value === 'APROVADO' ? 'bg-emerald-400' :
                      f.value === 'ENVIADO_PRODUCAO' ? 'bg-orange-400' :
                      f.value === 'EM_PRODUCAO' ? 'bg-orange-500' :
                      f.value === 'FATURADO' ? 'bg-blue-400' :
                      f.value === 'PRONTO_ENVIO' ? 'bg-teal-400' :
                      f.value === 'ENVIADO' ? 'bg-indigo-400' :
                      f.value === 'ENTREGUE' ? 'bg-lime-500' :
                      f.value === 'CANCELADO' ? 'bg-red-500' : 'bg-primary'
                    }`} />
                  )}
                  {f.label.toLowerCase()}
                </div>
                <div className="h-4 flex items-center">
                  {count > 0 && (
                    <span className="text-[11px] opacity-80">{count.toString().padStart(2, '0')}</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        <div className="overflow-x-auto min-h-[400px]">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">Carregando pedidos...</div>
          ) : filteredData.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground flex flex-col items-center gap-3">
              <FileText size={40} strokeWidth={1} className="text-muted-foreground/40" />
              <p className="text-sm">Nenhum pedido encontrado.</p>
              <button onClick={() => setView("new")} className="text-xs px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90">
                Criar primeiro pedido
              </button>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="text-xs text-muted-foreground bg-muted/30 border-b border-border">
                  <th className="text-left px-5 py-3 font-semibold">Nº</th>
                  <th className="text-left px-4 py-3 font-semibold">Cliente</th>
                  <th className="text-left px-4 py-3 font-semibold hidden lg:table-cell">Vendedor</th>
                  <th className="text-left px-4 py-3 font-semibold hidden md:table-cell">Data</th>
                  <th className="text-right px-4 py-3 font-semibold">Valor</th>
                  <th className="text-left px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 text-right font-semibold">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredData.map(o => {
                  const s = statusMap[o.status] ?? { label: o.status, variant: "neutral" };
                  return (
                    <tr 
                      key={o.id} 
                      className="hover:bg-muted/30 transition-colors group cursor-pointer"
                      onClick={() => setView(o.id)}
                    >
                      <td className="px-5 py-3.5 text-xs font-mono text-muted-foreground flex flex-col gap-1 items-start">
                        <span>#{o.id}</span>
                        {o.gerar_nota === false && (
                          <span className="text-[9px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">Sem Nota</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-xs font-medium text-foreground">{o.cliente_nome}</td>
                      <td className="px-4 py-3.5 text-xs text-muted-foreground hidden lg:table-cell">{o.vendedor_interno?.nome_completo || o.representante?.nome || "-"}</td>
                      <td className="px-4 py-3.5 text-xs text-muted-foreground hidden md:table-cell">
                        {new Date(o.data_pedido).toLocaleDateString("pt-BR")}
                      </td>
                      <td className="px-4 py-3.5 text-xs font-semibold text-right">{brl(o.valor_total)}</td>
                      <td className="px-4 py-3.5" onClick={e => e.stopPropagation()}>
                        <select 
                          className={`text-[11px] font-semibold px-2.5 py-1 rounded-full outline-none cursor-pointer border-none appearance-none text-center ${
                            s.variant === 'success' ? 'bg-emerald-100 text-emerald-800' :
                            s.variant === 'warning' ? 'bg-amber-100 text-amber-800' :
                            s.variant === 'danger' ? 'bg-rose-100 text-rose-800' :
                            s.variant === 'info' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}
                          value={o.status}
                          onChange={async (e) => {
                            try {
                                await api.post(`/vendas/pedidos/${o.id}/alterar-status`, { status: e.target.value });
                                toast.success("Status atualizado!");
                                loadData(true);
                            } catch(err: any) {
                                toast.error(err.message || "Erro ao alterar status");
                            }
                          }}
                        >
                          <option value="EM_ABERTO">Em aberto</option>
                          <option value="APROVADO">Aprovado</option>
                          <option value="ENVIADO_PRODUCAO">Enviado p/ Produção</option>
                          <option value="EM_PRODUCAO">Em Produção</option>
                          <option value="FATURADO">Faturado</option>
                          <option value="PRONTO_ENVIO">Pronto para Envio</option>
                          <option value="ENVIADO">Enviado</option>
                          <option value="ENTREGUE">Entregue</option>
                          <option value="CANCELADO">Cancelado</option>
                        </select>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center justify-end gap-1 opacity-50 group-hover:opacity-100 transition-opacity">
                          {o.status === "EM_ABERTO" && o.tipo === "COTACAO" && (
                            <button
                              onClick={async (e) => {
                                e.stopPropagation();
                                if (confirm("Aprovar e converter esta proposta em Pedido de Venda?")) {
                                  await api.post(`/vendas/pedidos/${o.id}/converter-em-pedido`);
                                  loadData(true);
                                }
                              }}
                              className="text-xs px-3 py-1 bg-emerald-500/10 text-emerald-600 rounded-lg hover:bg-emerald-500/20 font-medium transition-colors"
                            >
                              → Gerar Pedido
                            </button>
                          )}
                          {o.status === "EM_ABERTO" && o.tipo === "PEDIDO" && (
                            <button
                              onClick={async (e) => {
                                e.stopPropagation();
                                if (confirm("Aprovar este pedido? O estoque será baixado.")) {
                                  try {
                                    await api.post(`/vendas/pedidos/${o.id}/aprovar`);
                                    loadData(true);
                                  } catch (err: any) {
                                    alert(err?.response?.data?.detail || "Erro ao aprovar.");
                                  }
                                }
                              }}
                              className="text-xs px-3 py-1 bg-emerald-500/10 text-emerald-600 rounded-lg hover:bg-emerald-500/20 font-medium transition-colors"
                            >
                              ✓ Aprovar
                            </button>
                          )}
                          {o.status === "APROVADO" && (
                            <button
                              onClick={async (e) => {
                                e.stopPropagation();
                                if (confirm("Marcar como em preparação de envio?")) {
                                  await api.post(`/vendas/pedidos/${o.id}/preparar-envio`);
                                  loadData(true);
                                }
                              }}
                              className="text-xs px-3 py-1 bg-blue-500/10 text-blue-600 rounded-lg hover:bg-blue-500/20 font-medium transition-colors"
                            >
                              📦 Preparar Envio
                            </button>
                          )}
                          {o.status === "PRONTO_ENVIO" && (
                            <button
                              onClick={async (e) => {
                                e.stopPropagation();
                                if (confirm("Confirmar envio ao cliente?")) {
                                  await api.post(`/vendas/pedidos/${o.id}/enviar`, { codigo_rastreio: "N/A" });
                                  loadData(true);
                                }
                              }}
                              className="text-xs px-3 py-1 bg-indigo-500/10 text-indigo-600 rounded-lg hover:bg-indigo-500/20 font-medium transition-colors"
                            >
                              🚚 Enviar
                            </button>
                          )}
                          {o.status === "ENVIADO" && (
                            <button
                              onClick={async (e) => {
                                e.stopPropagation();
                                if (confirm("Confirmar entrega ao cliente?")) {
                                  await api.post(`/vendas/pedidos/${o.id}/entregar`);
                                  loadData(true);
                                }
                              }}
                              className="text-xs px-3 py-1 bg-lime-500/10 text-lime-600 rounded-lg hover:bg-lime-500/20 font-medium transition-colors"
                            >
                              ✅ Entregue
                            </button>
                          )}
                          <button
                            onClick={(e) => handlePrint(o.id, e)}
                            title="Imprimir / Salvar PDF"
                            className="p-1.5 rounded-md hover:bg-gray-500/10 text-muted-foreground hover:text-gray-700 transition-colors"
                          >
                            <Printer size={14} />
                          </button>
                          <button
                            onClick={async (e) => {
                              e.stopPropagation();
                              if (confirm("Excluir este pedido de vez?")) {
                                try {
                                  await api.delete(`/vendas/pedidos/${o.id}`);
                                  toast.success("Pedido excluído de vez.");
                                  loadData(true);
                                } catch (err: any) {
                                  toast.error(err?.message || "Erro ao excluir.");
                                }
                              }
                            }}
                            className="p-1.5 rounded-md hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <PrintableProposal data={printData} />
      <PrintableProductionOrder data={printProductionData} />

      <Modal title="Filtros Avançados" open={showFilterModal} onClose={() => setShowFilterModal(false)}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Data Inicial" type="date" value={filterDataInicial} onChange={e => setFilterDataInicial(e.target.value)} />
            <Input label="Data Final" type="date" value={filterDataFinal} onChange={e => setFilterDataFinal(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Valor Mínimo (R$)" type="number" step="0.01" value={filterValorMin} onChange={e => setFilterValorMin(e.target.value)} />
            <Input label="Valor Máximo (R$)" type="number" step="0.01" value={filterValorMax} onChange={e => setFilterValorMax(e.target.value)} />
          </div>
          <Input label="Vendedor / Representante" type="text" placeholder="Nome do vendedor..." value={filterVendedor} onChange={e => setFilterVendedor(e.target.value)} />
          
          <div className="pt-4 flex justify-end gap-2 border-t border-border mt-6">
            <button onClick={() => {
              setFilterDataInicial(""); setFilterDataFinal(""); setFilterValorMin(""); setFilterValorMax(""); setFilterVendedor("");
            }} className="text-xs px-4 py-2 border border-border rounded-lg text-muted-foreground hover:bg-muted">Limpar Filtros</button>
            <button onClick={() => setShowFilterModal(false)} className="text-xs px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90">Aplicar</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default Pedidos;
