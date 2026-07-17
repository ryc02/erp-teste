import React, { useState, useEffect } from "react";
import { api } from "../services/api";
import { TableToolbar, Badge, fmt, fmtFull, Modal, Input } from "../components/ui/SharedUI";
import { Receipt, Search, FileText, CheckCircle, Clock, XCircle, RefreshCw } from "lucide-react";

export function Fiscal() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  async function loadData() {
    setLoading(true);
    try {
      const res = await api.get("/fiscal/notas");
      setData(res as any[]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const filtered = data.filter((n: any) => 
    n.numero?.includes(search) || 
    n.cliente_nome?.toLowerCase().includes(search.toLowerCase()) ||
    n.chave_acesso?.includes(search)
  );

  return (
    <div className="space-y-4 fade-in">
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Notas Emitidas", value: data.length.toString(), color: "" },
          { label: "Aprovadas (SEFAZ)", value: data.filter(n => n.situacao === "100").length.toString(), color: "text-emerald-600" },
          { label: "Pendentes", value: data.filter(n => n.situacao === "0").length.toString(), color: "text-amber-500" },
          { label: "Canceladas", value: data.filter(n => n.situacao === "135").length.toString(), color: "text-red-500" },
        ].map(s => (
          <div key={s.label} className="bg-card rounded-xl p-4 border border-border">
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className={`text-2xl font-bold mt-1 ${s.color}`} style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <TableToolbar 
          title="Gestão Fiscal e NFe" 
          count={filtered.length} 
          search={search}
          onSearch={setSearch}
        >
          <button onClick={loadData} className="flex items-center gap-1.5 text-xs px-3 py-2 border border-border rounded-lg bg-background text-muted-foreground hover:bg-muted">
            <RefreshCw size={12} /> Atualizar
          </button>
        </TableToolbar>
        
        <div className="overflow-x-auto min-h-[300px]">
          {loading ? (
             <div className="p-8 text-center text-muted-foreground">Carregando notas fiscais...</div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="text-xs text-muted-foreground bg-muted/40 border-b border-border">
                  <th className="text-left px-5 py-3 font-medium">Série/Número</th>
                  <th className="text-left px-4 py-3 font-medium">Cliente</th>
                  <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Emissão</th>
                  <th className="text-right px-4 py-3 font-medium">Valor Total</th>
                  <th className="text-left px-4 py-3 font-medium">Situação SEFAZ</th>
                  <th className="text-right px-4 py-3 font-medium"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map(n => (
                  <tr key={n.id} className="hover:bg-muted/30">
                    <td className="px-5 py-3.5 text-xs font-mono font-medium text-foreground">
                      {n.serie || "1"}-{n.numero ? String(n.numero).padStart(6, '0') : "000000"}
                    </td>
                    <td className="px-4 py-3.5 text-xs font-medium text-foreground">
                      <div className="max-w-[200px] truncate">{n.cliente_nome || "Cliente Não Informado"}</div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">{n.cliente_cpf_cnpj}</div>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-muted-foreground hidden md:table-cell">
                      {new Date(n.data_emissao).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3.5 text-xs font-semibold text-right">
                      {fmtFull(n.valor_total || 0)}
                    </td>
                    <td className="px-4 py-3.5 text-xs">
                      {n.situacao === "100" ? (
                        <span className="inline-flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md font-medium"><CheckCircle size={10}/> Autorizada</span>
                      ) : n.situacao === "135" ? (
                        <span className="inline-flex items-center gap-1 text-red-600 bg-red-50 px-2 py-1 rounded-md font-medium"><XCircle size={10}/> Cancelada</span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-amber-600 bg-amber-50 px-2 py-1 rounded-md font-medium"><Clock size={10}/> Pendente</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-right space-x-2">
                      <button className="text-xs px-2 py-1 border border-border rounded text-muted-foreground hover:bg-muted">DANFE</button>
                      <button className="text-xs px-2 py-1 border border-border rounded text-muted-foreground hover:bg-muted">XML</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
