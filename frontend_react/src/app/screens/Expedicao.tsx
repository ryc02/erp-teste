import React, { useState, useEffect } from "react";
import { TableToolbar, Pagination, Badge, Modal, Input, Select, FormSection, fmt } from "../components/ui/SharedUI";
import { Eye, Edit3, Trash2, Printer, Package, Truck, CheckCircle } from "lucide-react";
import { api, API_BASE } from "../services/api";
import { useLocalData } from "../hooks/useLocalData";

export function Expedicao() {
  const [data, setData] = useState<any[]>([]);
  const { search, setSearch, page, setPage, totalPages, paginatedData } = useLocalData(data, 10);
  const [loading, setLoading] = useState(true);

  const fetchPedidos = async () => {
    setLoading(true);
    try {
      const res = await api.get<any[]>("/expedicao/pendentes");
      setData(res);
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
      fetchPedidos();
    } catch (e: any) {
      alert(e.message || "Erro na ação");
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
      alert(e.message);
    }
  };

  return (
    <div className="space-y-4">
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
    </div>
  );
}

export default Expedicao;
