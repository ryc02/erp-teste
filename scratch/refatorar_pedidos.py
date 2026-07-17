import os

pedidos_path = r"d:\ERP Venner\frontend_react\src\app\screens\Pedidos.tsx"

with open(pedidos_path, "r", encoding="utf-8") as f:
    pedidos_code = f.read()

# Primeiro: Injetar `api`, `useEffect`
if 'from "../services/api"' not in pedidos_code:
    pedidos_code = pedidos_code.replace(
        'import React, { useState } from "react";',
        'import React, { useState, useEffect } from "react";\nimport { api } from "../services/api";'
    )

# Novo Pedidos:
pedidos_start = pedidos_code.find("export function Pedidos() {")

novo_pedidos_code = """export function Pedidos() {
  const [view, setView] = useState<"list" | "new">("list");
  const [filter, setFilter] = useState("todos");
  const { can, user } = useAuth();
  
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadData() {
    try {
      setLoading(true);
      const res = await api.get<any[]>("/vendas/pedidos");
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (view === "list") loadData();
  }, [view]);
  
  const filters = ["todos", "RASCUNHO", "APROVADO", "FATURADO", "CONCLUIDO", "CANCELADO"];
  
  const filteredData = data.filter((o) => {
    if (filter === "todos") return true;
    return o.status === filter;
  });

  if (view === "new") {
    return (
      <div className="fixed inset-0 z-50 bg-background flex flex-col p-4 sm:p-6 lg:p-8">
        <div className="max-w-[1200px] w-full mx-auto h-full">
          <NovoPedidoForm onCancel={() => setView("list")} onSave={() => setView("list")} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm mt-4">
        <TableToolbar 
          title="Gestão de Pedidos" 
          count={data.length} 
          onNew={can('pedidos', 'create') ? () => setView("new") : undefined} 
          newLabel="Incluir Pedido" 
        />
        
        <div className="px-5 pt-3 pb-0 flex gap-1.5 border-b border-border overflow-x-auto custom-scrollbar">
          {filters.map((f) => (
             <button key={f} onClick={() => setFilter(f)} className={`text-xs px-4 py-2.5 rounded-t-lg font-semibold capitalize whitespace-nowrap transition-colors ${filter === f ? "border-b-2 border-primary text-primary bg-primary/5" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"}`}>
               {f === "todos" ? "Todos" : f}
             </button>
          ))}
        </div>
        
        <div className="overflow-x-auto min-h-[400px]">
          {loading ? (
             <div className="p-8 text-center text-muted-foreground">Carregando pedidos...</div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="text-xs text-muted-foreground bg-muted/30 border-b border-border">
                  <th className="text-left px-5 py-3 font-semibold">Pedido</th>
                  <th className="text-left px-4 py-3 font-semibold">Cliente</th>
                  <th className="text-left px-4 py-3 font-semibold hidden md:table-cell">Data</th>
                  <th className="text-right px-4 py-3 font-semibold">Valor</th>
                  <th className="text-left px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredData.map((o) => {
                  return (
                    <tr key={o.id} className="hover:bg-muted/30 transition-colors group">
                      <td className="px-5 py-3.5 text-xs font-mono text-muted-foreground">{o.id}</td>
                      <td className="px-4 py-3.5 text-xs font-medium">{o.cliente_nome}</td>
                      <td className="px-4 py-3.5 text-xs text-muted-foreground hidden md:table-cell">{new Date(o.data_pedido).toLocaleDateString()}</td>
                      <td className="px-4 py-3.5 text-xs font-semibold text-right">{fmtFull(o.valor_total)}</td>
                      <td className="px-4 py-3.5"><Badge variant={o.status === 'APROVADO' ? 'success' : o.status === 'CANCELADO' ? 'danger' : 'neutral'}>{o.status}</Badge></td>
                      <td className="px-4 py-3.5 flex items-center justify-end gap-1 opacity-50 group-hover:opacity-100 transition-opacity">
                        <button className="p-1.5 rounded-md hover:bg-muted text-muted-foreground"><MoreHorizontal size={14} /></button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
"""

pedidos_code = pedidos_code[:pedidos_start] + novo_pedidos_code

# Agora reescrever o formulário NovoPedidoForm:
form_start = pedidos_code.find("export function NovoPedidoForm")
form_end = pedidos_code.find("export function Pedidos")

