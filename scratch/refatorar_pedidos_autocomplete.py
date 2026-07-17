import os

pedidos_path = r"d:\ERP Venner\frontend_react\src\app\screens\Pedidos.tsx"

with open(pedidos_path, "r", encoding="utf-8") as f:
    pedidos_code = f.read()

form_start = pedidos_code.find("export function NovoPedidoForm")
form_end = pedidos_code.find("export function Pedidos")

novo_form = """export function NovoPedidoForm({ onCancel, onSave }: { onCancel: () => void; onSave: () => void }) {
  const [itens, setItens] = useState<{produto_id: number; nome: string; qty: number; preco: number}[]>([]);
  const [clientes, setClientes] = useState<any[]>([]);
  const [produtos, setProdutos] = useState<any[]>([]);
  
  // Autocomplete state
  const [clienteId, setClienteId] = useState("");
  const [clienteBusca, setClienteBusca] = useState("");
  const [showClientes, setShowClientes] = useState(false);

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

  // Filtragem inteligente de clientes
  const clientesFiltrados = clientes.filter(c => {
    const term = clienteBusca.toLowerCase();
    return (
      (c.nome_razao_social && c.nome_razao_social.toLowerCase().includes(term)) ||
      (c.nome_fantasia && c.nome_fantasia.toLowerCase().includes(term)) ||
      (c.cpf_cnpj && c.cpf_cnpj.replace(/\D/g, '').includes(term.replace(/\D/g, '')))
    );
  }).slice(0, 10); // Limita a 10 sugestões para não travar a tela

  const clienteSelecionado = clientes.find(c => c.id.toString() === clienteId);

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="h-16 px-6 border-b border-border flex items-center justify-between bg-muted/20">
        <div className="flex items-center gap-3">
          <button onClick={onCancel} className="p-2 -ml-2 text-muted-foreground hover:bg-muted rounded-lg transition-colors"><ArrowLeft size={18} /></button>
          <h2 className="text-lg font-bold" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Novo Pedido</h2>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => handleSave('rascunho')} className="text-xs px-4 py-2 border border-border rounded-lg text-muted-foreground hover:bg-muted font-medium transition-colors">Salvar Rascunho</button>
          <button onClick={() => handleSave('aprovado')} className="text-xs px-5 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 font-medium transition-all shadow-sm">Aprovar Pedido</button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-muted/5 custom-scrollbar">
        <FormSection title="1. Cabeçalho">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 relative">
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Cliente *</label>
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input 
                  type="text" 
                  value={clienteSelecionado && !showClientes ? `${clienteSelecionado.nome_razao_social} (${clienteSelecionado.cpf_cnpj})` : clienteBusca}
                  onChange={e => {
                    setClienteBusca(e.target.value);
                    setShowClientes(true);
                    if (clienteId) setClienteId("");
                  }}
                  onFocus={() => setShowClientes(true)}
                  onBlur={() => setTimeout(() => setShowClientes(false), 200)}
                  placeholder="Buscar por Razão Social, Nome Fantasia, CPF ou CNPJ..." 
                  className="w-full text-sm pl-9 pr-3 py-2.5 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 transition-shadow" 
                />
                {showClientes && (
                  <div className="absolute z-10 w-full mt-1 bg-card border border-border rounded-lg shadow-lg max-h-60 overflow-y-auto custom-scrollbar">
                    {clientesFiltrados.length === 0 ? (
                      <div className="p-3 text-sm text-muted-foreground text-center">Nenhum cliente encontrado.</div>
                    ) : (
                      clientesFiltrados.map(c => (
                        <button
                          key={c.id}
                          className="w-full text-left px-4 py-2.5 hover:bg-muted/50 border-b border-border/50 last:border-0 transition-colors flex flex-col"
                          onClick={() => {
                            setClienteId(c.id.toString());
                            setClienteBusca("");
                            setShowClientes(false);
                          }}
                        >
                          <span className="font-semibold text-sm text-foreground">{c.nome_razao_social} {c.nome_fantasia ? `(${c.nome_fantasia})` : ''}</span>
                          <span className="text-xs text-muted-foreground font-mono">{c.cpf_cnpj} - {c.cidade}/{c.uf}</span>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </FormSection>

        <FormSection title="2. Itens do Pedido">
          <div className="border border-border rounded-lg bg-background p-4 space-y-4 shadow-sm">
            <div className="flex gap-2">
              <Select label="Adicionar Produto" onChange={e => { if(e.target.value) { addItem(e.target.value); e.target.value = ""; } }}>
                <option value="">Selecione um produto do catálogo...</option>
                {produtos.map(p => <option key={p.id} value={p.id}>{p.nome} - R$ {p.preco_venda}</option>)}
              </Select>
            </div>
            
            {itens.length > 0 && (
              <table className="w-full mt-4">
                  <thead>
                    <tr className="text-xs text-muted-foreground border-b border-border">
                      <th className="text-left py-2 font-medium">Produto</th>
                      <th className="text-right py-2 font-medium w-24">Qtd</th>
                      <th className="text-right py-2 font-medium w-32">Preço Unit</th>
                      <th className="text-right py-2 font-medium w-32">Subtotal</th>
                      <th className="w-10"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {itens.map((item, idx) => (
                      <tr key={idx} className="group">
                        <td className="py-2.5 text-sm font-medium">{item.nome}</td>
                        <td className="py-2.5"><input type="number" value={item.qty} onChange={(e) => { const n = [...itens]; n[idx].qty = +e.target.value; setItens(n); }} className="w-full text-sm border border-border rounded-md px-2 py-1.5 text-right focus:ring-1 focus:ring-primary focus:outline-none" /></td>
                        <td className="py-2.5 text-right text-sm text-muted-foreground">{fmtFull(item.preco)}</td>
                        <td className="py-2.5 text-right text-sm font-semibold">{fmtFull(item.qty * item.preco)}</td>
                        <td className="py-2.5 text-center">
                          <button onClick={() => removeItem(idx)} className="p-1.5 rounded-md text-muted-foreground hover:bg-red-500/10 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={14}/></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
              </table>
            )}
            <div className="text-right pt-4 border-t border-border mt-2">
              <span className="text-sm text-muted-foreground mr-3">Total do Pedido:</span>
              <span className="text-2xl font-bold text-primary">{fmtFull(subtotal)}</span>
            </div>
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
print("Pedidos refatorado com autocomplete!")
