import React, { useState, useEffect } from "react";
import { api } from "../services/api";
import { Eye, Edit3, Trash2, Save } from "lucide-react";
import { Badge, Input, Select, Textarea, FormSection, Modal, TableToolbar, Pagination } from "../components/ui/SharedUI";
import { ESTADOS } from "../data/mockData"; // reaproveitando apenas a constante ESTADOS

export function FornecedorForm({ onClose, onSave }: { onClose: () => void; onSave: () => void }) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    nome_razao_social: "",
    nome_fantasia: "",
    cpf_cnpj: "",
    inscricao_estadual: "",
    tipo_pessoa: "JURIDICA",
    email: "",
    telefone: "",
    cep: "",
    endereco: "",
    numero: "",
    complemento: "",
    bairro: "",
    cidade: "",
    uf: "",
    observacoes: ""
  });

  const handleChange = (field: string, val: string) => setForm(f => ({ ...f, [field]: val }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...form,
        tipo_contato: "Fornecedor",
      };
      await api.post("/comercial/clientes", payload);
      onSave();
    } catch (err: any) {
      alert(err?.message || "Erro ao salvar fornecedor");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <FormSection title="Dados da Empresa">
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <Input label="Razão Social" required value={form.nome_razao_social} onChange={e => handleChange("nome_razao_social", e.target.value)} />
          </div>
          <Input label="Nome Fantasia" value={form.nome_fantasia} onChange={e => handleChange("nome_fantasia", e.target.value)} />
          <Input label="CNPJ/CPF" required value={form.cpf_cnpj} onChange={e => handleChange("cpf_cnpj", e.target.value)} />
          <Input label="Inscrição Estadual" value={form.inscricao_estadual} onChange={e => handleChange("inscricao_estadual", e.target.value)} />
          <Select label="Tipo Pessoa" value={form.tipo_pessoa} onChange={e => handleChange("tipo_pessoa", e.target.value)}>
            <option value="JURIDICA">Jurídica</option>
            <option value="FISICA">Física</option>
          </Select>
        </div>
      </FormSection>
      <FormSection title="Endereço">
        <div className="grid grid-cols-3 gap-3">
          <Input label="CEP" required value={form.cep} onChange={e => handleChange("cep", e.target.value)} />
          <div className="col-span-2">
            <Input label="Logradouro" required value={form.endereco} onChange={e => handleChange("endereco", e.target.value)} />
          </div>
          <Input label="Número" value={form.numero} onChange={e => handleChange("numero", e.target.value)} />
          <Input label="Complemento" value={form.complemento} onChange={e => handleChange("complemento", e.target.value)} />
          <Input label="Bairro" value={form.bairro} onChange={e => handleChange("bairro", e.target.value)} />
          <div className="col-span-2">
            <Input label="Cidade" required value={form.cidade} onChange={e => handleChange("cidade", e.target.value)} />
          </div>
          <Select label="UF" required value={form.uf} onChange={e => handleChange("uf", e.target.value)}>
            <option value="">UF</option>
            {ESTADOS.map((e) => <option key={e}>{e}</option>)}
          </Select>
        </div>
      </FormSection>
      <FormSection title="Contatos e Observações">
        <div className="grid grid-cols-2 gap-3">
          <Input label="E-mail" type="email" value={form.email} onChange={e => handleChange("email", e.target.value)} />
          <Input label="Telefone" value={form.telefone} onChange={e => handleChange("telefone", e.target.value)} />
        </div>
        <Textarea label="Observações" value={form.observacoes} onChange={e => handleChange("observacoes", e.target.value)} />
      </FormSection>
      <div className="flex justify-end gap-2 pt-2 border-t border-border">
        <button type="button" onClick={onClose} className="text-xs px-4 py-2 border border-border rounded-lg text-muted-foreground hover:bg-muted">Cancelar</button>
        <button type="submit" disabled={loading} className="text-xs px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 flex items-center gap-1 disabled:opacity-50">
          <Save size={12} /> {loading ? "Salvando..." : "Salvar fornecedor"}
        </button>
      </div>
    </form>
  );
}

