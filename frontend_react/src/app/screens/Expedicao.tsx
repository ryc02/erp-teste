import React, { useState } from "react";
import { TableToolbar, Pagination, Badge, Modal, Input, Select, FormSection, fmt } from "../components/ui/SharedUI";
import { Eye, Edit3, Trash2, ShieldAlert } from "lucide-react";
import * as mockData from "../data/mockData";
import { useLocalData } from "../hooks/useLocalData";

export function ExpedicaoForm({ onClose, onSave }: { onClose: () => void; onSave: (item: any) => void }) {
  return (
    <div className="space-y-4">
      <form onSubmit={(e) => { e.preventDefault(); const formData = new FormData(e.currentTarget); const novo = { id: "NEW-" + Math.floor(Math.random() * 10000) }; formData.forEach((val, key) => novo[key] = val); onSave(novo); onClose(); }}><FormSection title="Dados Principais"><div className="grid grid-cols-2 gap-4"><Input label="Número do Pedido" name="pedido" placeholder="Digite aqui..." /><Select label="Transportadora" name="transportadora"><option value="">Selecione...</option><option>Correios</option><option>Jadlog</option><option>Azul Cargo</option></Select></div></FormSection><div className="flex justify-end gap-2 mt-6 pt-4 border-t border-border"><button type="button" className="px-4 py-2 text-sm text-muted-foreground hover:bg-muted rounded-lg" onClick={onClose}>Cancelar</button><button type="submit" className="px-4 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary/90">Salvar Dados</button></div></form>
    </div>
  );
}

export function Expedicao() {
  const [modal, setModal] = useState(false);
  const { data, search, setSearch, page, setPage, totalPages, paginatedData, add, remove } = useLocalData(mockData.expedicaoData);

  return (
    <div className="space-y-4">
      <Modal open={modal} onClose={() => setModal(false)} title="Novo Registro - Expedição e Logística" wide>
        <ExpedicaoForm onClose={() => setModal(false)} onSave={add} />
      </Modal>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <TableToolbar 
          title="Expedição e Logística" 
          subtitle="Roteirização e Separação" 
          count={data.length} 
          onNew={() => setModal(true)} 
          newLabel="Adicionar"
          search={search}
          onSearch={setSearch}
        />
        
        <div className="overflow-x-auto min-h-[300px]">
          <table className="w-full">
            <thead>
              <tr className="text-xs text-muted-foreground bg-muted/40 border-b border-border">
                <th className="text-left px-5 py-3 font-medium">Cód.</th><th className="text-left px-4 py-3 font-medium">Pedido Vinculado</th><th className="text-left px-4 py-3 font-medium">Cliente Destino</th><th className="text-left px-4 py-3 font-medium">Transportadora</th><th className="text-left px-4 py-3 font-medium">Status</th><th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {paginatedData.length === 0 ? 
                <tr><td colSpan={10} className="text-center py-10 text-muted-foreground">Nenhum registro encontrado.</td></tr> : 
                paginatedData.map((item: any) => (
                <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-5 py-3.5 text-xs font-mono text-muted-foreground">{item.id}</td><td className="px-4 py-3.5 text-xs text-foreground">{item.pedido}</td><td className="px-4 py-3.5 text-xs text-foreground">{item.cliente}</td><td className="px-4 py-3.5 text-xs text-foreground">{item.transportadora}</td><td className="px-4 py-3.5">
              <Badge variant={item.status === "Ativo" || item.status === "Aprovado" || item.status === "Entregue" || item.status === "Concluído" ? "success" : item.status === "Inativo" || item.status === "Em Atraso" ? "danger" : "warning"}>
                {item.status || "Pendente"}
              </Badge>
            </td><td className="px-4 py-3.5 flex items-center justify-end gap-1">
              <button className="p-1 rounded hover:bg-muted text-muted-foreground"><Edit3 size={14} /></button>
              <button onClick={() => onRemove(item.id)} className="p-1 rounded hover:bg-muted text-red-500"><Trash2 size={14} /></button>
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
