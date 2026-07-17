import React, { useState, useEffect } from "react";
import { api } from "../services/api";
import {
  Search, Edit3, Trash2, Plus, X, Save, ArrowLeft, Filter, Download, Check
} from "lucide-react";
import { Badge, Modal, TableToolbar, Input, Select, Textarea } from "../components/ui/SharedUI";
import { useAuth } from "../hooks/useAuth";

// ── UF list ──────────────────────────────────────────────────────────────────
const UFS = ["AC","AL","AM","AP","BA","CE","DF","ES","GO","MA","MG","MS","MT","PA","PB","PE","PI","PR","RJ","RN","RO","RR","RS","SC","SE","SP","TO"];

// ── ClienteForm ───────────────────────────────────────────────────────────────
function ClienteForm({ onClose, onSave, initial }: { onClose: () => void; onSave: (d: any) => void; initial?: any }) {
  const [tab, setTab] = useState(0);
  const tabs = ["Dados Gerais", "Complementares", "Observações"];
  const [buscandoCep, setBuscandoCep] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    nome_razao_social: "",
    nome_fantasia: "",
    codigo_externo: "",
    tipo_pessoa: "JURIDICA",
    cpf_cnpj: "",
    contribuinte: "9 - Não Contribuinte, que pode ou não possuir IE",
    inscricao_estadual: "",
    inscricao_municipal: "",
    tipo_contato: "Cliente",
    cep: "",
    uf: "",
    cidade: "",
    endereco: "",
    numero: "",
    bairro: "",
    complemento: "",
    telefone: "",
    celular: "",
    email: "",
    codigo_regime_tributario: "",
    inscricao_suframa: "",
    data_nascimento: "",
    limite_credito: "",
    observacoes: "",
    representante_id: "",
    vendedor_padrao_id: "",
    id_lista_preco: "",
    ...initial
  });

  const [representantes, setRepresentantes] = useState<any[]>([]);
  useEffect(() => {
    api.get<any[]>("/comercial/representantes?include_inativos=false").then(setRepresentantes).catch(console.error);
  }, []);

  const set = (field: string, val: any) => setForm((f: any) => ({ ...f, [field]: val }));

  async function buscarCep() {
    const cep = form.cep.replace(/\D/g, "");
    if (cep.length !== 8) return;
    setBuscandoCep(true);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const d = await res.json();
      if (!d.erro) {
        setForm((f: any) => ({ ...f, endereco: d.logradouro || f.endereco, bairro: d.bairro || f.bairro, cidade: d.localidade || f.cidade, uf: d.uf || f.uf }));
      }
    } catch { /* silent */ } finally {
      setBuscandoCep(false);
    }
  }

  const [buscandoCnpj, setBuscandoCnpj] = useState(false);
  async function buscarCnpj() {
    const cnpj = form.cpf_cnpj.replace(/\D/g, "");
    if (cnpj.length !== 14) return;
    setBuscandoCnpj(true);
    try {
      const res = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpj}`);
      if (!res.ok) throw new Error();
      const d = await res.json();
      setForm((f: any) => ({
        ...f,
        nome_razao_social: d.razao_social || f.nome_razao_social,
        nome_fantasia: d.nome_fantasia || f.nome_fantasia,
        cep: d.cep || f.cep,
        endereco: d.logradouro || f.endereco,
        numero: d.numero || f.numero,
        bairro: d.bairro || f.bairro,
        cidade: d.municipio || f.cidade,
        uf: d.uf || f.uf,
        complemento: d.complemento || f.complemento,
        telefone: d.ddd_telefone_1 || f.telefone,
      }));
    } catch {
      alert("Não foi possível consultar este CNPJ.");
    } finally {
      setBuscandoCnpj(false);
    }
  }

  async function handleSubmit() {
    if (!form.nome_razao_social.trim()) { alert("Nome é obrigatório."); return; }
    setSaving(true);
    try {
      const payload = { ...form };
      if (payload.representante_id) {
        payload.representante_id = parseInt(payload.representante_id);
      } else {
        payload.representante_id = null;
      }
      if (payload.vendedor_padrao_id) {
        payload.vendedor_padrao_id = parseInt(payload.vendedor_padrao_id);
      } else {
        payload.vendedor_padrao_id = null;
      }
      if (payload.id_lista_preco) {
        payload.id_lista_preco = parseInt(payload.id_lista_preco);
      } else {
        payload.id_lista_preco = null;
      }
      if (payload.limite_credito === "") {
        payload.limite_credito = null;
      } else if (payload.limite_credito) {
        payload.limite_credito = parseInt(payload.limite_credito);
      }
      if (!payload.data_nascimento) payload.data_nascimento = null;
      await onSave(payload);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5">
      {/* Type toggle */}
      <div className="flex gap-2">
        {(["FISICA", "JURIDICA"] as const).map(t => (
          <button key={t} onClick={() => set("tipo_pessoa", t)}
            className={`px-4 py-1.5 text-xs font-medium rounded-lg border transition-colors ${form.tipo_pessoa === t ? "bg-primary text-white border-primary" : "border-border text-muted-foreground hover:bg-muted"}`}
          >
            {t === "FISICA" ? "Pessoa Física" : "Pessoa Jurídica"}
          </button>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-0 border-b border-border">
        {tabs.map((t, i) => (
          <button key={t} onClick={() => setTab(i)}
            className={`text-xs px-4 py-2 border-b-2 font-medium transition-colors ${tab === i ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
          >{t}</button>
        ))}
      </div>

      {tab === 0 && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <Input label={form.tipo_pessoa === "FISICA" ? "Nome *" : "Razão Social *"} required value={form.nome_razao_social} onChange={e => set("nome_razao_social", e.target.value)} placeholder={form.tipo_pessoa === "FISICA" ? "Nome completo" : "Razão social"} />
            </div>
            <div>
              <Input label="Nome Fantasia" value={form.nome_fantasia} onChange={e => set("nome_fantasia", e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5 text-muted-foreground">{form.tipo_pessoa === "JURIDICA" ? "CNPJ" : "CPF"}</label>
              <div className="flex gap-2">
                <input
                  className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                  value={form.cpf_cnpj} onChange={e => set("cpf_cnpj", e.target.value)} placeholder={form.tipo_pessoa === "JURIDICA" ? "00.000.000/0000-00" : "000.000.000-00"}
                />
                {form.tipo_pessoa === "JURIDICA" && (
                  <button type="button" onClick={buscarCnpj} disabled={buscandoCnpj} className="px-3 py-2 bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 rounded-lg whitespace-nowrap disabled:opacity-50">
                    {buscandoCnpj ? "..." : <Search size={16} />}
                  </button>
                )}
              </div>
            </div>
            <div>
              <Select label="Tipo de Contato" value={form.tipo_contato} onChange={e => set("tipo_contato", e.target.value)}>
                <option value="Cliente">Cliente</option>
                <option value="Fornecedor">Fornecedor</option>
                <option value="Transportador">Transportador</option>
                <option value="Entregador">Entregador</option>
                <option value="Cliente,Fornecedor">Cliente e Fornecedor</option>
                <option value="Outro">Outro</option>
              </Select>
            </div>
            <div>
              <Select label="Situação" value={form.situacao || "ATIVO"} onChange={e => set("situacao", e.target.value)}>
                <option value="ATIVO">Ativo</option>
                <option value="INATIVO">Inativo</option>
                <option value="BLOQUEADO">Bloqueado</option>
              </Select>
            </div>
            {form.tipo_pessoa === "JURIDICA" && (
              <>
                <div>
                  <Select label="Contribuinte ICMS" value={form.contribuinte} onChange={e => set("contribuinte", e.target.value)}>
                    <option value="9 - Não Contribuinte, que pode ou não possuir IE">9 - Não Contribuinte</option>
                    <option value="1 - Contribuinte ICMS">1 - Contribuinte ICMS</option>
                    <option value="2 - Contribuinte isento de IE">2 - Isento de IE</option>
                  </Select>
                </div>
                <div>
                  <Input label="Inscrição Estadual" value={form.inscricao_estadual} onChange={e => set("inscricao_estadual", e.target.value)} />
                </div>
                <div>
                  <Input label="Inscrição Municipal" value={form.inscricao_municipal} onChange={e => set("inscricao_municipal", e.target.value)} />
                </div>
              </>
            )}
            <div>
              <Input label="Telefone" type="tel" value={form.telefone} onChange={e => set("telefone", e.target.value)} placeholder="(00) 0000-0000" />
            </div>
            <div>
              <Input label="Celular / WhatsApp" type="tel" value={form.celular} onChange={e => set("celular", e.target.value)} placeholder="(00) 00000-0000" />
            </div>
            <div>
              <Input label="E-mail" type="email" value={form.email} onChange={e => set("email", e.target.value)} placeholder="contato@empresa.com" />
            </div>
            <div>
              <Select label="Vendedor Padrão" value={form.vendedor_padrao_id} onChange={e => set("vendedor_padrao_id", e.target.value)}>
                <option value="">Nenhum</option>
                {representantes.map(r => (
                  <option key={r.id} value={r.id}>{r.nome}</option>
                ))}
              </Select>
            </div>
            <div>
              <Select label="Lista de Preço" value={form.id_lista_preco} onChange={e => set("id_lista_preco", e.target.value)}>
                <option value="">Padrão</option>
                <option value="1">Atacado</option>
                <option value="2">Varejo Especial</option>
              </Select>
            </div>
          </div>

          {/* Endereço */}
          <div className="pt-4 border-t border-border">
            <h3 className="text-sm font-semibold mb-4">Endereço</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Input label="CEP" value={form.cep} onChange={e => set("cep", e.target.value)} onBlur={buscarCep} placeholder="00000-000" />
                {buscandoCep && <p className="text-xs text-primary mt-1">Buscando CEP...</p>}
              </div>
              <div className="md:col-span-2">
                <Input label="Logradouro" value={form.endereco} onChange={e => set("endereco", e.target.value)} />
              </div>
              <div>
                <Input label="Número" value={form.numero} onChange={e => set("numero", e.target.value)} />
              </div>
              <div>
                <Input label="Complemento" value={form.complemento} onChange={e => set("complemento", e.target.value)} />
              </div>
              <div>
                <Input label="Bairro" value={form.bairro} onChange={e => set("bairro", e.target.value)} />
              </div>
              <div className="md:col-span-2">
                <Input label="Cidade" value={form.cidade} onChange={e => set("cidade", e.target.value)} />
              </div>
              <div>
                <Select label="UF" value={form.uf} onChange={e => set("uf", e.target.value)}>
                  <option value="">Selecione</option>
                  {UFS.map(u => <option key={u} value={u}>{u}</option>)}
                </Select>
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === 1 && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {form.tipo_pessoa === "JURIDICA" && (
              <>
                <Select label="Regime Tributário" value={form.codigo_regime_tributario} onChange={e => set("codigo_regime_tributario", e.target.value)}>
                  <option value="">Não informado</option>
                  <option value="1">1 - Simples Nacional</option>
                  <option value="2">2 - Simples Nacional (excesso)</option>
                  <option value="3">3 - Regime Normal</option>
                </Select>
                <Input label="Inscrição Suframa" value={form.inscricao_suframa} onChange={e => set("inscricao_suframa", e.target.value)} />
              </>
            )}
            {form.tipo_pessoa === "FISICA" && (
              <Input label="Data de Nascimento" type="date" value={form.data_nascimento} onChange={e => set("data_nascimento", e.target.value)} />
            )}
            <Input label="Código Externo / ERP" value={form.codigo_externo} onChange={e => set("codigo_externo", e.target.value)} placeholder="Código de referência externo" />
            <div>
              <Input label="Limite de Crédito (R$)" type="number" step="0.01" value={form.limite_credito} onChange={e => set("limite_credito", e.target.value)} />
              <p className="text-xs text-muted-foreground mt-1">Deixe 0 para não limitar o crédito</p>
            </div>
          </div>
        </div>
      )}

      {tab === 2 && (
        <div>
          <Textarea label="Observações internas" value={form.observacoes} onChange={e => set("observacoes", e.target.value)} rows={6} placeholder="Anote informações relevantes sobre este contato..." />
        </div>
      )}

      {/* Footer */}
      <div className="flex justify-between pt-4 border-t border-border">
        <button onClick={onClose} className="text-xs px-4 py-2 border border-border rounded-lg text-muted-foreground hover:bg-muted">Cancelar</button>
        <div className="flex gap-2">
          {tab > 0 && <button onClick={() => setTab(tab - 1)} className="text-xs px-4 py-2 border border-border rounded-lg hover:bg-muted">← Anterior</button>}
          {tab < tabs.length - 1
            ? <button onClick={() => setTab(tab + 1)} className="text-xs px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90">Próximo →</button>
            : <button onClick={handleSubmit} disabled={saving} className="text-xs px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 flex items-center gap-1.5 disabled:opacity-50">
                <Save size={13} /> {saving ? "Salvando..." : "Salvar"}
              </button>
          }
        </div>
      </div>
    </div>
  );
}

