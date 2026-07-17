import os

clientes_path = r"d:\ERP Venner\frontend_react\src\app\screens\Clientes.tsx"

with open(clientes_path, "r", encoding="utf-8") as f:
    clientes_code = f.read()

import_api_str = 'import { api } from "../services/api";\nimport { useEffect } from "react";'
if "from \"../services/api\"" not in clientes_code:
    clientes_code = clientes_code.replace('import React, { useState } from "react";', 'import React, { useState, useEffect } from "react";\nimport { api } from "../services/api";')

clientes_comp_start = clientes_code.find("export function Clientes() {")
clientes_comp_end = len(clientes_code)

clientes_new = """export function Clientes() {
  const [modal, setModal] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadData() {
    try {
      const res = await api.get<any[]>("/comercial/clientes?limit=100");
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

  async function handleSave(formData: any) {
    try {
      await api.post("/comercial/clientes", formData);
      setModal(false);
      loadData();
    } catch (err) {
      alert("Erro ao salvar cliente");
    }
  }

  return (
    <div className="space-y-4">
      <Modal open={modal} onClose={() => setModal(false)} title="Cadastrar Cliente" subtitle="Preencha os dados do cliente" wide>
        <ClienteForm onClose={() => setModal(false)} onSave={handleSave} />
      </Modal>
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-card rounded-xl p-4 border border-border"><p className="text-xs text-muted-foreground">Total de clientes</p><p className="text-2xl font-bold mt-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{data.length}</p></div>
        <div className="bg-card rounded-xl p-4 border border-border"><p className="text-xs text-muted-foreground">Ativos</p><p className="text-2xl font-bold text-emerald-600 mt-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{data.filter(c => c.situacao === 'ATIVO').length}</p></div>
        <div className="bg-card rounded-xl p-4 border border-border"><p className="text-xs text-muted-foreground">Novos (30 dias)</p><p className="text-2xl font-bold text-blue-600 mt-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>-</p></div>
      </div>
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <TableToolbar title="Cadastro de Clientes" count={data.length} onNew={() => setModal(true)} newLabel="Novo Cliente" />
        <div className="overflow-x-auto min-h-[300px]">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">Carregando clientes...</div>
          ) : (
            <table className="w-full">
              <thead><tr className="text-xs text-muted-foreground bg-muted/40 border-b border-border">
                <th className="text-left px-5 py-3 font-medium">Código</th>
                <th className="text-left px-4 py-3 font-medium">Nome / Razão Social</th>
                <th className="text-left px-4 py-3 font-medium hidden md:table-cell">CPF / CNPJ</th>
                <th className="text-left px-4 py-3 font-medium hidden lg:table-cell">E-mail</th>
                <th className="text-left px-4 py-3 font-medium hidden lg:table-cell">Cidade/UF</th>
                <th className="text-left px-4 py-3 font-medium">Situação</th>
                <th className="px-4 py-3"></th>
              </tr></thead>
              <tbody className="divide-y divide-border">
                {data.map((c) => (
                  <tr key={c.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-3.5 text-xs font-mono text-muted-foreground">{c.id}</td>
                    <td className="px-4 py-3.5">
                      <p className="text-xs font-medium text-foreground">{c.nome_razao_social}</p>
                      <Badge variant="neutral">{c.tipo_pessoa}</Badge>
                    </td>
                    <td className="px-4 py-3.5 text-xs font-mono text-muted-foreground hidden md:table-cell">{c.cpf_cnpj}</td>
                    <td className="px-4 py-3.5 text-xs text-muted-foreground hidden lg:table-cell">{c.email}</td>
                    <td className="px-4 py-3.5 text-xs text-muted-foreground hidden lg:table-cell">{c.cidade}/{c.uf}</td>
                    <td className="px-4 py-3.5"><Badge variant={c.situacao === "ATIVO" ? "success" : "neutral"}>{c.situacao}</Badge></td>
                    <td className="px-4 py-3.5 flex items-center justify-end gap-1">
                      <button className="p-1.5 rounded-md hover:bg-muted text-muted-foreground"><Edit3 size={14} /></button>
                      <button onClick={async () => {
                          if (confirm('Excluir?')) {
                            await api.delete(`/comercial/clientes/${c.id}`);
                            loadData();
                          }
                      }} className="p-1.5 rounded-md hover:bg-red-500/10 text-red-500"><Trash2 size={14} /></button>
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
"""

clientes_code = clientes_code[:clientes_comp_start] + clientes_new

form_start = clientes_code.find("export function ClienteForm")
form_end = clientes_code.find("export function Clientes")

