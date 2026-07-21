import React, { useState, useEffect } from "react";
import { TableToolbar, Badge, Modal, Input, Select, fmt, fmtFull } from "../components/ui/SharedUI";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { api } from "../services/api";
import { toast } from "sonner";
import { Loader2, DollarSign, TrendingUp, TrendingDown, Percent } from "lucide-react";

export function Relatorios() {
  const [activeTab, setActiveTab] = useState<"dre" | "curva" | "vperiodo">("dre");
  
  // DRE State
  const [dreData, setDreData] = useState<any>(null);
  const [loadingDre, setLoadingDre] = useState(false);
  
  // Curva ABC State
  const [curvaData, setCurvaData] = useState<any[]>([]);
  const [loadingCurva, setLoadingCurva] = useState(false);

  // Vendas por Período State
  const [vendasPeriodo, setVendasPeriodo] = useState<any[]>([]);
  const [loadingVendas, setLoadingVendas] = useState(false);

  useEffect(() => {
    if (activeTab === "dre") fetchDre();
    if (activeTab === "curva") fetchCurvaAbc();
    if (activeTab === "vperiodo") fetchVendasPeriodo();
  }, [activeTab]);

  const fetchDre = async () => {
    try {
      setLoadingDre(true);
      const data = await api.get<any>("/financeiro/dre");
      setDreData(data);
    } catch (error) {
      toast.error("Erro ao carregar DRE");
    } finally {
      setLoadingDre(false);
    }
  };

  const fetchCurvaAbc = async () => {
    try {
      setLoadingCurva(true);
      const data = await api.get<any[]>("/vendas/resultados/curva-abc");
      setCurvaData(data);
    } catch (error) {
      toast.error("Erro ao carregar Curva ABC");
    } finally {
      setLoadingCurva(false);
    }
  };

  const fetchVendasPeriodo = async () => {
    try {
      setLoadingVendas(true);
      const data = await api.get<any[]>("/vendas/pedidos");
      // Group by data_pedido date
      const map: Record<string, { data: string; total: number; qtd: number }> = {};
      data.forEach((p) => {
        if (!p.data_pedido) return;
        const d = new Date(p.data_pedido).toLocaleDateString("pt-BR");
        if (!map[d]) map[d] = { data: d, total: 0, qtd: 0 };
        map[d].total += p.valor_total || 0;
        map[d].qtd += 1;
      });
      setVendasPeriodo(Object.values(map));
    } catch (error) {
      toast.error("Erro ao carregar Vendas por Período");
    } finally {
      setLoadingVendas(false);
    }
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-foreground" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Relatórios Gerenciais</h1>
          <p className="text-sm text-muted-foreground mt-1">Acompanhe os resultados da sua empresa</p>
        </div>
        <div className="flex bg-muted p-1 rounded-lg">
          <button 
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${activeTab === 'dre' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            onClick={() => setActiveTab("dre")}
          >
            DRE Gerencial
          </button>
          <button 
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${activeTab === 'curva' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            onClick={() => setActiveTab("curva")}
          >
            Curva ABC
          </button>
          <button 
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${activeTab === 'vperiodo' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            onClick={() => setActiveTab("vperiodo")}
          >
            Vendas por Período
          </button>
        </div>
      </div>

      {activeTab === "dre" && (
        <div className="space-y-6">
          {loadingDre ? (
            <div className="flex justify-center py-12"><Loader2 className="animate-spin text-primary" /></div>
          ) : dreData ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-card border border-border rounded-xl p-5">
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-sm font-medium text-muted-foreground">Receita Bruta</p>
                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600"><TrendingUp size={16} /></div>
                  </div>
                  <h3 className="text-2xl font-bold">{fmt(dreData.receita_bruta)}</h3>
                </div>
                <div className="bg-card border border-border rounded-xl p-5">
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-sm font-medium text-muted-foreground">Deduções</p>
                    <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-600"><TrendingDown size={16} /></div>
                  </div>
                  <h3 className="text-2xl font-bold">{fmt(dreData.deducoes)}</h3>
                </div>
                <div className="bg-card border border-border rounded-xl p-5">
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-sm font-medium text-muted-foreground">Custos</p>
                    <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-600"><TrendingDown size={16} /></div>
                  </div>
                  <h3 className="text-2xl font-bold">{fmt(dreData.custos)}</h3>
                </div>
                <div className="bg-card border border-border rounded-xl p-5 border-l-4 border-l-primary">
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-sm font-medium text-muted-foreground">Resultado Líquido</p>
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary"><DollarSign size={16} /></div>
                  </div>
                  <h3 className="text-2xl font-bold">{fmt(dreData.resultado_liquido)}</h3>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-card border border-border rounded-xl p-5">
                  <h3 className="text-base font-semibold mb-4">Composição do DRE</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={[dreData]}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                        <XAxis dataKey="name" hide />
                        <YAxis tickFormatter={(v) => `R$ ${v/1000}k`} tick={{fontSize: 12}} />
                        <Tooltip formatter={(v: number) => fmt(v)} />
                        <Bar dataKey="receita_bruta" name="Rec. Bruta" fill="#10b981" radius={[4,4,0,0]} />
                        <Bar dataKey="despesas_operacionais" name="Desp. Operacionais" fill="#ef4444" radius={[4,4,0,0]} />
                        <Bar dataKey="resultado_liquido" name="Res. Líquido" fill="#3b82f6" radius={[4,4,0,0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col">
                  <TableToolbar title="Demonstrativo Detalhado" />
                  <div className="overflow-x-auto p-5">
                    <table className="w-full text-left border-collapse">
                      <tbody>
                        <tr className="border-b border-border">
                          <td className="py-3 text-sm font-semibold">1. Receita Bruta de Vendas</td>
                          <td className="py-3 text-sm font-semibold text-right text-emerald-600">{fmtFull(dreData.receita_bruta)}</td>
                        </tr>
                        <tr className="border-b border-border text-muted-foreground">
                          <td className="py-3 text-sm pl-4">(-) Deduções e Impostos</td>
                          <td className="py-3 text-sm text-right text-red-500">-{fmtFull(dreData.deducoes)}</td>
                        </tr>
                        <tr className="border-b border-border bg-muted/30">
                          <td className="py-3 text-sm font-semibold">2. Receita Líquida</td>
                          <td className="py-3 text-sm font-semibold text-right">{fmtFull(dreData.receita_liquida)}</td>
                        </tr>
                        <tr className="border-b border-border text-muted-foreground">
                          <td className="py-3 text-sm pl-4">(-) Custos (CPV/CMV)</td>
                          <td className="py-3 text-sm text-right text-red-500">-{fmtFull(dreData.custos)}</td>
                        </tr>
                        <tr className="border-b border-border bg-muted/30">
                          <td className="py-3 text-sm font-semibold">3. Lucro Bruto</td>
                          <td className="py-3 text-sm font-semibold text-right">{fmtFull(dreData.lucro_bruto)}</td>
                        </tr>
                        <tr className="border-b border-border text-muted-foreground">
                          <td className="py-3 text-sm pl-4">(-) Despesas Operacionais</td>
                          <td className="py-3 text-sm text-right text-red-500">-{fmtFull(dreData.despesas_operacionais)}</td>
                        </tr>
                        <tr className="bg-primary/5 border-t-2 border-primary">
                          <td className="py-3 text-sm font-bold text-primary">4. Resultado Líquido</td>
                          <td className="py-3 text-sm font-bold text-right text-primary">{fmtFull(dreData.resultado_liquido)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-muted-foreground">Nenhum dado financeiro encontrado.</div>
          )}
        </div>
      )}

      {activeTab === "curva" && (
        <div className="space-y-6">
          {loadingCurva ? (
            <div className="flex justify-center py-12"><Loader2 className="animate-spin text-primary" /></div>
          ) : curvaData.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="col-span-2 bg-card border border-border rounded-xl p-5">
                  <h3 className="text-base font-semibold mb-4">Curva ABC de Vendas</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={curvaData.slice(0, 15)} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                        <XAxis dataKey="nome" tick={{fontSize: 10}} tickFormatter={(val) => val.substring(0, 10) + '...'} />
                        <YAxis yAxisId="left" tickFormatter={(v) => `R$ ${v/1000}k`} tick={{fontSize: 12}} />
                        <YAxis yAxisId="right" orientation="right" tickFormatter={(v) => `${v}%`} tick={{fontSize: 12}} domain={[0, 100]} />
                        <Tooltip formatter={(v: number, name: string) => name === 'Acumulado' ? `${v.toFixed(2)}%` : fmt(v)} />
                        <Bar yAxisId="left" dataKey="valor_total" name="Faturamento" fill="#3b82f6" radius={[4,4,0,0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                
                <div className="bg-card border border-border rounded-xl p-5">
                  <h3 className="text-base font-semibold mb-4">Distribuição por Classe</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Classe A', value: curvaData.filter(d => d.classe === 'A').length },
                            { name: 'Classe B', value: curvaData.filter(d => d.classe === 'B').length },
                            { name: 'Classe C', value: curvaData.filter(d => d.classe === 'C').length }
                          ]}
                          cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value"
                        >
                          <Cell fill="#10b981" />
                          <Cell fill="#f59e0b" />
                          <Cell fill="#ef4444" />
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex justify-center gap-4 mt-2">
                    <div className="flex items-center gap-1.5 text-xs"><div className="w-3 h-3 rounded-full bg-[#10b981]"></div>Classe A (80%)</div>
                    <div className="flex items-center gap-1.5 text-xs"><div className="w-3 h-3 rounded-full bg-[#f59e0b]"></div>Classe B (15%)</div>
                    <div className="flex items-center gap-1.5 text-xs"><div className="w-3 h-3 rounded-full bg-[#ef4444]"></div>Classe C (5%)</div>
                  </div>
                </div>
              </div>

              <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col">
                <TableToolbar title="Detalhamento Curva ABC" count={curvaData.length} />
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-muted/50 border-b border-border">
                        <th className="py-3 px-5 text-xs font-semibold text-muted-foreground">Produto</th>
                        <th className="py-3 px-5 text-xs font-semibold text-muted-foreground">SKU</th>
                        <th className="py-3 px-5 text-xs font-semibold text-muted-foreground text-right">Qtd Vendida</th>
                        <th className="py-3 px-5 text-xs font-semibold text-muted-foreground text-right">Faturamento</th>
                        <th className="py-3 px-5 text-xs font-semibold text-muted-foreground text-right">% Acumulado</th>
                        <th className="py-3 px-5 text-xs font-semibold text-muted-foreground text-center">Classe</th>
                      </tr>
                    </thead>
                    <tbody>
                      {curvaData.map((item, i) => (
                        <tr key={i} className="border-b border-border hover:bg-muted/20 transition-colors">
                          <td className="py-3 px-5 text-sm font-medium">{item.nome}</td>
                          <td className="py-3 px-5 text-sm text-muted-foreground">{item.sku}</td>
                          <td className="py-3 px-5 text-sm text-right">{item.qtd_vendida}</td>
                          <td className="py-3 px-5 text-sm text-right font-medium">{fmtFull(item.valor_total)}</td>
                          <td className="py-3 px-5 text-sm text-right text-muted-foreground">{item.percentual_acumulado.toFixed(2)}%</td>
                          <td className="py-3 px-5 text-sm text-center">
                            <Badge variant={item.classe === 'A' ? 'success' : item.classe === 'B' ? 'warning' : 'danger'}>
                              Classe {item.classe}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-muted-foreground">Nenhuma venda faturada encontrada para gerar a curva ABC.</div>
          )}
        </div>
      )}
      {activeTab === "vperiodo" && (
        <div className="space-y-6">
          {loadingVendas ? (
            <div className="flex justify-center py-12"><Loader2 className="animate-spin text-primary" /></div>
          ) : vendasPeriodo.length > 0 ? (
            <>
              <div className="bg-card border border-border rounded-xl p-5">
                <h3 className="text-base font-semibold mb-4">Faturamento por Dia</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={vendasPeriodo}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                      <XAxis dataKey="data" tick={{fontSize: 11}} />
                      <YAxis tickFormatter={(v) => `R$ ${v/1000}k`} tick={{fontSize: 12}} />
                      <Tooltip formatter={(v: number) => fmt(v)} />
                      <Bar dataKey="total" name="Faturamento" fill="#10b981" radius={[4,4,0,0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                <TableToolbar title="Detalhamento das Vendas por Data" count={vendasPeriodo.length} />
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-muted/50 border-b border-border text-xs text-muted-foreground">
                        <th className="py-3 px-5 font-semibold">Data</th>
                        <th className="py-3 px-5 font-semibold text-center">Quantidade de Pedidos</th>
                        <th className="py-3 px-5 font-semibold text-right">Total Faturado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border text-sm">
                      {vendasPeriodo.map((v, i) => (
                        <tr key={i} className="hover:bg-muted/20">
                          <td className="py-3 px-5 font-medium">{v.data}</td>
                          <td className="py-3 px-5 text-center">{v.qtd} pedidos</td>
                          <td className="py-3 px-5 text-right font-semibold text-emerald-600">{fmtFull(v.total)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-muted-foreground">Nenhuma venda encontrada para o período.</div>
          )}
        </div>
      )}
    </div>
  );
}

export default Relatorios;
