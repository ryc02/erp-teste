import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { TableToolbar, Pagination, Badge, Modal, Input, Select, FormSection, fmt } from "../components/ui/SharedUI";
import { Eye, Edit3, Trash2, Printer, Package, Truck, CheckCircle, MapPin, Navigation, FileText, User } from "lucide-react";
import { api, API_BASE } from "../services/api";
import { useLocalData } from "../hooks/useLocalData";

export function Expedicao() {
  const [tab, setTab] = useState<"pendentes" | "rotas">("pendentes");
  const [data, setData] = useState<any[]>([]);
  const [rotas, setRotas] = useState<any[]>([]);
  const { search, setSearch, page, setPage, totalPages, paginatedData } = useLocalData(data, 10);
  const [loading, setLoading] = useState(true);

  // Modal de Romaneio
  const [modalRomaneio, setModalRomaneio] = useState<any>(null);
  const [formRomaneio, setFormRomaneio] = useState({ motorista: "", placa: "", transportadora: "" });

  const fetchPedidos = async () => {
    setLoading(true);
    try {
      const [resPendentes, resRotas] = await Promise.all([
        api.get<any[]>("/expedicao/pendentes"),
        api.get<any[]>("/expedicao/rotas-regioes")
      ]);
      setData(resPendentes);
      setRotas(resRotas);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPedidos();
  }, []);

  const handleAcao = async (url: string, ids: number[]) => {
    try {
      await api.post(`/expedicao/acao-massa/${url}`, { pedido_ids: ids });
      toast.success("Ação executada com sucesso!");
      fetchPedidos();
    } catch (e: any) {
      toast.error(e.message || "Erro na ação");
    }
  };

  const handleImprimir = async (url: string, id: number) => {
    try {
      const token = localStorage.getItem("venner_jwt");
      const emp = localStorage.getItem("empresa_ativa");
      const headers: any = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;
      if (emp) headers["X-Empresa-Id"] = emp;
      
      const res = await fetch(`${API_BASE}/expedicao/${url}`, {
        method: "POST",
        headers,
        body: JSON.stringify({ pedido_ids: [id] })
      });
      if (!res.ok) throw new Error("Erro ao gerar impressão");
      const html = await res.text();
      const win = window.open("", "_blank");
      if (win) { win.document.write(html); win.document.close(); }
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const handleImprimirRomaneio = async () => {
    if (!modalRomaneio) return;
    try {
      const token = localStorage.getItem("venner_jwt");
      const emp = localStorage.getItem("empresa_ativa");
      const headers: any = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;
      if (emp) headers["X-Empresa-Id"] = emp;

      const payload = {
        pedido_ids: modalRomaneio.pedidos.map((p: any) => p.id),
        motorista: formRomaneio.motorista || "Motorista Próprio",
        placa: formRomaneio.placa,
        transportadora: formRomaneio.transportadora
      };

      const res = await fetch(`${API_BASE}/expedicao/romaneio-pdf`, {
        method: "POST",
        headers,
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error("Erro ao gerar Romaneio de Carga");
      const html = await res.text();
      const win = window.open("", "_blank");
      if (win) { win.document.write(html); win.document.close(); }
      setModalRomaneio(null);
    } catch (e: any) {
      toast.error(e.message || "Erro ao gerar romaneio");
    }
  };

  return (
    <div className="space-y-4">
      {/* Modal Romaneio */}
      <Modal
        open={!!modalRomaneio}
        onClose={() => setModalRomaneio(null)}
        title={`Romaneio de Entrega - Região: ${modalRomaneio?.regiao}`}
        subtitle={`${modalRomaneio?.total_pedidos} pedido(s) selecionados para esta rota`}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Input
              label="Nome do Motorista"
              value={formRomaneio.motorista}
              onChange={e => setFormRomaneio({ ...formRomaneio, motorista: e.target.value })}
              placeholder="Ex: Carlos Silva"
            />
            <Input
              label="Placa do Veículo"
              value={formRomaneio.placa}
              onChange={e => setFormRomaneio({ ...formRomaneio, placa: e.target.value })}
              placeholder="Ex: ABC-1234"
            />
            <Input
              label="Transportadora / Frota"
              value={formRomaneio.transportadora}
              onChange={e => setFormRomaneio({ ...formRomaneio, transportadora: e.target.value })}
              placeholder="Ex: Frota Própria"
            />
          </div>

          <div className="border border-border rounded-lg overflow-hidden max-h-[250px] overflow-y-auto">
            <table className="w-full text-xs">
              <thead className="bg-muted/40 font-semibold text-muted-foreground sticky top-0">
                <tr>
                  <th className="px-3 py-2 text-left">Pedido</th>
                  <th className="px-3 py-2 text-left">Cliente</th>
                  <th className="px-3 py-2 text-left">Endereço</th>
                  <th className="px-3 py-2 text-right">Valor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {modalRomaneio?.pedidos.map((p: any) => (
                  <tr key={p.id}>
                    <td className="px-3 py-2 font-mono font-bold">#{p.id}</td>
                    <td className="px-3 py-2 font-medium">{p.cliente_nome}</td>
                    <td className="px-3 py-2 text-muted-foreground truncate max-w-[200px]">{p.endereco}</td>
                    <td className="px-3 py-2 text-right font-semibold">R$ {p.valor_total.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => setModalRomaneio(null)} className="px-4 py-2 text-sm text-muted-foreground hover:bg-muted rounded-lg border border-border">
              Cancelar
            </button>
            <button onClick={handleImprimirRomaneio} className="px-4 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary/90 flex items-center gap-1.5 font-medium">
              <Printer size={14} /> Imprimir Romaneio (PDF)
            </button>
          </div>
        </div>
      </Modal>

      {/* Selector Tabs */}
      <div className="flex gap-2 border-b border-border pb-2">
        <button
          onClick={() => setTab("pendentes")}
          className={`px-4 py-2 text-sm font-medium rounded-lg flex items-center gap-2 transition-colors ${tab === "pendentes" ? "bg-primary text-white" : "bg-card hover:bg-muted text-muted-foreground"}`}
        >
          <Package size={16} /> Pedidos Pendentes ({data.length})
        </button>
        <button
          onClick={() => setTab("rotas")}
          className={`px-4 py-2 text-sm font-medium rounded-lg flex items-center gap-2 transition-colors ${tab === "rotas" ? "bg-primary text-white" : "bg-card hover:bg-muted text-muted-foreground"}`}
        >
          <Navigation size={16} /> Rotas por Região ({rotas.length})
        </button>
      </div>

      {tab === "pendentes" ? (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <TableToolbar 
            title="Expedição e Logística" 
            subtitle="Acompanhamento e envio de pedidos faturados" 
            count={data.length} 
            search={search}
            onSearch={setSearch}
          />
          
          <div className="overflow-x-auto min-h-[300px]">
            <table className="w-full">
              <thead>
                <tr className="text-xs text-muted-foreground bg-muted/40 border-b border-border">
                  <th className="text-left px-5 py-3 font-medium">Pedido</th>
                  <th className="text-left px-4 py-3 font-medium">Cliente</th>
                  <th className="text-left px-4 py-3 font-medium">Data</th>
                  <th className="text-left px-4 py-3 font-medium">Itens</th>
                  <th className="text-left px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading ? <tr><td colSpan={6} className="text-center py-10">Carregando...</td></tr> : 
                 paginatedData.length === 0 ? 
                  <tr><td colSpan={6} className="text-center py-10 text-muted-foreground">Nenhum pedido pendente de expedição.</td></tr> : 
                  paginatedData.map((item: any) => (
                  <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-3.5 text-xs font-mono text-muted-foreground">#{item.id}</td>
                    <td className="px-4 py-3.5 text-xs text-foreground font-semibold">{item.cliente_nome}</td>
                    <td className="px-4 py-3.5 text-xs text-foreground">{item.data_pedido?.split('T')[0].split('-').reverse().join('/')}</td>
                    <td className="px-4 py-3.5 text-xs text-foreground">{item.qtd_itens}</td>
                    <td className="px-4 py-3.5">
                      <Badge variant={item.status === "FATURADO" ? "success" : item.status === "ENVIADO" ? "success" : "warning"}>
                        {item.status.replace("_", " ")}
                      </Badge>
                    </td>
                    <td className="px-4 py-3.5 flex items-center justify-end gap-2">
                      <button onClick={() => handleAcao('separar', [item.id])} title="Separar" className="p-1.5 rounded bg-amber-500/10 text-amber-600 hover:bg-amber-500/20"><Package size={14} /></button>
                      <button onClick={() => handleAcao('embalar', [item.id])} title="Pronto p/ Envio" className="p-1.5 rounded bg-blue-500/10 text-blue-600 hover:bg-blue-500/20"><CheckCircle size={14} /></button>
                      <button onClick={() => handleAcao('enviar', [item.id])} title="Enviar" className="p-1.5 rounded bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20"><Truck size={14} /></button>
                      <div className="w-px h-4 bg-border mx-1"></div>
                      <button onClick={() => handleImprimir('gerar-etiquetas', item.id)} title="Etiqueta" className="p-1.5 rounded hover:bg-muted text-muted-foreground"><Printer size={14} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination total={data.length} shown={paginatedData.length} page={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rotas.length === 0 ? (
            <div className="col-span-full p-10 text-center text-muted-foreground bg-card rounded-xl border border-border">
              Nenhuma rota ativa no momento. Todos os pedidos expedidos!
            </div>
          ) : (
            rotas.map((rota: any) => (
              <div key={rota.regiao} className="bg-card rounded-xl border border-border p-5 space-y-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1">
                      <MapPin size={12} /> {rota.uf}
                    </span>
                    <h3 className="text-base font-bold text-foreground">{rota.cidade}</h3>
                  </div>
                  <Badge variant="neutral">{rota.total_pedidos} pedido(s)</Badge>
                </div>

                {rota.bairros && rota.bairros.length > 0 && (
                  <p className="text-xs text-muted-foreground truncate" title={rota.bairros.join(', ')}>
                    <strong>Bairros:</strong> {rota.bairros.join(', ')}
                  </p>
                )}

                <div className="grid grid-cols-2 gap-2 text-xs bg-muted/30 p-3 rounded-lg border border-border">
                  <div>
                    <span className="text-muted-foreground block">Total Volumes</span>
                    <span className="font-semibold">{rota.qtd_itens} itens</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Valor da Carga</span>
                    <span className="font-semibold text-emerald-500">R$ {rota.valor_total.toFixed(2)}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-border flex gap-2">
                  <button
                    onClick={() => { setModalRomaneio(rota); setFormRomaneio({ motorista: "", placa: "", transportadora: "" }); }}
                    className="w-full py-2 bg-primary text-white text-xs font-medium rounded-lg hover:bg-primary/90 flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <FileText size={14} /> Gerar Romaneio & Rota
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default Expedicao;
