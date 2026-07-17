import React, { useState, useEffect } from "react";
import { api } from "../services/api";
import { Modal, Select } from "../components/ui/SharedUI";
import { ShoppingCart } from "lucide-react";

export function SugestaoComprasModal({ open, onClose, produtos }: { open: boolean, onClose: () => void, produtos: any[] }) {
  const [fornecedores, setFornecedores] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // State to hold selected fornecedor for each product ID
  const [fornecedorMap, setFornecedorMap] = useState<Record<number, string>>({});

  useEffect(() => {
    if (open) {
      loadFornecedores();
    }
  }, [open]);

  async function loadFornecedores() {
    setLoading(true);
    try {
      const res = await api.get<any[]>("/comercial/clientes?tipo_contato=Fornecedor");
      setFornecedores(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  // Filter only products that need purchasing AND are purchased (not manufactured)
  const needsPurchase = produtos.filter(p => p.estoque_atual < p.estoque_minimo && p.tipo_produto !== "FABRICADO");

  async function handleGerar(e: React.FormEvent) {
    e.preventDefault();
    
    // Validate if all items have a supplier
    const unassigned = needsPurchase.find(p => !fornecedorMap[p.id]);
    if (unassigned) {
      alert(`Selecione um fornecedor para o produto: ${unassigned.nome}`);
      return;
    }

    setSaving(true);
    try {
      // Group items by Fornecedor
      const grouped: Record<string, any[]> = {};
      
      for (const p of needsPurchase) {
        const fornId = fornecedorMap[p.id];
        if (!grouped[fornId]) {
          grouped[fornId] = [];
        }
        
        const qtdeSugerida = (p.estoque_minimo - p.estoque_atual) > 0 ? (p.estoque_minimo - p.estoque_atual) : 1;
        
        grouped[fornId].push({
          produto_id: p.id,
          quantidade: qtdeSugerida,
          preco_unitario: p.custo || 0
        });
      }

      // Generate a Purchase Order for each group
      for (const fornId in grouped) {
        const forn = fornecedores.find(f => f.id === parseInt(fornId));
        if (!forn) continue;

        await api.post("/compras/ordens", {
          fornecedor_id: forn.id,
          fornecedor_nome: forn.nome_razao_social || forn.nome_fantasia,
          itens: grouped[fornId],
          status: "RASCUNHO",
          observacoes: "Gerado automaticamente pela rotina de Suprimentos (Estoque Mínimo)"
        });
      }

      alert("Ordens de Compra geradas com sucesso! Verifique a tela de Compras.");
      onClose();
    } catch (err: any) {
      alert(err?.message || "Erro ao gerar ordens de compra");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Necessidade de Compras" subtitle="Sugestão baseada no Estoque Mínimo">
      {needsPurchase.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          Nenhum produto está abaixo do estoque mínimo.
        </div>
      ) : (
        <form onSubmit={handleGerar} className="space-y-4">
          <div className="max-h-[60vh] overflow-y-auto pr-2">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 sticky top-0">
                <tr>
                  <th className="text-left px-3 py-2">Produto</th>
                  <th className="text-center px-3 py-2">Atual</th>
                  <th className="text-center px-3 py-2">Mín.</th>
                  <th className="text-center px-3 py-2 text-primary font-bold">Comprar</th>
                  <th className="text-left px-3 py-2 w-1/3">Fornecedor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {needsPurchase.map(p => {
                  const qtde = p.estoque_minimo - p.estoque_atual;
                  return (
                    <tr key={p.id}>
                      <td className="px-3 py-3 font-medium">
                        <div className="text-xs text-muted-foreground">{p.sku}</div>
                        <div>{p.nome}</div>
                      </td>
                      <td className="px-3 py-3 text-center text-red-600 font-bold">{p.estoque_atual}</td>
                      <td className="px-3 py-3 text-center">{p.estoque_minimo}</td>
                      <td className="px-3 py-3 text-center text-primary font-bold text-base">{qtde}</td>
                      <td className="px-3 py-3">
                        <select 
                          className="w-full bg-background border border-input rounded-md px-2 py-1.5 text-xs"
                          value={fornecedorMap[p.id] || ""}
                          onChange={e => setFornecedorMap({...fornecedorMap, [p.id]: e.target.value})}
                          required
                        >
                          <option value="">Selecione...</option>
                          {fornecedores.map(f => (
                            <option key={f.id} value={f.id}>{f.nome_fantasia || f.nome_razao_social}</option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          
          <div className="flex justify-end gap-2 pt-4 border-t">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm border rounded-lg text-muted-foreground hover:bg-muted">Cancelar</button>
            <button type="submit" disabled={saving || loading} className="flex items-center gap-2 px-4 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary/90">
              <ShoppingCart size={15} />
              {saving ? "Gerando..." : "Gerar Ordens de Compra"}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}
