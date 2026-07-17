import React, { useState, useEffect } from "react";
import { api } from "../services/api";
import { TableToolbar, Pagination, Badge, Modal, Input, Select } from "../components/ui/SharedUI";
import { Edit3, Trash2, Plus, Save, Key } from "lucide-react";

interface Role { id: number; nome: string; }
interface UserItem {
  id: number;
  username: string;
  email: string;
  nome_completo: string;
  ativo: boolean;
  comissao_percentual: number;
  role?: Role;
}

function UsuarioForm({ initial, roles, onClose, onSave }: {
  initial?: UserItem;
  roles: Role[];
  onClose: () => void;
  onSave: () => void;
}) {
  const [form, setForm] = useState({
    username: "",
    email: "",
    nome_completo: "",
    password: "",
    comissao_percentual: 0,
    ...initial,
    // override with resolved values for selects
    ativo: initial ? initial.ativo : true,
    role_id: initial?.role?.id ?? (roles[0]?.id ?? 1),
  });
  const [loading, setLoading] = useState(false);

  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.username || !form.email || !form.nome_completo) {
      alert("Preencha nome, e-mail e usuário.");
      return;
    }
    if (!initial && !form.password) {
      alert("Informe a senha inicial.");
      return;
    }
    setLoading(true);
    try {
      const payload: any = {
        username: form.username,
        email: form.email,
        nome_completo: form.nome_completo,
        role_id: Number(form.role_id),
        ativo: form.ativo,
        comissao_percentual: Number(form.comissao_percentual),
      };
      if (form.password) payload.password = form.password;

      if (initial?.id) {
        await api.put(`/usuarios/${initial.id}`, payload);
      } else {
        await api.post("/usuarios", payload);
      }
      onSave();
    } catch (err: any) {
      alert(err?.message || "Erro ao salvar usuário");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-sm font-semibold border-b border-border pb-2">Identificação</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Nome Completo *" value={form.nome_completo} onChange={e => set("nome_completo", e.target.value)} placeholder="Nome do usuário" />
          <Input label="E-mail *" type="email" value={form.email} onChange={e => set("email", e.target.value)} placeholder="email@empresa.com" />
          <Input label="Usuário (login) *" value={form.username} onChange={e => set("username", e.target.value)} placeholder="usuario.login" disabled={!!initial} />
          <Select label="Nível de Acesso" value={String(form.role_id)} onChange={e => set("role_id", e.target.value)}>
            {roles.map(r => <option key={r.id} value={String(r.id)}>{r.nome}</option>)}
          </Select>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-semibold border-b border-border pb-2">Acesso & Comissão</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label={initial ? "Nova Senha (deixe em branco para manter)" : "Senha Inicial *"}
            type="password"
            value={form.password}
            onChange={e => set("password", e.target.value)}
            placeholder="••••••••"
          />
          <Input
            label="% Comissão"
            type="number"
            min={0} max={100} step={0.01}
            value={form.comissao_percentual}
            onChange={e => set("comissao_percentual", e.target.value)}
            placeholder="Ex: 3.5"
          />
          <Select label="Status" value={String(form.ativo)} onChange={e => set("ativo", e.target.value === "true")}>
            <option value="true">Ativo</option>
            <option value="false">Inativo</option>
          </Select>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4 border-t border-border">
        <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-muted-foreground hover:bg-muted rounded-lg border border-border">Cancelar</button>
        <button type="submit" disabled={loading} className="px-4 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary/90 flex items-center gap-1.5">
          <Save size={14} /> {loading ? "Salvando..." : "Salvar Usuário"}
        </button>
      </div>
    </form>
  );
}

export function Usuarios() {
  const [data, setData] = useState<UserItem[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<UserItem | null>(null);

  async function loadData() {
    setLoading(true);
    try {
      const [users, rls] = await Promise.all([
        api.get<UserItem[]>("/usuarios"),
        api.get<Role[]>("/usuarios/roles/all"),
      ]);
      setData(users);
      setRoles(rls);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadData(); }, []);

  async function handleDelete(id: number) {
    if (!confirm("Desativar este usuário?")) return;
    try {
      await api.delete(`/usuarios/${id}`);
      loadData();
    } catch (err: any) {
      alert(err?.message || "Erro ao desativar usuário");
    }
  }

  const ITEMS_PER_PAGE = 20;
  const filtered = data.filter(u =>
    u.nome_completo?.toLowerCase().includes(search.toLowerCase()) ||
    u.username?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  return (
    <div className="space-y-4 fade-in">
      <Modal
        open={modal}
        onClose={() => { setModal(false); setEditing(null); }}
        title={editing ? "Editar Usuário" : "Novo Usuário"}
        subtitle="Gestão de Acessos e Permissões"
        wide
      >
        <UsuarioForm
          initial={editing ?? undefined}
          roles={roles}
          onClose={() => { setModal(false); setEditing(null); }}
          onSave={() => { setModal(false); setEditing(null); loadData(); }}
        />
      </Modal>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <TableToolbar
          title="Gestão de Usuários"
          subtitle="Acessos e Permissões do Sistema"
          count={filtered.length}
          onNew={() => { setEditing(null); setModal(true); }}
          newLabel="Novo Usuário"
          search={search}
          onSearch={v => { setSearch(v); setPage(1); }}
        />

        <div className="overflow-x-auto min-h-[300px]">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">Carregando usuários...</div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="text-xs text-muted-foreground bg-muted/40">
                  <th className="text-left px-5 py-3 font-medium">Cód.</th>
                  <th className="text-left px-4 py-3 font-medium">Nome</th>
                  <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Usuário</th>
                  <th className="text-left px-4 py-3 font-medium hidden lg:table-cell">E-mail</th>
                  <th className="text-left px-4 py-3 font-medium">Nível</th>
                  <th className="text-left px-4 py-3 font-medium hidden md:table-cell">% Comissão</th>
                  <th className="text-left px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {paginated.length === 0 ? (
                  <tr><td colSpan={8} className="text-center py-10 text-muted-foreground">Nenhum usuário encontrado.</td></tr>
                ) : paginated.map(u => (
                  <tr key={u.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-3.5 text-xs font-mono text-muted-foreground">{u.id}</td>
                    <td className="px-4 py-3.5 text-xs font-medium text-foreground">{u.nome_completo}</td>
                    <td className="px-4 py-3.5 text-xs text-muted-foreground hidden md:table-cell font-mono">{u.username}</td>
                    <td className="px-4 py-3.5 text-xs text-muted-foreground hidden lg:table-cell">{u.email}</td>
                    <td className="px-4 py-3.5 text-xs">
                      <Badge>{u.role?.nome ?? "—"}</Badge>
                    </td>
                    <td className="px-4 py-3.5 text-xs font-semibold hidden md:table-cell">
                      {u.comissao_percentual ? `${u.comissao_percentual}%` : <span className="text-muted-foreground">—</span>}
                    </td>
                    <td className="px-4 py-3.5">
                      <Badge variant={u.ativo ? "success" : "neutral"}>{u.ativo ? "Ativo" : "Inativo"}</Badge>
                    </td>
                    <td className="px-4 py-3.5 flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => { setEditing(u); setModal(true); }}
                        className="p-1.5 rounded-md hover:bg-muted text-muted-foreground transition-colors"
                        title="Editar"
                      >
                        <Edit3 size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(u.id)}
                        className="p-1.5 rounded-md hover:bg-red-500/10 text-red-400 transition-colors"
                        title="Desativar"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
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

export default Usuarios;
