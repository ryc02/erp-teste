import os

pedidos_path = r"d:\ERP Venner\frontend_react\src\app\screens\Pedidos.tsx"
config_path = r"d:\ERP Venner\frontend_react\src\app\screens\Configuracoes.tsx"

# Atualizar Pedidos.tsx
with open(pedidos_path, "r", encoding="utf-8") as f:
    pedidos_content = f.read()

# Substituir o tipo ItemPedido e remover TipoItem
pedidos_content = pedidos_content.replace('type TipoItem = "Produto" | "Serviço";\ntype ItemPedido = { id: string; tipo: TipoItem; nome: string; qty: number; preco: number; desconto: number };', 'type ItemPedido = { id: string; nome: string; qty: number; preco: number; desconto: number };')

# Substituir a inicialização do estado de itens
pedidos_content = pedidos_content.replace('const [itens, setItens] = useState<ItemPedido[]>([\n    { id: "NEW-1", tipo: "Produto", nome: "Mesa de Escritório", qty: 2, preco: 850.00, desconto: 0 },\n    { id: "NEW-2", tipo: "Serviço", nome: "Instalação e Montagem", qty: 1, preco: 150.00, desconto: 0 }\n  ]);', 'const [itens, setItens] = useState<ItemPedido[]>([\n    { id: "NEW-1", nome: "Mesa de Escritório", qty: 2, preco: 850.00, desconto: 0 }\n  ]);')

# Atualizar subtotais e totais
pedidos_content = pedidos_content.replace('const subtotalProdutos = itens.filter(i => i.tipo === "Produto").reduce((s, i) => s + i.qty * i.preco * (1 - i.desconto / 100), 0);\n  const subtotalServicos = itens.filter(i => i.tipo === "Serviço").reduce((s, i) => s + i.qty * i.preco * (1 - i.desconto / 100), 0);\n  const frete = itens.some(i => i.tipo === "Produto") ? 45.00 : 0;\n  const total = subtotalProdutos + subtotalServicos + frete;', 'const subtotal = itens.reduce((s, i) => s + i.qty * i.preco * (1 - i.desconto / 100), 0);\n  const frete = 45.00;\n  const total = subtotal + frete;')

# Atualizar função addItem
pedidos_content = pedidos_content.replace('function addItem(tipo: TipoItem) {\n    setItens([...itens, { id: `NEW-${Math.random()}`, tipo, nome: "", qty: 1, preco: 0, desconto: 0 }]);\n  }', 'function addItem() {\n    setItens([...itens, { id: `NEW-${Math.random()}`, nome: "", qty: 1, preco: 0, desconto: 0 }]);\n  }')

# Substituir título do bloco 2
pedidos_content = pedidos_content.replace('<FormSection title="2. Itens do Pedido (Produtos e Serviços)">', '<FormSection title="2. Itens do Pedido">')

# Substituir cabeçalho da tabela (remover a coluna Tipo)
pedidos_content = pedidos_content.replace('<th className="text-left px-4 py-2.5 font-semibold w-12">Tipo</th>\n                    <th className="text-left px-4 py-2.5 font-semibold">Descrição do Item</th>', '<th className="text-left px-4 py-2.5 font-semibold">Descrição do Produto</th>')

