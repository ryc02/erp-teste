import React, { useState, useEffect } from "react";
import { api } from "../services/api";
import { Modal, TableToolbar, Input, Select, Pagination, Badge } from "../components/ui/SharedUI";
import { Trash2, Edit3, Save } from "lucide-react";

export function RepresentantesForm({ onClose, onSave, initial }: { onClose: () => void; onSave: () => void; initial?: any }) {
  const [form, setForm] = useState({
    codigo: "",
    nome: "",
    fantasia: "",
    tipo_pessoa: "Jurídica",
    cpf_cnpj: "",
    contribuinte: "Não informado",
    inscricao_estadual: "",
    cep: "",
    cidade: "",
    uf: "",
    endereco: "",
    bairro: "",
    numero: "",
    complemento: "",
    telefone: "",
    celular: "",
    email: "",
    comissao_padrao: 0,
    ...initial,
    ativo: initial ? String(initial.ativo) : "true"
  });
  const [loading, setLoading] = useState(false);
  const [buscandoCep, setBuscandoCep] = useState(false);
  
  const [feedbackModal, setFeedbackModal] = useState<{ open: boolean; type: "success" | "error" | "warning"; title: string; message: string }>({ open: false, type: "success", title: "", message: "" });

  const set = (field: string, val: any) => setForm((f: any) => ({ ...f, [field]: val }));

  async function buscarCep() {
    const cepNum = form.cep.replace(/\D/g, "");
    if (cepNum.length === 8) {
      setBuscandoCep(true);
      try {
        const res = await fetch(`https://viacep.com.br/ws/${cepNum}/json/`);
        const data = await res.json();
        if (!data.erro) {
          set("endereco", data.logradouro || form.endereco);
          set("bairro", data.bairro || form.bairro);
          set("cidade", data.localidade || form.cidade);
          set("uf", data.uf || form.uf);
        }
      } catch (e) {
        console.error("Erro ao buscar CEP", e);
      } finally {
        setBuscandoCep(false);
      }
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.nome) { setFeedbackModal({ open: true, type: "warning", title: "Atenção", message: "Preencha o nome do vendedor" }); return; }
    
    setLoading(true);
    try {
      const payload = {
        ...form,
        codigo: form.codigo ? String(form.codigo) : null,
        ativo: form.ativo === "true"
      };

      if (initial?.id) {
        await api.put(`/comercial/representantes/${initial.id}`, payload);
      } else {
        await api.post("/comercial/representantes", payload);
      }
      setFeedbackModal({ open: true, type: "success", title: "Sucesso", message: "Representante salvo com sucesso!" });
      setTimeout(() => {
          onSave();
      }, 1500); // Aguarda para fechar após o feedback
    } catch (err: any) {
      setFeedbackModal({ open: true, type: "error", title: "Erro", message: err.response?.data?.detail || err?.message || "Erro ao salvar vendedor/representante" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      
      {/* 1. Identificação */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold border-b border-border pb-2">Identificação</h3>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-4">
            <Input label="Nome Completo *" required value={form.nome} onChange={e => set("nome", e.target.value)} placeholder="Nome completo do vendedor" />
          </div>
          <div className="md:col-span-4">
            <Input label="Fantasia / Apelido" value={form.fantasia} onChange={e => set("fantasia", e.target.value)} placeholder="Nome de fantasia ou apelido" />
          </div>
          <div className="md:col-span-2">
            <Input label="Código (Opcional)" value={form.codigo} onChange={e => set("codigo", e.target.value)} placeholder="Ex: 101" />
          </div>
          <div className="md:col-span-2">
            <Select label="Status" value={form.ativo} onChange={e => set("ativo", e.target.value)}>
              <option value="true">Ativo</option>
              <option value="false">Inativo</option>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Select label="Tipo de Pessoa" value={form.tipo_pessoa} onChange={e => set("tipo_pessoa", e.target.value)}>
            <option value="Física">Física</option>
            <option value="Jurídica">Jurídica</option>
          </Select>
          <Input label="CPF / CNPJ" value={form.cpf_cnpj} onChange={e => set("cpf_cnpj", e.target.value)} />
          <Select label="Contribuinte" value={form.contribuinte} onChange={e => set("contribuinte", e.target.value)}>
            <option value="Não informado">Não informado</option>
            <option value="Contribuinte ICMS">Contribuinte ICMS</option>
            <option value="Isento de IE">Isento de IE</option>
          </Select>
          <Input label="Inscrição Estadual" value={form.inscricao_estadual} onChange={e => set("inscricao_estadual", e.target.value)} />
        </div>
      </div>

      {/* 2. Endereço */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold border-b border-border pb-2">Endereço</h3>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-3 relative">
            <Input label="CEP" value={form.cep} onChange={e => set("cep", e.target.value)} onBlur={buscarCep} placeholder="00000-000" />
            {buscandoCep && <p className="text-[10px] text-primary mt-1 absolute">Buscando...</p>}
          </div>
          <div className="md:col-span-6">
            <Input label="Endereço / Logradouro" value={form.endereco} onChange={e => set("endereco", e.target.value)} />
          </div>
          <div className="md:col-span-3">
            <Input label="Número" value={form.numero} onChange={e => set("numero", e.target.value)} />
          </div>

          <div className="md:col-span-4">
            <Input label="Complemento" value={form.complemento} onChange={e => set("complemento", e.target.value)} />
          </div>
          <div className="md:col-span-3">
            <Input label="Bairro" value={form.bairro} onChange={e => set("bairro", e.target.value)} />
          </div>
          <div className="md:col-span-3">
            <Input label="Cidade" value={form.cidade} onChange={e => set("cidade", e.target.value)} />
          </div>
          <div className="md:col-span-2">
            <Select label="UF" value={form.uf} onChange={e => set("uf", e.target.value)}>
              <option value="">Selecione</option>
              {["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"].map(uf => (
                <option key={uf} value={uf}>{uf}</option>
              ))}
            </Select>
          </div>
        </div>
      </div>

      {/* 3. Contato */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold border-b border-border pb-2">Contato</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input label="Telefone" value={form.telefone} onChange={e => set("telefone", e.target.value)} placeholder="(00) 0000-0000" />
          <Input label="Celular / WhatsApp" value={form.celular} onChange={e => set("celular", e.target.value)} placeholder="(00) 00000-0000" />
          <Input label="E-mail" type="email" value={form.email} onChange={e => set("email", e.target.value)} placeholder="vendedor@empresa.com" />
        </div>
      </div>

      {/* 4. Comissão */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold border-b border-border pb-2">Comissão</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <Input
              label="% Comissão Padrão"
              type="number"
              min={0}
              max={100}
              step={0.01}
              value={form.comissao_padrao}
              onChange={e => set("comissao_padrao", parseFloat(e.target.value) || 0)}
              placeholder="Ex: 5"
            />
            <p className="text-[10px] text-muted-foreground mt-1">Percentual aplicado automaticamente nas vendas deste representante.</p>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4 border-t border-border mt-6">
        <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-muted-foreground hover:bg-muted rounded-lg border border-border">Cancelar</button>
        <button type="submit" disabled={loading} className="px-4 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary/90 flex items-center gap-1">
          <Save size={14} /> {loading ? "Salvando..." : "Salvar Vendedor"}
        </button>
      </div>

      <Modal title={feedbackModal.title} open={feedbackModal.open} onClose={() => setFeedbackModal({ ...feedbackModal, open: false })}>
        <div className="flex items-start gap-4">
            <div className={`mt-1 p-2 rounded-full flex-shrink-0 ${feedbackModal.type === 'error' ? 'bg-red-100 text-red-600' : feedbackModal.type === 'warning' ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'}`}>
                <div className="w-6 h-6 flex items-center justify-center font-bold text-lg">{feedbackModal.type === 'success' ? '✓' : '!'}</div>
            </div>
            <div>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">{feedbackModal.message}</p>
            </div>
        </div>
        <div className="mt-6 flex justify-end">
            <button 
                type="button"
                onClick={() => setFeedbackModal({ ...feedbackModal, open: false })}
                className={`px-6 py-2 rounded-lg text-sm font-medium text-white shadow-sm transition-colors ${feedbackModal.type === 'error' ? 'bg-red-600 hover:bg-red-700' : feedbackModal.type === 'warning' ? 'bg-amber-600 hover:bg-amber-700' : 'bg-emerald-600 hover:bg-emerald-700'}`}
            >
                Entendido
            </button>
        </div>
      </Modal>
    </form>
  );
}

export function Representantes() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  async function loadData() {
    setLoading(true);
    try {
      const res = await api.get<any[]>("/comercial/representantes?include_inativos=true");
      setData(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const filtered = data.filter(r => 
    r.nome?.toLowerCase().includes(search.toLowerCase()) || 
    r.codigo?.toString().includes(search)
  );

  const ITEMS_PER_PAGE = 20;
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  return (
    <div className="space-y-4">
      <Modal open={modal} onClose={() => { setModal(false); setEditingItem(null); }} title={editingItem ? "Editar Vendedor" : "Novo Vendedor"} subtitle="Vendedores e Representantes Comerciais">
        <RepresentantesForm 
          initial={editingItem}
          onClose={() => { setModal(false); setEditingItem(null); }} 
          onSave={() => { setModal(false); setEditingItem(null); loadData(); }} 
        />
      </Modal>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <TableToolbar 
          title="Vendedores / Representantes" 
          count={filtered.length} 
          search={search}
          onSearch={val => { setSearch(val); setPage(1); }}
          onNew={() => { setEditingItem(null); setModal(true); }}
          newLabel="Novo Vendedor"
        />

        <div className="overflow-x-auto min-h-[300px]">
          {loading ? (
             <div className="p-8 text-center text-muted-foreground">Carregando vendedores...</div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="text-xs text-muted-foreground bg-muted/40">
                  <th className="text-left px-5 py-3 font-medium">Código</th>
                  <th className="text-left px-4 py-3 font-medium">Nome</th>
                  <th className="text-left px-4 py-3 font-medium hidden md:table-cell">% Comissão</th>
                  <th className="text-left px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {paginated.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-8 text-muted-foreground">Nenhum vendedor cadastrado.</td></tr>
                ) : (
                  paginated.map(r => (
                    <tr key={r.id} className="hover:bg-muted/30">
                      <td className="px-5 py-3.5 text-xs font-mono text-muted-foreground">{r.codigo}</td>
                      <td className="px-4 py-3.5 text-xs font-medium text-foreground">{r.nome}</td>
                      <td className="px-4 py-3.5 text-xs font-semibold hidden md:table-cell">
                        {r.comissao_padrao ? `${r.comissao_padrao}%` : <span className="text-muted-foreground">—</span>}
                      </td>
                      <td className="px-4 py-3.5 text-xs">
                        <Badge variant={r.ativo ? "success" : "neutral"}>{r.ativo ? "Ativo" : "Inativo"}</Badge>
                      </td>
                      <td className="px-4 py-3.5 flex items-center justify-end gap-2">
                        <button onClick={() => { setEditingItem(r); setModal(true); }} className="p-1.5 rounded-md hover:bg-muted text-muted-foreground transition-colors">
                          <Edit3 size={16} />
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

export default Representantes;