novo_form = """export function NovoPedidoForm({ onCancel, onSave }: { onCancel: () => void; onSave: () => void }) {
  const [itens, setItens] = useState<{produto_id: number; nome: string; qty: number; preco: number}[]>([]);
  const [clientes, setClientes] = useState<any[]>([]);
  const [produtos, setProdutos] = useState<any[]>([]);
  const [clienteId, setClienteId] = useState("");
  
  useEffect(() => {
    api.get<any[]>("/comercial/clientes").then(setClientes).catch(console.error);
    api.get<any[]>("/vendas/catalogo-produtos").then(setProdutos).catch(console.error);
  }, []);

  const subtotal = itens.reduce((s, i) => s + i.qty * i.preco, 0);

  function addItem(prodId: string) {
    const p = produtos.find(x => x.id.toString() === prodId);
    if (!p) return;
    setItens([...itens, { produto_id: p.id, nome: p.nome, qty: 1, preco: p.preco_venda }]);
  }

  function removeItem(idx: number) {
    setItens(itens.filter((_, i) => i !== idx));
  }

  async function handleSave(status: string) {
    if (!clienteId || itens.length === 0) {
      alert("Selecione um cliente e adicione pelo menos um produto.");
      return;
    }
    const cli = clientes.find(c => c.id.toString() === clienteId);
    try {
      const payload = {
        tipo: "PEDIDO",
        cliente_id: cli.id,
        cliente_nome: cli.nome_razao_social,
        itens: itens.map(i => ({ produto_id: i.produto_id, quantidade: i.qty, preco_unitario: i.preco }))
      };
      
      const res = await api.post<any>("/vendas/pedidos", payload);
      
      if (status === 'aprovado') {
          await api.post(`/vendas/pedidos/${res.id}/aprovar`);
      }
      onSave();
    } catch (err) {
      alert("Erro ao criar pedido");
    }
  }

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="h-16 px-6 border-b border-border flex items-center justify-between bg-muted/20">
        <div className="flex items-center gap-3">
          <button onClick={onCancel} className="p-2 -ml-2 text-muted-foreground hover:bg-muted rounded-lg"><ArrowLeft size={18} /></button>
          <h2 className="text-lg font-bold">Novo Pedido</h2>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => handleSave('rascunho')} className="text-xs px-4 py-2 border border-border rounded-lg">Salvar Rascunho</button>
          <button onClick={() => handleSave('aprovado')} className="text-xs px-5 py-2 bg-primary text-white rounded-lg">Aprovar Pedido</button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-muted/5 custom-scrollbar">
        <FormSection title="1. Cabeçalho">
          <div className="grid grid-cols-2 gap-4">
            <Select label="Cliente *" value={clienteId} onChange={e => setClienteId(e.target.value)}>
              <option value="">Selecione um cliente...</option>
              {clientes.map(c => <option key={c.id} value={c.id}>{c.nome_razao_social}</option>)}
            </Select>
          </div>
        </FormSection>

        <FormSection title="2. Itens do Pedido">
          <div className="border border-border rounded-lg bg-background p-4 space-y-4">
            <div className="flex gap-2">
              <Select label="Adicionar Produto" onChange={e => { if(e.target.value) { addItem(e.target.value); e.target.value = ""; } }}>
                <option value="">Selecione um produto...</option>
                {produtos.map(p => <option key={p.id} value={p.id}>{p.nome} - R$ {p.preco_venda}</option>)}
              </Select>
            </div>
            <table className="w-full">
                <thead>
                  <tr className="text-xs text-muted-foreground border-b border-border">
                    <th className="text-left py-2">Produto</th>
                    <th className="text-right py-2">Qtd</th>
                    <th className="text-right py-2">Preço Unit</th>
                    <th className="text-right py-2">Subtotal</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {itens.map((item, idx) => (
                    <tr key={idx}>
                      <td className="py-2 text-sm">{item.nome}</td>
                      <td className="py-2"><input type="number" value={item.qty} onChange={(e) => { const n = [...itens]; n[idx].qty = +e.target.value; setItens(n); }} className="w-20 text-sm border border-border rounded px-2 py-1 ml-auto text-right" /></td>
                      <td className="py-2 text-right text-sm">{fmtFull(item.preco)}</td>
                      <td className="py-2 text-right text-sm font-bold">{fmtFull(item.qty * item.preco)}</td>
                      <td className="py-2 text-right"><button onClick={() => removeItem(idx)} className="text-red-500"><Trash2 size={14}/></button></td>
                    </tr>
                  ))}
                </tbody>
            </table>
            <div className="text-right text-lg font-bold">Total: {fmtFull(subtotal)}</div>
          </div>
        </FormSection>
      </div>
    </div>
  );
}
"""

pedidos_code = pedidos_code[:form_start] + novo_form + pedidos_code[form_end:]

with open(pedidos_path, "w", encoding="utf-8") as f:
    f.write(pedidos_code)
print("Pedidos refatorado")
