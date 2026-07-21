import React, { useState, useEffect } from "react";
import { api } from "../services/api";
import { TableToolbar, Badge, fmtFull, Modal, Input } from "../components/ui/SharedUI";
import { DollarSign, CheckCircle, Clock, Search, ArrowRight, RefreshCw, FileText, Check, AlertCircle } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export function Faturamento() {
  const [pedidos, setPedidos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [faturamentoModal, setFaturamentoModal] = useState(false);
  const [notaRascunho, setNotaRascunho] = useState<any>(null);
  const [loadingModal, setLoadingModal] = useState(false);
  const [successState, setSuccessState] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await api.get("/vendas/pedidos");
      setPedidos(res as any[]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handlePrepararFaturamento = async (id: number) => {
    try {
      setSuccessState(false);
      setLoadingModal(true);
      setFaturamentoModal(true);
      const res = await api.get(`/fiscal/preparar-faturamento/${id}`);
      setNotaRascunho(res);
    } catch (err) {
      alert("Erro ao preparar faturamento.");
      setFaturamentoModal(false);
    } finally {
      setLoadingModal(false);
    }
  };

  const handleConfirmarEmissao = async () => {
    if (!notaRascunho) return;
    try {
      await api.post("/fiscal/emitir", notaRascunho);
      setSuccessState(true);
      setTimeout(() => {
        setSuccessState(false);
        setFaturamentoModal(false);
        loadData();
      }, 2500);
    } catch (err) {
      alert("Erro ao emitir a nota fiscal.");
    }
  };

  // Cálculos de Indicadores
  const pedidosComNota = pedidos.filter(p => p.gerar_nota !== false);
  const pedidosAFaturar = pedidosComNota.filter(p => ["EM_ABERTO", "APROVADO", "PREPARANDO_ENVIO", "PRONTO_ENVIO"].includes(p.status));
  const totalAFaturar = pedidosAFaturar.reduce((acc, p) => acc + (p.valor_total || 0), 0);
  const pedidosFaturados = pedidosComNota.filter(p => p.status === "FATURADO" || p.status === "ENVIADO" || p.status === "ENTREGUE");
  const totalFaturado = pedidosFaturados.reduce((acc, p) => acc + (p.valor_total || 0), 0);
  
  const ticketMedio = pedidosFaturados.length > 0 ? totalFaturado / pedidosFaturados.length : 0;

  // Mock dados do gráfico (simulando faturamento dos últimos 7 dias baseado nos faturados)
  const chartData = [
    { name: "Seg", valor: totalFaturado * 0.1 },
    { name: "Ter", valor: totalFaturado * 0.2 },
    { name: "Qua", valor: totalFaturado * 0.15 },
    { name: "Qui", valor: totalFaturado * 0.25 },
    { name: "Sex", valor: totalFaturado * 0.3 },
    { name: "Sáb", valor: 0 },
    { name: "Dom", valor: 0 },
  ];

  const filtered = pedidosAFaturar.filter(p => 
    p.cliente_nome?.toLowerCase().includes(search.toLowerCase()) || 
    p.id.toString().includes(search)
  );

  return (
    <div className="space-y-4 fade-in">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card rounded-xl p-4 border border-border">
          <p className="text-xs text-muted-foreground flex items-center gap-1.5"><DollarSign size={14} className="text-emerald-500" /> Faturado Mês</p>
          <p className="text-2xl font-bold mt-2 text-foreground" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{fmtFull(totalFaturado)}</p>
          <p className="text-xs text-muted-foreground mt-1">{pedidosFaturados.length} pedidos</p>
        </div>
        <div className="bg-card rounded-xl p-4 border border-border">
          <p className="text-xs text-muted-foreground flex items-center gap-1.5"><Clock size={14} className="text-amber-500" /> Pendente Faturamento</p>
          <p className="text-2xl font-bold mt-2 text-foreground" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{fmtFull(totalAFaturar)}</p>
          <p className="text-xs text-muted-foreground mt-1">{pedidosAFaturar.length} pedidos na fila</p>
        </div>
        <div className="bg-card rounded-xl p-4 border border-border">
          <p className="text-xs text-muted-foreground flex items-center gap-1.5"><CheckCircle size={14} className="text-blue-500" /> Ticket Médio</p>
          <p className="text-2xl font-bold mt-2 text-foreground" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{fmtFull(ticketMedio)}</p>
          <p className="text-xs text-muted-foreground mt-1">Por venda</p>
        </div>
        <div className="bg-card rounded-xl p-4 border border-border">
          <p className="text-xs text-muted-foreground flex items-center gap-1.5"><FileText size={14} className="text-purple-500" /> Notas Rejeitadas (SEFAZ)</p>
          <p className="text-2xl font-bold mt-2 text-foreground" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>0</p>
          <p className="text-xs text-emerald-600 mt-1">Tudo operando normalmente</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Fila de Faturamento */}
        <div className="lg:col-span-2 bg-card rounded-xl border border-border overflow-hidden flex flex-col h-[500px]">
          <TableToolbar 
            title="Fila de Pedidos a Faturar" 
            count={filtered.length} 
            search={search}
            onSearch={setSearch}
          >
            <button onClick={loadData} className="flex items-center gap-1.5 text-xs px-3 py-2 border border-border rounded-lg bg-background text-muted-foreground hover:bg-muted">
              <RefreshCw size={12} /> Atualizar
            </button>
            <button className="flex items-center gap-1.5 text-xs px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
              Faturar em Lote (mock)
            </button>
          </TableToolbar>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-0">
            {loading ? (
              <div className="p-8 text-center text-muted-foreground">Carregando pedidos...</div>
            ) : filtered.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">Nenhum pedido aguardando faturamento.</div>
            ) : (
              <table className="w-full">
                <thead className="sticky top-0 z-10 bg-muted/90 backdrop-blur">
                  <tr className="text-xs text-muted-foreground">
                    <th className="text-left px-5 py-3 font-medium">Pedido</th>
                    <th className="text-left px-4 py-3 font-medium">Cliente</th>
                    <th className="text-right px-4 py-3 font-medium">Valor</th>
                    <th className="text-left px-4 py-3 font-medium">Status Atual</th>
                    <th className="text-right px-4 py-3 font-medium"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.map(p => (
                    <tr key={p.id} className="hover:bg-muted/30">
                      <td className="px-5 py-3.5 text-xs font-mono font-medium text-foreground">
                        #{p.id.toString().padStart(6, '0')}
                      </td>
                      <td className="px-4 py-3.5 text-xs font-medium text-foreground max-w-[150px] truncate">
                        {p.cliente_nome || "—"}
                      </td>
                      <td className="px-4 py-3.5 text-xs font-semibold text-right">
                        {fmtFull(p.valor_total || 0)}
                      </td>
                      <td className="px-4 py-3.5 text-xs">
                        <Badge variant={p.status === "APROVADO" ? "success" : "warning"}>{p.status}</Badge>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <button 
                          onClick={() => handlePrepararFaturamento(p.id)}
                          className="text-xs px-3 py-1.5 bg-emerald-600 text-white rounded font-medium hover:bg-emerald-700 transition-colors flex items-center gap-1.5 ml-auto"
                        >
                          Faturar <ArrowRight size={12} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Gráfico Analítico */}
        <div className="bg-card rounded-xl border border-border p-5 flex flex-col h-[500px]">
          <h3 className="text-sm font-bold text-foreground mb-1">Evolução do Faturamento</h3>
          <p className="text-xs text-muted-foreground mb-6">Tendência de notas emitidas nos últimos 7 dias</p>
          
          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorFaturado" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickFormatter={(v) => `R$${v/1000}k`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }}
                  formatter={(val: number) => [fmtFull(val), "Faturado"]}
                />
                <Area type="monotone" dataKey="valor" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorFaturado)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Modal Faturamento Nativo */}
      <Modal title={successState ? "" : "Preparação de Faturamento"} open={faturamentoModal} onClose={() => { setFaturamentoModal(false); setSuccessState(false); }}>
        <div className="space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
          {successState ? (
            <div className="py-16 flex flex-col items-center justify-center text-center animate-in zoom-in fade-in duration-300">
                <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-5 shadow-sm">
                    <Check size={40} className="animate-in slide-in-from-bottom-2" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Nota Emitida!</h3>
                <p className="text-sm text-muted-foreground">A Nota Fiscal foi gerada com sucesso e o pedido foi marcado como Faturado.</p>
            </div>
          ) : loadingModal ? (
            <div className="p-16 flex flex-col items-center justify-center text-center">
                <RefreshCw size={24} className="text-emerald-500 animate-spin mb-4" />
                <p className="text-sm font-medium text-foreground">Processando inteligência fiscal...</p>
                <p className="text-xs text-muted-foreground mt-1">Analisando impostos e NCMs do pedido</p>
            </div>
          ) : notaRascunho ? (
            <>
              <div className="bg-muted/30 p-3 rounded-lg border border-border flex justify-between items-center">
                <div>
                  <p className="text-xs text-muted-foreground">Pedido Venda</p>
                  <p className="font-bold text-foreground">#{String(notaRascunho.pedido_id).padStart(6, '0')}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Destinatário</p>
                  <p className="font-bold text-foreground">{notaRascunho.cliente?.nome}</p>
                </div>
              </div>
              
              {notaRascunho.erros_validacao && notaRascunho.erros_validacao.length > 0 && (
                <div className="bg-red-50 p-4 rounded-lg border border-red-200 mt-4">
                    <div className="flex items-center gap-2 text-red-700 font-bold mb-2">
                        <AlertCircle size={16} /> Malha Fina: Emissão Bloqueada
                    </div>
                    <ul className="list-disc pl-5 text-sm text-red-600 space-y-1">
                        {notaRascunho.erros_validacao.map((erro: string, i: number) => (
                            <li key={i}>{erro}</li>
                        ))}
                    </ul>
                    <p className="text-xs text-red-500 mt-3 font-medium">Corrija os cadastros acima antes de faturar para evitar rejeição na SEFAZ e bloqueio do CNPJ.</p>
                </div>
              )}
              
              <h4 className="text-sm font-bold border-b border-border pb-2 mt-4">Itens e Tributação</h4>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-xs text-muted-foreground bg-muted/50">
                      <th className="text-left px-3 py-2 font-medium">Produto</th>
                      <th className="text-left px-3 py-2 font-medium">NCM</th>
                      <th className="text-left px-3 py-2 font-medium">CFOP</th>
                      <th className="text-right px-3 py-2 font-medium">Qtd</th>
                      <th className="text-right px-3 py-2 font-medium">Vl. Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {notaRascunho.itens?.map((it: any, idx: number) => (
                      <tr key={idx} className="text-xs">
                        <td className="px-3 py-2 text-foreground font-medium">{it.codigo} - {it.descricao}</td>
                        <td className="px-3 py-2 text-muted-foreground">
                          <input type="text" value={it.ncm} onChange={e => {
                            const newItens = [...notaRascunho.itens];
                            newItens[idx].ncm = e.target.value;
                            setNotaRascunho({...notaRascunho, itens: newItens});
                          }} className="w-20 bg-background border border-border px-2 py-1 rounded" />
                        </td>
                        <td className="px-3 py-2 text-muted-foreground">
                          <input type="text" value={it.cfop} onChange={e => {
                            const newItens = [...notaRascunho.itens];
                            newItens[idx].cfop = e.target.value;
                            setNotaRascunho({...notaRascunho, itens: newItens});
                          }} className="w-16 bg-background border border-border px-2 py-1 rounded" />
                        </td>
                        <td className="px-3 py-2 text-right">{it.quantidade}</td>
                        <td className="px-3 py-2 text-right font-bold text-emerald-600">{fmtFull(it.valor_total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <h4 className="text-sm font-bold border-b border-border pb-2 mt-4">Totais</h4>
              <div className="grid grid-cols-2 md:grid-cols-6 gap-4 bg-muted/20 p-4 rounded-xl border border-border">
                <div>
                  <p className="text-xs text-muted-foreground">Produtos</p>
                  <p className="font-semibold text-sm">{fmtFull(notaRascunho.valor_produtos)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Frete</p>
                  <p className="font-semibold text-sm">{fmtFull(notaRascunho.frete)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">ICMS (Legado)</p>
                  <p className="font-semibold text-sm text-red-500">{fmtFull(notaRascunho.valor_icms)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">IBS (Est.)</p>
                  <p className="font-semibold text-sm text-red-500">{fmtFull(notaRascunho.valor_ibs || 0)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">CBS (Est.)</p>
                  <p className="font-semibold text-sm text-red-500">{fmtFull(notaRascunho.valor_cbs || 0)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total NF</p>
                  <p className="font-bold text-lg text-emerald-600">{fmtFull(notaRascunho.valor_total)}</p>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 mt-4 border-t border-border">
                <button onClick={() => setFaturamentoModal(false)} className="px-4 py-2 text-sm border border-border rounded-lg text-muted-foreground hover:bg-muted">Cancelar</button>
                <button 
                  onClick={handleConfirmarEmissao} 
                  disabled={!notaRascunho.pode_faturar}
                  className="px-5 py-2 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Check size={16} /> Salvar e Emitir NF-e
                </button>
              </div>
            </>
          ) : null}
        </div>
      </Modal>
    </div>
  );
}
