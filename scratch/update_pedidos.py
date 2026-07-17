import os

pedidos_path = r"d:\ERP Venner\frontend_react\src\app\screens\Pedidos.tsx"

new_content = """import React, { useState } from "react";
import { 
  ShoppingCart, Search, ChevronDown, Package, Wrench, Plus, Trash2, 
  ArrowLeft, Check, MoreHorizontal, Filter, Save, Tag
} from "lucide-react";
import { Badge, Input, Select, Textarea, FormSection, TableToolbar, Pagination, fmt, fmtFull } from "../components/ui/SharedUI";
import * as mockData from "../data/mockData";
import { useLocalData } from "../hooks/useLocalData";
import { useAuth } from "../hooks/useAuth";

type TipoItem = "Produto" | "Serviço";
type ItemPedido = { id: string; tipo: TipoItem; nome: string; qty: number; preco: number; desconto: number };

export function NovoPedidoForm({ onCancel, onSave }: { onCancel: () => void; onSave: (item: any) => void }) {
  const [itens, setItens] = useState<ItemPedido[]>([
    { id: "NEW-1", tipo: "Produto", nome: "Mesa de Escritório", qty: 2, preco: 850.00, desconto: 0 },
    { id: "NEW-2", tipo: "Serviço", nome: "Instalação e Montagem", qty: 1, preco: 150.00, desconto: 0 }
  ]);

  const subtotalProdutos = itens.filter(i => i.tipo === "Produto").reduce((s, i) => s + i.qty * i.preco * (1 - i.desconto / 100), 0);
  const subtotalServicos = itens.filter(i => i.tipo === "Serviço").reduce((s, i) => s + i.qty * i.preco * (1 - i.desconto / 100), 0);
  const frete = itens.some(i => i.tipo === "Produto") ? 45.00 : 0;
  const total = subtotalProdutos + subtotalServicos + frete;

  function addItem(tipo: TipoItem) {
    setItens([...itens, { id: `NEW-${Math.random()}`, tipo, nome: "", qty: 1, preco: 0, desconto: 0 }]);
  }
  function removeItem(idx: number) {
    setItens(itens.filter((_, i) => i !== idx));
  }

  function handleSave(status: string) {
    onSave({
      id: "PED-" + Math.floor(Math.random() * 10000),
      cliente: "Cliente Novo",
      produto: `${itens.length} itens (Misto)`,
      canal: "Venda Direta",
      pagamento: "Boleto",
      valor: total,
      status: status,
      data: new Date().toLocaleDateString('pt-BR')
    });
  }

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="h-16 px-6 border-b border-border flex items-center justify-between bg-muted/20">
        <div className="flex items-center gap-3">
          <button onClick={onCancel} className="p-2 -ml-2 text-muted-foreground hover:bg-muted hover:text-foreground rounded-lg transition-colors">
            <ArrowLeft size={18} />
          </button>
          <h2 className="text-lg font-bold text-foreground" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Novo Pedido de Venda</h2>
          <Badge variant="neutral">Rascunho</Badge>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onCancel} className="text-xs px-4 py-2 border border-border rounded-lg text-muted-foreground hover:bg-muted font-medium transition-colors">
            Cancelar
          </button>
          <button onClick={() => handleSave('rascunho')} className="text-xs px-4 py-2 border border-border rounded-lg text-foreground hover:bg-muted font-medium flex items-center gap-1.5 transition-colors">
            <Save size={14} /> Salvar como rascunho
          </button>
          <button onClick={() => handleSave('aprovado')} className="text-xs px-5 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 font-medium flex items-center gap-1.5 shadow-sm transition-all hover:shadow">
            <Check size={14} /> Aprovar e Gerar Faturamento
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-muted/5 custom-scrollbar">
        {/* Bloco 1: Cabeçalho */}
        <FormSection title="1. Cabeçalho do Pedido">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Cliente <span className="text-red-500">*</span></label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input className="w-full text-sm pl-9 pr-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 transition-shadow" placeholder="Buscar por nome, CPF/CNPJ..." />
                </div>
                <button className="px-3 py-2 border border-border rounded-lg text-primary hover:bg-accent flex items-center gap-1 transition-colors text-sm font-medium">
                  <Plus size={14} /> Novo
                </button>
              </div>
            </div>
            <div>
              <Input label="Vendedor responsável" defaultValue="Logado atual" readOnly className="bg-muted/30" />
            </div>
            <div>
              <Input label="Data do pedido" type="date" defaultValue={new Date().toISOString().split('T')[0]} />
            </div>
            <div>
              <Input label="Data prevista (entrega/execução)" type="date" />
            </div>
            <div>
              <Select label="Depósito de saída (Produtos)">
                <option>Depósito Principal - SP</option>
                <option>Estoque Secundário - RJ</option>
              </Select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Marcadores Internos</label>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="neutral" className="border-dashed cursor-pointer hover:bg-muted"><Plus size={10} className="mr-1" /> Adicionar Tag</Badge>
                <Badge variant="info"><Tag size={10} className="mr-1" /> Revenda</Badge>
                <Badge variant="danger"><Tag size={10} className="mr-1" /> Urgente</Badge>
              </div>
            </div>
          </div>
        </FormSection>

        {/* Bloco 2: Itens Mistos */}
        <FormSection title="2. Itens do Pedido (Produtos e Serviços)">
          <div className="border border-border rounded-lg overflow-hidden bg-background">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-xs text-muted-foreground bg-muted/40 border-b border-border">
                    <th className="text-left px-4 py-2.5 font-semibold w-12">Tipo</th>
                    <th className="text-left px-4 py-2.5 font-semibold">Descrição do Item</th>
                    <th className="text-right px-4 py-2.5 font-semibold w-24">Qtd</th>
                    <th className="text-right px-4 py-2.5 font-semibold w-32">Vlr Unitário</th>
                    <th className="text-right px-4 py-2.5 font-semibold w-24">Desc %</th>
                    <th className="text-right px-4 py-2.5 font-semibold w-32">Subtotal</th>
                    <th className="w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {itens.map((item, idx) => (
                    <tr key={idx} className="hover:bg-muted/10 transition-colors group">
                      <td className="px-4 py-3">
                        <div title={item.tipo} className={`w-8 h-8 rounded-lg flex items-center justify-center ${item.tipo === 'Produto' ? 'bg-blue-500/10 text-blue-600' : 'bg-emerald-500/10 text-emerald-600'}`}>
                          {item.tipo === 'Produto' ? <Package size={16} /> : <Wrench size={16} />}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <input type="text" value={item.nome} onChange={(e) => { const n = [...itens]; n[idx].nome = e.target.value; setItens(n); }} className="w-full text-sm bg-transparent border-0 border-b border-transparent focus:border-primary focus:ring-0 px-1 py-1 transition-colors" placeholder="Buscar ou digitar item..." />
                        <div className="text-[10px] text-muted-foreground px-1 mt-0.5">
                          {item.tipo === 'Produto' ? 'NCM: 8471.30.12 | CFOP: 5102' : 'Cód. Serv: 14.01 | ISS: 5%'}
                        </div>
                      </td>
                      <td className="px-4 py-3"><input type="number" value={item.qty} onChange={(e) => { const n = [...itens]; n[idx].qty = +e.target.value; setItens(n); }} className="w-full text-sm border border-border rounded px-2 py-1.5 text-right focus:border-primary focus:outline-none" /></td>
                      <td className="px-4 py-3"><input type="number" value={item.preco} onChange={(e) => { const n = [...itens]; n[idx].preco = +e.target.value; setItens(n); }} className="w-full text-sm border border-border rounded px-2 py-1.5 text-right focus:border-primary focus:outline-none" /></td>
                      <td className="px-4 py-3"><input type="number" value={item.desconto} onChange={(e) => { const n = [...itens]; n[idx].desconto = +e.target.value; setItens(n); }} className="w-full text-sm border border-border rounded px-2 py-1.5 text-right focus:border-primary focus:outline-none" /></td>
                      <td className="px-4 py-3 text-sm font-semibold text-right">{fmtFull(item.qty * item.preco * (1 - item.desconto / 100))}</td>
                      <td className="px-2 py-3 text-center">
                        <button onClick={() => removeItem(idx)} className="p-1.5 rounded-md text-muted-foreground hover:bg-red-500/10 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={14} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-3 bg-muted/20 border-t border-border flex gap-2">
              <button onClick={() => addItem("Produto")} className="text-xs px-3 py-1.5 rounded-md bg-background border border-border hover:bg-accent text-foreground flex items-center gap-1.5 font-medium transition-colors">
                <Plus size={14} className="text-blue-500" /> Adicionar Produto
              </button>
              <button onClick={() => addItem("Serviço")} className="text-xs px-3 py-1.5 rounded-md bg-background border border-border hover:bg-accent text-foreground flex items-center gap-1.5 font-medium transition-colors">
                <Plus size={14} className="text-emerald-500" /> Adicionar Serviço
              </button>
            </div>
          </div>
        </FormSection>

        {/* Bloco 3 e 4: Totais e Pagamento */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <FormSection title="3. Pagamento e Vencimento">
              <div className="grid grid-cols-2 gap-4">
                <Select label="Forma de recebimento"><option>Pix</option><option>Boleto Bancário</option><option>Cartão de Crédito</option><option>Transferência</option></Select>
                <Select label="Condição de parcelamento"><option>À vista</option><option>2x sem juros</option><option>3x sem juros</option></Select>
                <Input label="Data de vencimento (1ª parcela)" type="date" />
                <Select label="Conta bancária destino"><option>Conta Principal BB</option><option>Conta Digital</option></Select>
              </div>
            </FormSection>
            
            <FormSection title="4. Observações e Anexos">
              <div className="space-y-4">
                <Textarea label="Observações para o Cliente (Sai no orçamento/nota)" placeholder="Ex: Validade da proposta 15 dias..." rows={2} />
                <Textarea label="Observações Internas (Não sai na nota)" placeholder="Ex: Cliente pediu urgência na entrega do produto..." rows={2} />
              </div>
            </FormSection>
          </div>

          <div>
            <FormSection title="Resumo e Totais">
              <div className="bg-background rounded-lg border border-border p-5 space-y-3 shadow-sm">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground flex items-center gap-1.5"><Package size={14}/> Subtotal Produtos</span>
                  <span className="font-medium">{fmtFull(subtotalProdutos)}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground flex items-center gap-1.5"><Wrench size={14}/> Subtotal Serviços</span>
                  <span className="font-medium">{fmtFull(subtotalServicos)}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Descontos Globais</span>
                  <span className="font-medium text-red-500">- {fmtFull(0)}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Frete Estimado</span>
                  <span className="font-medium">{fmtFull(frete)}</span>
                </div>
                
                <div className="pt-3 mt-3 border-t border-dashed border-border flex justify-between items-end">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Total Geral</p>
                    <p className="text-2xl font-bold text-primary leading-none mt-1">{fmtFull(total)}</p>
                  </div>
                </div>
              </div>
            </FormSection>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Pedidos() {
  const [view, setView] = useState<"list" | "new">("list");
  const [filter, setFilter] = useState("todos");
  
  // Pegamos a auth para a checagem de permissões
  const { can, user } = useAuth();
  
  const { data, search, setSearch, page, setPage, totalPages, paginatedData, add, remove } = useLocalData(mockData.ordersData);
  
  const filters = ["todos", "rascunho", "aprovado", "faturado", "concluido", "cancelado"];
  
  const filteredData = paginatedData.filter((o) => {
    // Vendedor só vê os próprios (Simulação: filtro simples por nome, mas na real seria por ID)
    if (user.role === "Vendedor" && o.cliente.length % 2 === 0) return false; // Mock behavior
    if (filter === "todos") return true;
    return o.status.toLowerCase() === filter;
  });

  if (view === "new") {
    return (
      <div className="fixed inset-0 z-50 bg-background flex flex-col p-4 sm:p-6 lg:p-8">
        <div className="max-w-[1200px] w-full mx-auto h-full">
          <NovoPedidoForm onCancel={() => setView("list")} onSave={(item) => { add(item); setView("list"); }} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Vendas Mês", value: "127", color: "" },
          { label: "Aguardando Faturamento", value: "14", color: "text-amber-600" },
          { label: "Em Trânsito", value: "38", color: "text-blue-600" },
          { label: "Entregues", value: "71", color: "text-emerald-600" },
        ].map((s) => (
          <div key={s.label} className="bg-card rounded-xl p-4 border border-border shadow-sm">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{s.label}</p>
            <p className={`text-2xl font-bold mt-1 ${s.color}`} style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{s.value}</p>
          </div>
        ))}
      </div>
      
      <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm">
        <TableToolbar 
          title="Gestão de Pedidos" 
          count={data.length} 
          onNew={can('pedidos', 'create') ? () => setView("new") : undefined} 
          newLabel="Incluir Pedido Misto" 
          search={search}
          onSearch={setSearch}
        />
        
        <div className="px-5 pt-3 pb-0 flex gap-1.5 border-b border-border overflow-x-auto custom-scrollbar">
          {filters.map((f) => (
             <button key={f} onClick={() => setFilter(f)} className={`text-xs px-4 py-2.5 rounded-t-lg font-semibold capitalize whitespace-nowrap transition-colors ${filter === f ? "border-b-2 border-primary text-primary bg-primary/5" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"}`}>
               {f === "todos" ? "Todos" : f}
             </button>
          ))}
        </div>
        
        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full">
            <thead>
              <tr className="text-xs text-muted-foreground bg-muted/30 border-b border-border">
                <th className="text-left px-5 py-3 font-semibold">Pedido</th>
                <th className="text-left px-4 py-3 font-semibold">Cliente</th>
                <th className="text-left px-4 py-3 font-semibold hidden md:table-cell">Composição</th>
                <th className="text-left px-4 py-3 font-semibold hidden lg:table-cell">Canal</th>
                <th className="text-left px-4 py-3 font-semibold hidden md:table-cell">Pagamento</th>
                <th className="text-right px-4 py-3 font-semibold">Valor</th>
                <th className="text-left px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredData.map((o) => {
                const s = mockData.statusConfig[o.status as keyof typeof mockData.statusConfig] || { label: o.status, variant: "neutral", icon: Search };
                return (
                  <tr key={o.id} className="hover:bg-muted/30 transition-colors group">
                    <td className="px-5 py-3.5 text-xs font-mono text-muted-foreground">{o.id}</td>
                    <td className="px-4 py-3.5 text-xs font-medium">{o.cliente}</td>
                    <td className="px-4 py-3.5 text-xs text-muted-foreground hidden md:table-cell max-w-[160px] truncate">{o.produto}</td>
                    <td className="px-4 py-3.5 text-xs hidden lg:table-cell"><Badge variant="neutral">{o.canal}</Badge></td>
                    <td className="px-4 py-3.5 text-xs text-muted-foreground hidden md:table-cell">{o.pagamento}</td>
                    <td className="px-4 py-3.5 text-xs font-semibold text-right">{fmtFull(o.valor)}</td>
                    <td className="px-4 py-3.5"><Badge variant={s.variant}><s.icon size={10} />{s.label}</Badge></td>
                    <td className="px-4 py-3.5 flex items-center justify-end gap-1 opacity-50 group-hover:opacity-100 transition-opacity">
                      {/* Trava: Vendedor não edita aprovado */}
                      {(o.status === "rascunho" || can('pedidos', 'edit_approved')) && (
                        <button className="p-1.5 rounded-md hover:bg-muted text-muted-foreground"><Edit3 size={14} /></button>
                      )}
                      {can('pedidos', 'cancel') && (
                        <button onClick={() => remove(o.id)} className="p-1.5 rounded-md hover:bg-red-500/10 text-red-500"><Trash2 size={14} /></button>
                      )}
                      <button className="p-1.5 rounded-md hover:bg-muted text-muted-foreground"><MoreHorizontal size={14} /></button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <Pagination total={data.length} shown={filteredData.length} page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>
    </div>
  );
}

export default Pedidos;
"""
with open(pedidos_path, "w", encoding="utf-8") as f:
    f.write(new_content)
    print("Pedidos.tsx refactored.")
