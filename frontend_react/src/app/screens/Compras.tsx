import React, { useState, useEffect } from "react";
import { api } from "../services/api";
import { TableToolbar, Pagination, Badge, Modal, Input, Select, FormSection, fmtFull } from "../components/ui/SharedUI";
import { Plus, Minus, Trash2, CheckCircle, PackageCheck, Eye } from "lucide-react";

export function ComprasForm({ onClose, onSave }: { onClose: () => void; onSave: () => void }) {
  const [fornecedores, setFornecedores] = useState<any[]>([]);
  const [produtos, setProdutos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    fornecedor_id: "",
    valor_frete: 0,
    desconto_valor: 0,
    observacoes: ""
  });

  const [itens, setItens] = useState([{ produto_id: "", quantidade: 1, preco_unitario: 0 }]);

  useEffect(() => {
    api.get<any[]>("/comercial/clientes?limit=2000").then(res => {
      setFornecedores(res.filter(c => c.tipo_contato === "Fornecedor"));
    }).catch(console.error);

    api.get<any[]>("/produtos").then(setProdutos).catch(console.error);
  }, []);

  const totalItens = itens.reduce((acc, it) => acc + (it.quantidade * it.preco_unitario), 0);
  const totalGeral = totalItens + form.valor_frete - form.desconto_valor;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.fornecedor_id) return alert("Selecione o fornecedor");
    if (itens.some(i => !i.produto_id)) return alert("Preencha todos os itens corretamente");

    setLoading(true);
    try {
      const fn = fornecedores.find(f => f.id.toString() === form.fornecedor_id);
      
      const payload = {
        fornecedor_id: fn.id,
        fornecedor_nome: fn.nome_razao_social,
        valor_frete: form.valor_frete,
        desconto_valor: form.desconto_valor,
        observacoes: form.observacoes,
        status: "RASCUNHO",
        itens: itens.map(i => ({
          produto_id: parseInt(i.produto_id),
          quantidade: i.quantidade,
          preco_unitario: i.preco_unitario
        }))
      };

      await api.post("/compras/ordens", payload);
      onSave();
    } catch (err: any) {
      alert(err?.message || "Erro ao criar ordem de compra");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <FormSection title="Dados Principais">
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-3">
            <Select 
              label="Fornecedor" 
              value={form.fornecedor_id} 
              onChange={e => setForm({ ...form, fornecedor_id: e.target.value })}
              required
            >
              <option value="">Selecione o fornecedor...</option>
              {fornecedores.map(f => (
                <option key={f.id} value={f.id}>{f.nome_razao_social} ({f.cpf_cnpj})</option>
              ))}
            </Select>
          </div>
          <Input 
            label="Valor do Frete (R$)" 
            type="number" 
            step="0.01" 
            min={0}
            value={form.valor_frete} 
            onChange={e => setForm({ ...form, valor_frete: parseFloat(e.target.value) || 0 })} 
          />
          <Input 
            label="Desconto (R$)" 
            type="number" 
            step="0.01" 
            min={0}
            value={form.desconto_valor} 
            onChange={e => setForm({ ...form, desconto_valor: parseFloat(e.target.value) || 0 })} 
          />
          <Input 
            label="Observações" 
            value={form.observacoes} 
            onChange={e => setForm({ ...form, observacoes: e.target.value })} 
          />
        </div>
      </FormSection>

      <FormSection title="Itens do Pedido">
        <div className="space-y-3">
          {itens.map((item, idx) => (
            <div key={idx} className="flex gap-3 items-end">
              <div className="flex-1">
                <Select 
                  label={idx === 0 ? "Produto" : ""} 
                  value={item.produto_id}
                  onChange={e => {
                    const n = [...itens];
                    n[idx].produto_id = e.target.value;
                    const p = produtos.find(pr => pr.id.toString() === e.target.value);
                    if (p) n[idx].preco_unitario = p.preco_venda || 0; // fallback pra custo se houver
                    setItens(n);
                  }}
                  required
                >
                  <option value="">Selecionar...</option>
                  {produtos.map(p => (
                    <option key={p.id} value={p.id}>{p.sku} - {p.nome}</option>
                  ))}
                </Select>
              </div>
              <div className="w-24">
                <Input 
                  label={idx === 0 ? "Qtd" : ""} 
                  type="number" 
                  min={1} 
                  step="any"
                  value={item.quantidade}
                  onChange={e => {
                    const n = [...itens];
                    n[idx].quantidade = parseFloat(e.target.value) || 0;
                    setItens(n);
                  }}
                  required
                />
              </div>
              <div className="w-32">
                <Input 
                  label={idx === 0 ? "Preço Un." : ""} 
                  type="number" 
                  min={0} 
                  step="0.01"
                  value={item.preco_unitario}
                  onChange={e => {
                    const n = [...itens];
                    n[idx].preco_unitario = parseFloat(e.target.value) || 0;
                    setItens(n);
                  }}
                  required
                />
              </div>
              <div className="w-32 pb-2 text-right">
                <span className="text-sm font-semibold">{fmtFull(item.quantidade * item.preco_unitario)}</span>
              </div>
              {itens.length > 1 && (
                <button type="button" onClick={() => setItens(itens.filter((_, i) => i !== idx))} className="mb-2 p-2 text-red-500 hover:bg-red-50 rounded-lg">
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          ))}
          <button 
            type="button" 
            onClick={() => setItens([...itens, { produto_id: "", quantidade: 1, preco_unitario: 0 }])}
            className="text-sm text-primary flex items-center gap-1 mt-2 hover:underline"
          >
            <Plus size={14} /> Adicionar Produto
          </button>
        </div>
      </FormSection>

      <div className="bg-muted/40 p-4 rounded-lg flex justify-between items-center">
        <span className="text-sm font-semibold text-muted-foreground">Total da Ordem de Compra:</span>
        <span className="text-xl font-bold text-primary">{fmtFull(totalGeral)}</span>
      </div>

      <div className="flex justify-end gap-2 pt-4 border-t border-border">
        <button type="button" className="px-4 py-2 text-sm text-muted-foreground hover:bg-muted rounded-lg" onClick={onClose}>Cancelar</button>
        <button type="submit" disabled={loading} className="px-4 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary/90">
          {loading ? "Salvando..." : "Salvar Pedido"}
        </button>
      </div>
    </form>
  );
}

export function Compras() {
  const [modal, setModal] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadData() {
    try {
      setLoading(true);
      const res = await api.get<any[]>("/compras/ordens");
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleAprovar(id: number) {
    if (!confirm("Aprovar esta Ordem de Compra?")) return;
    try {
      await api.post(`/compras/ordens/${id}/aprovar`);
      loadData();
    } catch (err: any) {
      alert(err?.message || "Erro ao aprovar");
    }
  }

  async function handleReceber(id: number) {
    if (!confirm("Confirmar recebimento? Os itens serão adicionados ao estoque.")) return;
    try {
      await api.post(`/compras/ordens/${id}/receber`);
      alert("Recebimento concluído. Estoque atualizado.");
      loadData();
    } catch (err: any) {
      alert(err?.message || "Erro ao receber");
    }
  }

  return (
    <div className="space-y-4">
      <Modal open={modal} onClose={() => setModal(false)} title="Nova Ordem de Compra" wide>
        <ComprasForm onClose={() => setModal(false)} onSave={() => { setModal(false); loadData(); }} />
      </Modal>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <TableToolbar 
          title="Gestão de Compras" 
          subtitle="Ordens de Compra" 
          count={data.length} 
          onNew={() => setModal(true)} 
          newLabel="Nova Compra"
        />
        
        <div className="overflow-x-auto min-h-[300px]">
          {loading ? (
             <div className="p-8 text-center text-muted-foreground">Carregando compras...</div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="text-xs text-muted-foreground bg-muted/40 border-b border-border">
                  <th className="text-left px-5 py-3 font-medium">OC #</th>
                  <th className="text-left px-4 py-3 font-medium">Fornecedor</th>
                  <th className="text-left px-4 py-3 font-medium">Data Emissão</th>
                  <th className="text-left px-4 py-3 font-medium">Valor Total</th>
                  <th className="text-left px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-10 text-muted-foreground">Nenhuma ordem de compra encontrada.</td></tr>
                ) : (
                  data.map((item: any) => (
                    <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-5 py-3.5 text-xs font-mono text-muted-foreground">{item.id}</td>
                      <td className="px-4 py-3.5 text-xs text-foreground font-medium">{item.fornecedor_nome}</td>
                      <td className="px-4 py-3.5 text-xs text-muted-foreground">{new Date(item.data_emissao).toLocaleDateString()}</td>
                      <td className="px-4 py-3.5 text-xs font-semibold text-foreground">{fmtFull(item.valor_total)}</td>
                      <td className="px-4 py-3.5">
                        <Badge 
                          variant={
                            item.status === "RASCUNHO" ? "neutral" : 
                            item.status === "AGUARDANDO_RECEBIMENTO" ? "warning" : 
                            item.status === "RECEBIDO" ? "success" : "danger"
                          }
                        >
                          {item.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3.5 flex items-center justify-end gap-2">
                        {item.status === "RASCUNHO" && (
                          <button onClick={() => handleAprovar(item.id)} title="Aprovar OC" className="p-1.5 rounded-md text-emerald-600 hover:bg-emerald-50 transition-colors">
                            <CheckCircle size={16} />
                          </button>
                        )}
                        {item.status === "AGUARDANDO_RECEBIMENTO" && (
                          <button onClick={() => handleReceber(item.id)} title="Registrar Recebimento (Estoque)" className="p-1.5 rounded-md text-blue-600 hover:bg-blue-50 transition-colors flex items-center gap-1">
                            <PackageCheck size={16} /> <span className="text-[10px] font-bold">RECEBER</span>
                          </button>
                        )}
                        <button title="Visualizar" className="p-1.5 rounded-md text-muted-foreground hover:bg-muted transition-colors">
                          <Eye size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

export default Compras;