export function Fornecedores() {
  const [modal, setModal] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  async function loadData() {
    try {
      setLoading(true);
      // Aqui usamos o endpoint de clientes e listamos todos
      // pois não há um query param nativo para "tipo_contato" na rota padrão
      // Entao filtramos no frontend:
      const res = await api.get<any[]>("/comercial/clientes?limit=2000");
      const fornecedores = res.filter(c => c.tipo_contato === "Fornecedor");
      setData(fornecedores);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const filtered = data.filter(c => 
    c.nome_razao_social?.toLowerCase().includes(search.toLowerCase()) || 
    c.cpf_cnpj?.includes(search)
  );

  const ITEMS_PER_PAGE = 20;
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  async function handleDelete(id: number) {
    if (!confirm("Tem certeza que deseja excluir este fornecedor?")) return;
    try {
      await api.delete(`/comercial/clientes/${id}`);
      loadData();
    } catch (err: any) {
      alert(err?.message || "Erro ao excluir fornecedor");
    }
  }

  return (
    <div className="space-y-4">
      <Modal open={modal} onClose={() => setModal(false)} title="Cadastrar Fornecedor" subtitle="Dados completos do fornecedor" wide>
        <FornecedorForm 
          onClose={() => setModal(false)} 
          onSave={() => { setModal(false); loadData(); }} 
        />
      </Modal>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <TableToolbar 
          title="Fornecedores" 
          count={filtered.length} 
          onNew={() => setModal(true)} 
          newLabel="Novo Fornecedor" 
          search={search}
          onSearch={(val) => { setSearch(val); setPage(1); }}
        />
        
        <div className="overflow-x-auto min-h-[300px]">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">Carregando fornecedores...</div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="text-xs text-muted-foreground bg-muted/40">
                  <th className="text-left px-5 py-3 font-medium">Cód</th>
                  <th className="text-left px-4 py-3 font-medium">Razão Social</th>
                  <th className="text-left px-4 py-3 font-medium hidden md:table-cell">CNPJ/CPF</th>
                  <th className="text-left px-4 py-3 font-medium hidden lg:table-cell">E-mail</th>
                  <th className="text-left px-4 py-3 font-medium hidden lg:table-cell">Cidade/UF</th>
                  <th className="text-left px-4 py-3 font-medium">Situação</th>
                  <th className="px-4 py-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {paginated.length === 0 ? (
                   <tr><td colSpan={7} className="text-center py-8 text-muted-foreground">Nenhum fornecedor encontrado.</td></tr>
                ) : (
                  paginated.map((f) => (
                    <tr key={f.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-5 py-3.5 text-xs font-mono text-muted-foreground">{f.id}</td>
                      <td className="px-4 py-3.5 text-xs font-medium text-foreground">{f.nome_razao_social}</td>
                      <td className="px-4 py-3.5 text-xs font-mono text-muted-foreground hidden md:table-cell">{f.cpf_cnpj}</td>
                      <td className="px-4 py-3.5 text-xs text-muted-foreground hidden lg:table-cell">{f.email}</td>
                      <td className="px-4 py-3.5 text-xs text-muted-foreground hidden lg:table-cell">{f.cidade}/{f.uf}</td>
                      <td className="px-4 py-3.5">
                        <Badge variant={f.situacao === "ATIVO" ? "success" : "neutral"}>{f.situacao}</Badge>
                      </td>
                      <td className="px-4 py-3.5 flex items-center justify-end gap-1">
                        <button onClick={() => handleDelete(f.id)} className="p-1.5 rounded-md hover:bg-red-500/10 text-red-500 transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
        {!loading && totalPages > 1 && (
          <Pagination total={filtered.length} shown={paginated.length} page={page} totalPages={totalPages} onPageChange={setPage} />
        )}
      </div>
    </div>
  );
}