// ── Clientes (listagem) ───────────────────────────────────────────────────────
export function Clientes() {
  const { can } = useAuth();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<"new" | any | null>(null); // null = fechado, "new" = novo, obj = editar
  const [viewModal, setViewModal] = useState<any | null>(null);
  const [filterTipo, setFilterTipo] = useState("todos");
  const [search, setSearch] = useState("");

  // Filter modal states
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filterUF, setFilterUF] = useState("");
  const [filterSituacao, setFilterSituacao] = useState("");
  const hasActiveFilters = !!(filterUF || filterSituacao);

  async function loadData() {
    setLoading(true);
    try {
      const res = await api.get<any[]>("/comercial/clientes?limit=500");
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadData(); }, []);

  async function handleSave(formData: any) {
    try {
      if (modal && modal !== "new" && modal.id) {
        await api.put(`/comercial/clientes/${modal.id}`, formData);
      } else {
        await api.post("/comercial/clientes", formData);
      }
      setModal(null);
      loadData();
    } catch (err: any) {
      alert(err.message || "Erro ao salvar contato.");
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Excluir este contato? Esta ação não pode ser desfeita.")) return;
    try {
      await api.delete(`/comercial/clientes/${id}`);
      loadData();
    } catch (err: any) {
      alert(err.message || "Erro ao excluir contato.");
    }
  }

  function exportCSV() {
    if (filteredData.length === 0) { alert("Nenhum dado para exportar."); return; }
    const headers = ["ID", "Nome", "Tipo", "CPF/CNPJ", "E-mail", "Telefone", "Cidade", "UF", "Situação"];
    const rows = filteredData.map(c => [
      c.id, `"${c.nome_razao_social || ''}"`, c.tipo_contato || "Cliente",
      c.cpf_cnpj, c.email || "", c.telefone || "",
      c.cidade || "", c.uf || "", c.situacao || ""
    ]);
    const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "contatos.csv";
    link.click();
  }

  const tipoTabs = [
    { label: "Todos", value: "todos" },
    { label: "Clientes", value: "Cliente" },
    { label: "Fornecedores", value: "Fornecedor" },
    { label: "Transportadores", value: "Transportador" },
    { label: "Entregadores", value: "Entregador" },
  ];

  const filteredData = data.filter(c => {
    const passSearch = !search || (
      (c.nome_razao_social?.toLowerCase() || "").includes(search.toLowerCase()) ||
      (c.nome_fantasia?.toLowerCase() || "").includes(search.toLowerCase()) ||
      (c.cpf_cnpj || "").replace(/\D/g, "").includes(search.replace(/\D/g, "")) ||
      (c.email?.toLowerCase() || "").includes(search.toLowerCase()) ||
      (c.telefone || "").includes(search)
    );
    const passTipo = filterTipo === "todos" || (c.tipo_contato || "Cliente").includes(filterTipo);
    const passUF = !filterUF || c.uf === filterUF;
    const passSit = !filterSituacao || c.situacao === filterSituacao;
    return passSearch && passTipo && passUF && passSit;
  });

  const stats = {
    total: data.length,
    clientes: data.filter(c => (c.tipo_contato || "").includes("Cliente")).length,
    fornecedores: data.filter(c => (c.tipo_contato || "").includes("Fornecedor")).length,
    ativos: data.filter(c => c.situacao === "ATIVO").length,
  };

  const situacaoVariant: Record<string, any> = {
    ATIVO: "success", INATIVO: "neutral", BLOQUEADO: "danger"
  };

  return (
    <div className="space-y-4">
      {/* Modal cadastro / edição */}
      <Modal
        open={!!modal}
        onClose={() => setModal(null)}
        title={modal && modal !== "new" ? "Editar Contato" : "Novo Contato"}
        subtitle="Preencha os dados do contato"
        wide
      >
        <ClienteForm
          onClose={() => setModal(null)}
          onSave={handleSave}
          initial={modal && modal !== "new" ? modal : undefined}
        />
      </Modal>

      {/* Modal de Visualização */}
      <Modal
        open={!!viewModal}
        onClose={() => setViewModal(null)}
        title="Detalhes do Contato"
      >
        {viewModal && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-muted-foreground">Nome:</span> <p className="font-medium">{viewModal.nome_razao_social}</p></div>
              <div><span className="text-muted-foreground">CPF/CNPJ:</span> <p className="font-medium">{viewModal.cpf_cnpj || "—"}</p></div>
              <div><span className="text-muted-foreground">E-mail:</span> <p className="font-medium">{viewModal.email || "—"}</p></div>
              <div><span className="text-muted-foreground">Telefone:</span> <p className="font-medium">{viewModal.telefone || "—"}</p></div>
              <div><span className="text-muted-foreground">Cidade/UF:</span> <p className="font-medium">{viewModal.cidade ? `${viewModal.cidade} / ${viewModal.uf}` : "—"}</p></div>
              <div><span className="text-muted-foreground">Tipo:</span> <p className="font-medium">{viewModal.tipo_contato || "Cliente"}</p></div>
              <div><span className="text-muted-foreground">Situação:</span> <p className="font-medium">{viewModal.situacao || "ATIVO"}</p></div>
            </div>
            <div className="flex justify-end gap-2 pt-4 border-t border-border mt-6">
              <button onClick={() => setViewModal(null)} className="text-xs px-4 py-2 border border-border rounded-lg text-muted-foreground hover:bg-muted">Fechar</button>
              {can("cadastros", "delete") && (
                <button onClick={() => { handleDelete(viewModal.id); setViewModal(null); }} className="text-xs px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 flex items-center gap-1.5">
                  <Trash2 size={13} /> Excluir
                </button>
              )}
              {can("cadastros", "edit") && (
                <button onClick={() => { setModal(viewModal); setViewModal(null); }} className="text-xs px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 flex items-center gap-1.5">
                  <Edit3 size={13} /> Editar
                </button>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Filter Modal */}
      <Modal title="Filtros Avançados" open={showFilterModal} onClose={() => setShowFilterModal(false)}>
        <div className="space-y-4">
          <Select label="Estado (UF)" value={filterUF} onChange={e => setFilterUF(e.target.value)}>
            <option value="">Todos</option>
            {UFS.map(u => <option key={u} value={u}>{u}</option>)}
          </Select>
          <Select label="Situação" value={filterSituacao} onChange={e => setFilterSituacao(e.target.value)}>
            <option value="">Todas</option>
            <option value="ATIVO">Ativo</option>
            <option value="INATIVO">Inativo</option>
            <option value="BLOQUEADO">Bloqueado</option>
          </Select>
          <div className="pt-4 flex justify-end gap-2 border-t border-border">
            <button onClick={() => { setFilterUF(""); setFilterSituacao(""); }} className="text-xs px-4 py-2 border border-border rounded-lg text-muted-foreground hover:bg-muted">Limpar</button>
            <button onClick={() => setShowFilterModal(false)} className="text-xs px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90">Aplicar</button>
          </div>
        </div>
      </Modal>

      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total de Contatos", value: stats.total, color: "text-foreground" },
          { label: "Clientes", value: stats.clientes, color: "text-primary" },
          { label: "Fornecedores", value: stats.fornecedores, color: "text-blue-600" },
          { label: "Ativos", value: stats.ativos, color: "text-emerald-600" },
        ].map(s => (
          <div key={s.label} className="bg-card rounded-xl p-4 border border-border shadow-sm">
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className={`text-2xl font-bold mt-1 ${s.color}`} style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Main table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm">
        <TableToolbar
          title="Clientes e Fornecedores"
          count={filteredData.length}
          onNew={can("cadastros", "create") ? () => setModal("new") : undefined}
          newLabel="Novo Contato"
          search={search}
          onSearch={setSearch}
          onFilterClick={() => setShowFilterModal(true)}
          onExportClick={exportCSV}
          hasActiveFilters={hasActiveFilters}
        />

        {/* Tipo tabs */}
        <div className="px-5 pt-3 pb-0 flex gap-1.5 border-b border-border overflow-x-auto">
          {tipoTabs.map(t => {
            const count = data.filter(c => t.value === "todos" || (c.tipo_contato || "Cliente").includes(t.value)).length;
            return (
              <button
                key={t.value}
                onClick={() => setFilterTipo(t.value)}
                className={`text-xs px-4 py-2 rounded-t-lg font-semibold whitespace-nowrap transition-colors flex flex-col items-center gap-0.5 min-w-[90px] ${
                  filterTipo === t.value
                    ? "border-b-2 border-primary text-primary bg-primary/5"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                <span>{t.label}</span>
                <span className={`text-[10px] font-bold ${filterTipo === t.value ? "text-primary" : "text-muted-foreground"}`}>{count}</span>
              </button>
            );
          })}
        </div>

        <div className="overflow-x-auto min-h-[300px]">
          {loading ? (
            <div className="p-12 text-center text-muted-foreground text-sm">Carregando contatos...</div>
          ) : filteredData.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-muted-foreground text-sm">Nenhum contato encontrado.</p>
              {can("cadastros", "create") && (
                <button onClick={() => setModal("new")} className="mt-4 text-xs px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 flex items-center gap-1.5 mx-auto">
                  <Plus size={13} /> Cadastrar primeiro contato
                </button>
              )}
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="text-xs text-muted-foreground bg-muted/40 border-b border-border">
                  <th className="text-left px-5 py-3 font-semibold">Nome / Razão Social</th>
                  <th className="text-left px-4 py-3 font-semibold hidden md:table-cell">CPF / CNPJ</th>
                  <th className="text-left px-4 py-3 font-semibold hidden lg:table-cell">E-mail / Telefone</th>
                  <th className="text-left px-4 py-3 font-semibold hidden lg:table-cell">Cidade / UF</th>
                  <th className="text-left px-4 py-3 font-semibold">Tipo</th>
                  <th className="text-left px-4 py-3 font-semibold">Situação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredData.map(c => (
                  <tr key={c.id} onClick={() => setViewModal(c)} className="hover:bg-muted/30 transition-colors group cursor-pointer">
                    <td className="px-5 py-3.5">
                      <p className="text-xs font-semibold text-foreground">{c.nome_razao_social}</p>
                      {c.nome_fantasia && <p className="text-[10px] text-muted-foreground">{c.nome_fantasia}</p>}
                    </td>
                    <td className="px-4 py-3.5 text-xs font-mono text-muted-foreground hidden md:table-cell">{c.cpf_cnpj || "—"}</td>
                    <td className="px-4 py-3.5 hidden lg:table-cell">
                      {c.email && <p className="text-xs text-muted-foreground">{c.email}</p>}
                      {c.telefone && <p className="text-[10px] text-muted-foreground">{c.telefone}</p>}
                    </td>
                    <td className="px-4 py-3.5 text-xs text-muted-foreground hidden lg:table-cell">
                      {c.cidade ? `${c.cidade} / ${c.uf}` : "—"}
                    </td>
                    <td className="px-4 py-3.5">
                      <Badge variant="default">{c.tipo_contato || "Cliente"}</Badge>
                    </td>
                    <td className="px-4 py-3.5">
                      <Badge variant={situacaoVariant[c.situacao] ?? "neutral"}>{c.situacao || "ATIVO"}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

export default Clientes;