# Substituir renderização da linha (remover ícone de pacote/ferramenta e a coluna extra)
pedidos_content = pedidos_content.replace('<td className="px-4 py-3">\n                        <div title={item.tipo} className={`w-8 h-8 rounded-lg flex items-center justify-center ${item.tipo === \'Produto\' ? \'bg-blue-500/10 text-blue-600\' : \'bg-emerald-500/10 text-emerald-600\'}`}>\n                          {item.tipo === \'Produto\' ? <Package size={16} /> : <Wrench size={16} />}\n                        </div>\n                      </td>\n                      <td className="px-4 py-3">\n                        <input type="text" value={item.nome} onChange={(e) => { const n = [...itens]; n[idx].nome = e.target.value; setItens(n); }} className="w-full text-sm bg-transparent border-0 border-b border-transparent focus:border-primary focus:ring-0 px-1 py-1 transition-colors" placeholder="Buscar ou digitar item..." />\n                        <div className="text-[10px] text-muted-foreground px-1 mt-0.5">\n                          {item.tipo === \'Produto\' ? \'NCM: 8471.30.12 | CFOP: 5102\' : \'Cód. Serv: 14.01 | ISS: 5%\'}\n                        </div>\n                      </td>', '<td className="px-4 py-3">\n                        <input type="text" value={item.nome} onChange={(e) => { const n = [...itens]; n[idx].nome = e.target.value; setItens(n); }} className="w-full text-sm bg-transparent border-0 border-b border-transparent focus:border-primary focus:ring-0 px-1 py-1 transition-colors" placeholder="Buscar ou digitar produto..." />\n                        <div className="text-[10px] text-muted-foreground px-1 mt-0.5">\n                          NCM: 8471.30.12 | CFOP: 5102\n                        </div>\n                      </td>')

# Substituir botões de adição
pedidos_content = pedidos_content.replace('<button onClick={() => addItem("Produto")} className="text-xs px-3 py-1.5 rounded-md bg-background border border-border hover:bg-accent text-foreground flex items-center gap-1.5 font-medium transition-colors">\n                <Plus size={14} className="text-blue-500" /> Adicionar Produto\n              </button>\n              <button onClick={() => addItem("Serviço")} className="text-xs px-3 py-1.5 rounded-md bg-background border border-border hover:bg-accent text-foreground flex items-center gap-1.5 font-medium transition-colors">\n                <Plus size={14} className="text-emerald-500" /> Adicionar Serviço\n              </button>', '<button onClick={() => addItem()} className="text-xs px-3 py-1.5 rounded-md bg-background border border-border hover:bg-accent text-foreground flex items-center gap-1.5 font-medium transition-colors">\n                <Plus size={14} className="text-primary" /> Adicionar Produto\n              </button>')

# Substituir os totais
pedidos_content = pedidos_content.replace('<div className="flex justify-between items-center text-sm">\n                  <span className="text-muted-foreground flex items-center gap-1.5"><Package size={14}/> Subtotal Produtos</span>\n                  <span className="font-medium">{fmtFull(subtotalProdutos)}</span>\n                </div>\n                <div className="flex justify-between items-center text-sm">\n                  <span className="text-muted-foreground flex items-center gap-1.5"><Wrench size={14}/> Subtotal Serviços</span>\n                  <span className="font-medium">{fmtFull(subtotalServicos)}</span>\n                </div>', '<div className="flex justify-between items-center text-sm">\n                  <span className="text-muted-foreground flex items-center gap-1.5"><Package size={14}/> Subtotal</span>\n                  <span className="font-medium">{fmtFull(subtotal)}</span>\n                </div>')

# Substituir "Incluir Pedido Misto" por "Incluir Pedido"
pedidos_content = pedidos_content.replace('newLabel="Incluir Pedido Misto"', 'newLabel="Incluir Pedido"')
pedidos_content = pedidos_content.replace('produto: `${itens.length} itens (Misto)`,', 'produto: `${itens.length} produtos`,')

with open(pedidos_path, "w", encoding="utf-8") as f:
    f.write(pedidos_content)

# Atualizar Configuracoes.tsx
with open(config_path, "r", encoding="utf-8") as f:
    config_content = f.read()

# Remover "<label className="flex items-center gap-2 text-sm"><input type="checkbox" className="accent-primary" /> Exigir Código de Serviço Municipal para Serviços</label>"
config_content = config_content.replace('<label className="flex items-center gap-2 text-sm"><input type="checkbox" className="accent-primary" /> Exigir Código de Serviço Municipal para Serviços</label>', '')

with open(config_path, "w", encoding="utf-8") as f:
    f.write(config_content)

print("Removed service logic from Pedidos.tsx and Configuracoes.tsx.")
