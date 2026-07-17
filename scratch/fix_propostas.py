import os

path = r"d:\ERP Venner\frontend_react\src\app\screens\Propostas.tsx"
with open(path, "r", encoding="utf-8") as f:
    code = f.read()

# Vamos pegar o NovaPropostaForm (o form dark que está no final)
# E vamos extrair a função Propostas() mas corrigida
# O arquivo atual tem:
# 1. imports
# 2. type ItemPedido
# 3. NovoPedidoForm (lixo)
# 4. Pedidos() (que deveria ser Propostas())
# 5. NovaPropostaForm (o dark ui)

import_section = code[:code.find("export function NovoPedidoForm")]

dark_form_start = code.find("export function NovaPropostaForm")
dark_form_code = code[dark_form_start:]

propostas_component = """
export function Propostas() {
  const [view, setView] = useState<"list" | "new">("list");
  const [filter, setFilter] = useState("todos");
  const { can, user } = useAuth();
  
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadData() {
    try {
      setLoading(true);
      const res = await api.get<any[]>("/vendas/pedidos?tipo=COTACAO");
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
  
  const filters = ["todos", "EM_ABERTO", "APROVADO", "CANCELADO"];
  
  const filteredData = data.filter((o) => {
    if (filter === "todos") return true;
    return o.status === filter;
  });

  if (view === "new") {
    return (
      <div className="fixed inset-0 z-50 bg-[#121212] flex flex-col p-0 sm:p-4 lg:p-6">
        <div className="max-w-[1400px] w-full mx-auto h-full">
          <NovaPropostaForm onCancel={() => setView("list")} onSave={() => setView("list")} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm mt-4">
        <TableToolbar 
          title="Propostas Comerciais" 
          count={data.length} 
          onNew={can('pedidos', 'create') ? () => setView("new") : undefined} 
          newLabel="Nova Proposta" 
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
             <div className="p-8 text-center text-muted-foreground">Carregando propostas...</div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="text-xs text-muted-foreground bg-muted/30 border-b border-border">
                  <th className="text-left px-5 py-3 font-semibold">Proposta</th>
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
                        {o.status === 'EM_ABERTO' && (
                           <button onClick={async () => {
                             if(confirm('Aprovar e converter em Pedido?')) {
                               await api.post(`/vendas/pedidos/${o.id}/converter-em-pedido`);
                               loadData();
                             }
                           }} className="text-xs px-2 py-1 bg-primary text-white rounded hover:bg-primary/90">Converter em Pedido</button>
                        )}
                        <button onClick={async () => {
                             if(confirm('Cancelar proposta?')) {
                               await api.post(`/vendas/pedidos/${o.id}/cancelar`);
                               loadData();
                             }
                        }} className="p-1.5 rounded-md hover:bg-red-500/10 text-red-500"><Trash2 size={14} /></button>
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

export default Propostas;
"""

final_code = import_section + dark_form_code + "\n\n" + propostas_component

with open(path, "w", encoding="utf-8") as f:
    f.write(final_code)

print("Propostas.tsx corrigido")
