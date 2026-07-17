import os

propostas_path = r"d:\ERP Venner\frontend_react\src\app\screens\Propostas.tsx"

with open(propostas_path, "r", encoding="utf-8") as f:
    code = f.read()

form_start = code.find("export function NovaPropostaForm")
form_end = code.find("export default Propostas") - 1 # before "export default Propostas"
# Wait, "export function Propostas() {" is after NovaPropostaForm.
form_end = code.find("export function Propostas() {")

novo_form = """export function NovaPropostaForm({ onCancel, onSave }: { onCancel: () => void; onSave: () => void }) {
  const [itens, setItens] = useState<{produto_id: number; nome: string; sku: string; qty: number; preco: number; descPerc: number}[]>([]);
  const [clientes, setClientes] = useState<any[]>([]);
  const [produtos, setProdutos] = useState<any[]>([]);
  
  const [clienteId, setClienteId] = useState("");
  const [clienteBusca, setClienteBusca] = useState("");
  const [showClientes, setShowClientes] = useState(false);
  
  // Detalhes extras
  const [vendedor, setVendedor] = useState("Vendedor Logado");
  const [listaPreco, setListaPreco] = useState("Padrão");
  const [descontoGlobal, setDescontoGlobal] = useState(0);
  const [freteCliente, setFreteCliente] = useState(0);
  const [freteEmpresa, setFreteEmpresa] = useState(0);
  const [despesas, setDespesas] = useState(0);
  const [dataPrevista, setDataPrevista] = useState("");
  
  // Pagamento
  const [formaRecebimento, setFormaRecebimento] = useState("Boleto");
  
  useEffect(() => {
    api.get<any[]>("/comercial/clientes").then(setClientes).catch(console.error);
    api.get<any[]>("/vendas/catalogo-produtos").then(setProdutos).catch(console.error);
  }, []);

  // Calculos reativos
  const somaQtdes = itens.reduce((s, i) => s + i.qty, 0);
  const totalProdutos = itens.reduce((s, i) => s + (i.qty * i.preco * (1 - i.descPerc/100)), 0);
  const totalVenda = totalProdutos + freteCliente + despesas - descontoGlobal;

  function addItem(prodId: string) {
    const p = produtos.find(x => x.id.toString() === prodId);
    if (!p) return;
    setItens([...itens, { produto_id: p.id, nome: p.nome, sku: p.sku || "N/A", qty: 1, preco: p.preco_venda, descPerc: 0 }]);
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
        tipo: "COTACAO",
        cliente_id: cli.id,
        cliente_nome: cli.nome_razao_social,
        valor_frete: freteCliente,
        desconto_valor: descontoGlobal,
        itens: itens.map(i => ({ 
          produto_id: i.produto_id, 
          quantidade: i.qty, 
          preco_unitario: i.preco * (1 - i.descPerc/100) 
        }))
        // Backend models ainda não mapeados 100% no schema Pydantic, então enviamos apenas o que o Pydantic já aceita
      };
      
      const res = await api.post<any>("/vendas/pedidos", payload);
      
      if (status === 'aprovado') {
          await api.post(`/vendas/pedidos/${res.id}/converter-em-pedido`);
      }
      onSave();
    } catch (err) {
      alert("Erro ao criar proposta");
    }
  }

  const clientesFiltrados = clientes.filter(c => {
    const term = clienteBusca.toLowerCase();
    return (
      (c.nome_razao_social && c.nome_razao_social.toLowerCase().includes(term)) ||
      (c.nome_fantasia && c.nome_fantasia.toLowerCase().includes(term)) ||
      (c.cpf_cnpj && c.cpf_cnpj.replace(/\D/g, '').includes(term.replace(/\D/g, '')))
    );
  }).slice(0, 10);

  const clienteSelecionado = clientes.find(c => c.id.toString() === clienteId);

  return (
    <div className="bg-[#1e1e1e] text-[#e0e0e0] rounded-xl overflow-hidden flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-300">
      
      {/* Header Sticky */}
      <div className="h-16 px-6 border-b border-[#333] flex items-center justify-between bg-[#121212] sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <button onClick={onCancel} className="p-2 -ml-2 text-gray-400 hover:bg-[#333] rounded-lg transition-colors"><ArrowLeft size={18} /></button>
          <h2 className="text-xl font-bold text-white">Pedido de Venda (Proposta)</h2>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => handleSave('rascunho')} className="text-sm px-5 py-2 rounded-lg bg-transparent hover:bg-[#333] transition-colors">salvar rascunho</button>
          <button onClick={() => handleSave('aprovado')} className="text-sm px-5 py-2 bg-[#0052cc] hover:bg-[#0047b3] text-white rounded-lg transition-colors shadow-sm">salvar e aprovar</button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-10">
        
        {/* Bloco 1: Cabecalho */}
        <div className="space-y-4 max-w-5xl">
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-3">
              <label className="block text-xs text-gray-400 mb-1">Número</label>
              <input type="text" value="Automático" disabled className="w-full bg-[#121212] border border-[#333] rounded-md px-3 py-2 text-sm text-gray-500 cursor-not-allowed" />
            </div>
            
            <div className="col-span-12 lg:col-span-6 relative">
              <label className="block text-xs text-gray-400 mb-1">Cliente *</label>
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
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
                  placeholder="Pesquise pelas iniciais, cpf/cnpj ou e-mail..." 
                  className="w-full bg-[#121212] border border-[#333] rounded-md pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-[#0052cc] transition-colors" 
                />
                {showClientes && (
                  <div className="absolute z-10 w-full mt-1 bg-[#1e1e1e] border border-[#333] rounded-lg shadow-2xl max-h-60 overflow-y-auto">
                    {clientesFiltrados.map(c => (
                      <button key={c.id} className="w-full text-left px-4 py-2 hover:bg-[#333] border-b border-[#333] last:border-0" onClick={() => { setClienteId(c.id.toString()); setClienteBusca(""); setShowClientes(false); }}>
                        <span className="block text-sm text-white">{c.nome_razao_social}</span>
                        <span className="block text-xs text-gray-500">{c.cpf_cnpj}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex gap-4 mt-2 text-xs text-[#00a3ff]">
                <button className="hover:underline">dados do cliente</button>
                <button className="hover:underline">ver últimas vendas</button>
                <button className="hover:underline">limite de crédito</button>
              </div>
            </div>

            <div className="col-span-12 lg:col-span-3">
              <label className="block text-xs text-gray-400 mb-1">Vendedor</label>
              <input type="text" value={vendedor} onChange={e => setVendedor(e.target.value)} className="w-full bg-[#121212] border border-[#333] rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-[#0052cc]" />
            </div>
            
            <div className="col-span-4">
              <label className="block text-xs text-gray-400 mb-1">Lista de preço</label>
              <select value={listaPreco} onChange={e => setListaPreco(e.target.value)} className="w-full bg-[#121212] border border-[#333] rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-[#0052cc]">
                <option>Padrão</option>
                <option>Atacado</option>
              </select>
            </div>
            
            <div className="col-span-12 mt-2">
              <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                <input type="checkbox" className="rounded bg-[#121212] border-[#333] text-[#0052cc] focus:ring-0 w-4 h-4" />
                O endereço de entrega do cliente é diferente do endereço de cobrança
              </label>
            </div>
          </div>
        </div>

        {/* Bloco 2: Itens */}
        <div className="border-t border-[#333] pt-6 max-w-6xl">
          <div className="flex gap-6 border-b border-[#333] mb-4">
            <button className="pb-2 border-b-2 border-white text-white text-sm font-medium">Itens de produtos ou serviços</button>
            <button className="pb-2 border-b-2 border-transparent text-gray-500 text-sm hover:text-gray-300">Comissões</button>
          </div>
          
          <div className="bg-[#121212] border border-[#333] rounded-lg overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#1e1e1e] border-b border-[#333] text-gray-400 text-xs text-left">
                <tr>
                  <th className="py-3 px-4 font-normal">Nº</th>
                  <th className="py-3 px-4 font-normal">Descrição</th>
                  <th className="py-3 px-4 font-normal">Código (SKU)</th>
                  <th className="py-3 px-4 font-normal text-right">Qtde</th>
                  <th className="py-3 px-4 font-normal">UN</th>
                  <th className="py-3 px-4 font-normal text-right">Preço lista</th>
                  <th className="py-3 px-4 font-normal text-right">% Desc</th>
                  <th className="py-3 px-4 font-normal text-right">Preço un</th>
                  <th className="py-3 px-4 font-normal text-right">Preço total</th>
                  <th className="py-3 px-4 font-normal text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#333]">
                {itens.map((item, i) => {
                  const p_un = item.preco * (1 - item.descPerc/100);
                  const p_total = p_un * item.qty;
                  return (
                    <tr key={i} className="hover:bg-[#1a1a1a]">
                      <td className="py-2 px-4 text-gray-500">{i+1}</td>
                      <td className="py-2 px-4 text-white">{item.nome}</td>
                      <td className="py-2 px-4 text-gray-400">{item.sku}</td>
                      <td className="py-2 px-4"><input type="number" value={item.qty} onChange={(e) => { const n = [...itens]; n[i].qty = +e.target.value; setItens(n); }} className="w-16 bg-transparent border border-[#444] rounded px-2 py-1 text-right text-white focus:border-[#0052cc] focus:outline-none" /></td>
                      <td className="py-2 px-4 text-gray-500">UN</td>
                      <td className="py-2 px-4 text-right text-gray-400">{item.preco.toFixed(2)}</td>
                      <td className="py-2 px-4"><input type="number" value={item.descPerc} onChange={(e) => { const n = [...itens]; n[i].descPerc = +e.target.value; setItens(n); }} className="w-16 bg-transparent border border-[#444] rounded px-2 py-1 text-right text-white focus:border-[#0052cc] focus:outline-none" /></td>
                      <td className="py-2 px-4 text-right text-gray-300">{p_un.toFixed(2)}</td>
                      <td className="py-2 px-4 text-right text-white font-medium">{p_total.toFixed(2)}</td>
                      <td className="py-2 px-4 text-center">
                        <button onClick={() => removeItem(i)} className="text-gray-500 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            
            <div className="p-4 bg-[#1e1e1e] flex gap-4 items-center">
              <select onChange={e => { if(e.target.value) { addItem(e.target.value); e.target.value = ""; } }} className="bg-[#121212] border border-[#333] rounded-md px-3 py-1.5 text-sm text-gray-300 focus:outline-none focus:border-[#0052cc] w-64">
                <option value="">Pesquise por descrição ou código...</option>
                {produtos.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
              </select>
              <button className="text-sm text-[#00a3ff] flex items-center gap-1 hover:underline"><Search size={14} /> busca avançada de itens</button>
            </div>
          </div>
        </div>

        {/* Bloco 3: Totais */}
        <div className="max-w-5xl">
          <h3 className="text-sm text-white mb-4">Totais</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Nº de itens</label>
              <div className="bg-[#121212] border border-[#333] rounded-md px-3 py-2 text-sm text-white">{itens.length}</div>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Soma das qtdes</label>
              <div className="bg-[#121212] border border-[#333] rounded-md px-3 py-2 text-sm text-white">{somaQtdes}</div>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Peso Bruto</label>
              <div className="bg-[#121212] border border-[#333] rounded-md px-3 py-2 text-sm text-gray-500 flex justify-between">0,00 <span className="text-[#333]">kg</span></div>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Total produtos</label>
              <div className="bg-[#121212] border border-[#333] rounded-md px-3 py-2 text-sm text-white flex justify-between"><span className="text-gray-500">R$</span> {totalProdutos.toFixed(2)}</div>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Total da venda</label>
              <div className="bg-[#121212] border border-[#333] rounded-md px-3 py-2 text-sm text-white font-bold flex justify-between"><span className="text-gray-500">R$</span> {totalVenda.toFixed(2)}</div>
            </div>
          </div>
        </div>

        {/* Bloco 4: Detalhes da Venda */}
        <div className="border-t border-[#333] pt-6 max-w-5xl">
          <h3 className="text-sm text-white mb-4">Detalhes da venda</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Data da venda</label>
              <input type="date" className="w-full bg-[#121212] border border-[#333] rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-[#0052cc]" defaultValue={new Date().toISOString().split('T')[0]} />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Data prevista de entrega</label>
              <input type="date" value={dataPrevista} onChange={e => setDataPrevista(e.target.value)} className="w-full bg-[#121212] border border-[#333] rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-[#0052cc]" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Data de envio</label>
              <input type="date" className="w-full bg-[#121212] border border-[#333] rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-[#0052cc]" />
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Desconto R$</label>
              <input type="number" value={descontoGlobal} onChange={e => setDescontoGlobal(+e.target.value)} className="w-full bg-[#121212] border border-[#333] rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-[#0052cc]" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Frete pago pelo cliente</label>
              <div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">R$</span>
              <input type="number" value={freteCliente} onChange={e => setFreteCliente(+e.target.value)} className="w-full bg-[#121212] border border-[#333] rounded-md pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-[#0052cc]" /></div>
              <p className="text-[10px] text-gray-500 mt-1 leading-tight">Este valor será transferido e considerado na nota fiscal</p>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Frete pago pela empresa</label>
              <div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">R$</span>
              <input type="number" value={freteEmpresa} onChange={e => setFreteEmpresa(+e.target.value)} className="w-full bg-[#121212] border border-[#333] rounded-md pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-[#0052cc]" /></div>
              <p className="text-[10px] text-gray-500 mt-1 leading-tight">Valor informativo, de uso interno</p>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Despesas</label>
              <div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">R$</span>
              <input type="number" value={despesas} onChange={e => setDespesas(+e.target.value)} className="w-full bg-[#121212] border border-[#333] rounded-md pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-[#0052cc]" /></div>
            </div>
          </div>
        </div>

        {/* Bloco 5: Pagamento */}
        <div className="border-t border-[#333] pt-6 max-w-5xl">
          <div className="flex gap-6 border-b border-[#333] mb-6">
            <button className="pb-2 border-b-2 border-white text-white text-sm font-medium">Pagamento</button>
            <button className="pb-2 border-b-2 border-transparent text-gray-500 text-sm hover:text-gray-300">Pagamento integrado</button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Forma de recebimento</label>
              <select value={formaRecebimento} onChange={e => setFormaRecebimento(e.target.value)} className="w-full bg-[#121212] border border-[#333] rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-[#0052cc]">
                <option>Selecione</option>
                <option>Boleto</option>
                <option>Pix</option>
                <option>Dinheiro</option>
                <option>Cartão de Crédito</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Condição de pagamento</label>
              <input type="text" placeholder="Ex: 30 60, 3x ou 15 +2x" className="w-full bg-[#121212] border border-[#333] rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-[#0052cc]" />
            </div>
          </div>
        </div>
        
        {/* Bloco 6: Transporte e Dados Adicionais */}
        <div className="border-t border-[#333] pt-6 max-w-5xl">
          <h3 className="text-sm text-white mb-4">Transportador / Volumes</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Forma de envio</label>
              <select className="w-full bg-[#121212] border border-[#333] rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-[#0052cc]">
                <option>Não definida</option>
                <option>Correios SEDEX</option>
                <option>Transportadora Jadlog</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Enviar para expedição</label>
              <select className="w-full bg-[#121212] border border-[#333] rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-[#0052cc]">
                <option>Sim</option>
                <option>Não</option>
              </select>
            </div>
          </div>

          <h3 className="text-sm text-white mb-4">Dados adicionais</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Depósito</label>
              <select className="w-full bg-[#121212] border border-[#333] rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-[#0052cc]">
                <option>Padrão</option>
              </select>
            </div>
          </div>
          <div className="space-y-4 max-w-3xl">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Observações</label>
              <textarea rows={3} className="w-full bg-[#121212] border border-[#333] rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-[#0052cc] resize-none" placeholder="Esta informação será impressa na venda e transferida para as observações da nota."></textarea>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Observações Internas</label>
              <textarea rows={2} className="w-full bg-[#121212] border border-[#333] rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-[#0052cc] resize-none" placeholder="Informação de uso interno, exibida na impressão detalhada."></textarea>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
"""

code = code[:form_start] + novo_form + code[form_end:]

# Adicionar dependências se faltar
if "Trash2" not in code:
    code = code.replace("Search,", "Search, Trash2,")

with open(propostas_path, "w", encoding="utf-8") as f:
    f.write(code)

print("Propostas (Dark UI) refatorada com sucesso!")