cliente_form = """export function ClienteForm({ onClose, onSave }: { onClose: () => void, onSave: (d: any) => void }) {
  const [tipo, setTipo] = useState<"PF" | "PJ">("PF");
  const [tab, setTab] = useState(0);
  const tabs = ["Dados Gerais", "Endereço", "Contatos", "Financeiro"];
  
  const [form, setForm] = useState({
    nome_razao_social: "", cpf_cnpj: "", tipo_pessoa: "FISICA",
    email: "", telefone: "", cep: "", cidade: "", uf: "", endereco: ""
  });

  const handleChange = (field: string, val: any) => setForm(f => ({ ...f, [field]: val }));
  
  const handleToggleTipo = (t: "PF" | "PJ") => {
      setTipo(t);
      handleChange("tipo_pessoa", t === "PF" ? "FISICA" : "JURIDICA");
  };

  return (
    <div className="space-y-5">
      <div className="flex gap-2">
        {(["PF", "PJ"] as const).map((t) => (
          <button key={t} onClick={() => handleToggleTipo(t)} className={`px-4 py-1.5 text-xs font-medium rounded-lg border transition-colors ${tipo === t ? "bg-primary text-white border-primary" : "border-border text-muted-foreground hover:bg-muted"}`}>
            {t === "PF" ? "Pessoa Física" : "Pessoa Jurídica"}
          </button>
        ))}
      </div>
      <div className="flex gap-0 border-b border-border">
        {tabs.map((t, i) => (
          <button key={t} onClick={() => setTab(i)} className={`text-xs px-4 py-2 border-b-2 font-medium transition-colors ${tab === i ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>{t}</button>
        ))}
      </div>
      {tab === 0 && (
        <div className="space-y-4">
          <FormSection title="Identificação">
            <div className="grid grid-cols-2 gap-3">
              {tipo === "PJ" ? (
                <>
                  <div className="col-span-2"><Input label="Razão Social" required value={form.nome_razao_social} onChange={e => handleChange("nome_razao_social", e.target.value)} /></div>
                  <Input label="CNPJ" required value={form.cpf_cnpj} onChange={e => handleChange("cpf_cnpj", e.target.value)} />
                </>
              ) : (
                <>
                  <div className="col-span-2"><Input label="Nome completo" required value={form.nome_razao_social} onChange={e => handleChange("nome_razao_social", e.target.value)} /></div>
                  <Input label="CPF" required value={form.cpf_cnpj} onChange={e => handleChange("cpf_cnpj", e.target.value)} />
                </>
              )}
            </div>
          </FormSection>
        </div>
      )}
      {tab === 1 && (
        <div className="space-y-4">
          <FormSection title="Endereço Principal">
            <div className="grid grid-cols-2 gap-3">
              <Input label="CEP" value={form.cep} onChange={e => handleChange("cep", e.target.value)} />
              <div className="col-span-2"><Input label="Logradouro" value={form.endereco} onChange={e => handleChange("endereco", e.target.value)} /></div>
              <Input label="Cidade" value={form.cidade} onChange={e => handleChange("cidade", e.target.value)} />
              <Select label="Estado" value={form.uf} onChange={e => handleChange("uf", e.target.value)}><option value="">UF</option><option value="SP">SP</option><option value="RJ">RJ</option><option value="MG">MG</option></Select>
            </div>
          </FormSection>
        </div>
      )}
      {tab === 2 && (
        <div className="space-y-4">
          <FormSection title="Contatos">
            <div className="grid grid-cols-2 gap-3">
              <Input label="E-mail principal" type="email" value={form.email} onChange={e => handleChange("email", e.target.value)} />
              <Input label="Telefone" value={form.telefone} onChange={e => handleChange("telefone", e.target.value)} />
            </div>
          </FormSection>
        </div>
      )}
      {tab === 3 && (
        <div className="space-y-4">
          <FormSection title="Condições Financeiras">
            <div className="p-4 text-sm text-muted-foreground">Configurações financeiras avançadas estão desabilitadas neste cadastro rápido.</div>
          </FormSection>
        </div>
      )}
      <div className="flex justify-between pt-2 border-t border-border">
        <button onClick={onClose} className="text-xs px-4 py-2 border border-border rounded-lg text-muted-foreground hover:bg-muted">Cancelar</button>
        <div className="flex gap-2">
          {tab > 0 && <button onClick={() => setTab(tab - 1)} className="text-xs px-4 py-2 border border-border rounded-lg text-foreground hover:bg-muted">Anterior</button>}
          {tab < tabs.length - 1
            ? <button onClick={() => setTab(tab + 1)} className="text-xs px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90">Próximo</button>
            : <button onClick={() => onSave(form)} className="text-xs px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90">Salvar cliente</button>
          }
        </div>
      </div>
    </div>
  );
}
"""

clientes_code = clientes_code[:form_start] + cliente_form + clientes_code[form_end:]

with open(clientes_path, "w", encoding="utf-8") as f:
    f.write(clientes_code)

print("Clientes refatorado com sucesso")
