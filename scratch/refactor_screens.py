import os

# --- Append to mockData.ts ---
mock_data_path = r"d:\ERP Venner\frontend_react\src\app\data\mockData.ts"
with open(mock_data_path, "a", encoding="utf-8") as f:
    f.write("""

// --- NEW MOCK DATA ---
export const comprasData = [
  { id: "OC-1029", fornecedor: "Tech Supply Inc.", total: 15400.50, prazo: "15/08/2026", status: "Aprovado" },
  { id: "OC-1030", fornecedor: "Global Parts BR", total: 8200.00, prazo: "20/08/2026", status: "Em Cotação" },
  { id: "OC-1031", fornecedor: "Indústria de Plásticos", total: 4500.00, prazo: "10/08/2026", status: "Entregue" },
];

export const expedicaoData = [
  { id: "EXP-881", pedido: "PED-2001", cliente: "João Silva", transportadora: "Correios", status: "Em Trânsito" },
  { id: "EXP-882", pedido: "PED-2005", cliente: "Maria Souza", transportadora: "Jadlog", status: "Aguardando Coleta" },
  { id: "EXP-883", pedido: "PED-2010", cliente: "Empresa ABC", transportadora: "Azul Cargo", status: "Entregue" },
];

export const pcpData = [
  { id: "OP-401", produto: "Mesa de Escritório", qtd: 50, maquina: "Corte 01", status: "Em Produção" },
  { id: "OP-402", produto: "Cadeira Gamer", qtd: 100, maquina: "Montagem 02", status: "Aguardando Insumos" },
  { id: "OP-403", produto: "Estante de Aço", qtd: 20, maquina: "Pintura", status: "Finalizado" },
];

export const manutencaoData = [
  { id: "OS-901", maquina: "Torno CNC 01", tipo: "Preventiva", tecnico: "Carlos Mendes", status: "Agendado" },
  { id: "OS-902", maquina: "Corte a Laser 02", tipo: "Corretiva", tecnico: "Roberto Dias", status: "Em Andamento" },
  { id: "OS-903", maquina: "Injetora Plástica", tipo: "Preventiva", tecnico: "Carlos Mendes", status: "Concluído" },
];

export const auditoriaData = [
  { id: "LOG-9921", usuario: "admin@olist.com", acao: "Login no sistema", data: "13/07/2026 08:00" },
  { id: "LOG-9922", usuario: "vendas@olist.com", acao: "Criação de Pedido PED-2015", data: "13/07/2026 08:45" },
  { id: "LOG-9923", usuario: "admin@olist.com", acao: "Exclusão de Usuário (joao.silva)", data: "13/07/2026 09:12" },
];

export const usuariosData = [
  { id: "USR-01", nome: "Admin User", email: "admin@olist.com", role: "Administrador", status: "Ativo" },
  { id: "USR-02", nome: "Vendedor 1", email: "vendas@olist.com", role: "Vendas", status: "Ativo" },
  { id: "USR-03", nome: "Operador de Máquina", email: "fabrica@olist.com", role: "Produção", status: "Inativo" },
];
""")

# --- Generate the 9 Screens ---
SCREENS_DIR = r"d:\ERP Venner\frontend_react\src\app\screens"

# Dictionary of Screen definitions
# Tuples: (Title, Subtitle, Data Array Name, Data Array Definition, Columns: [(Prop, Label)], Form Inputs: [(Name, Label, Type, Options)])
screens = {
    "Compras": (
        "Gestão de Compras", "Fornecedores e Pedidos de Compra", "mockData.comprasData",
        [("fornecedor", "Fornecedor"), ("prazo", "Prazo de Entrega"), ("total", "Valor Total (R$)")],
        [("fornecedor", "Fornecedor", "select", ["Tech Supply Inc.", "Global Parts BR"]), ("valor", "Valor Previsto", "input", []), ("prazo", "Data Limite", "input", [])]
    ),
    "Expedicao": (
        "Expedição e Logística", "Roteirização e Separação", "mockData.expedicaoData",
        [("pedido", "Pedido Vinculado"), ("cliente", "Cliente Destino"), ("transportadora", "Transportadora")],
        [("pedido", "Número do Pedido", "input", []), ("transportadora", "Transportadora", "select", ["Correios", "Jadlog", "Azul Cargo"])]
    ),
    "Pcp": (
        "Gestão de Fábrica (PCP)", "Ordens de Produção", "mockData.pcpData",
        [("produto", "Produto a Produzir"), ("qtd", "Quantidade"), ("maquina", "Máquina / Setor")],
        [("produto", "Produto", "input", []), ("qtd", "Quantidade Prevista", "input", []), ("maquina", "Setor de Produção", "select", ["Corte", "Pintura", "Montagem"])]
    ),
    "Manutencao": (
        "Manutenção (OS)", "Manutenção Preventiva e Corretiva", "mockData.manutencaoData",
        [("maquina", "Equipamento"), ("tipo", "Tipo de OS"), ("tecnico", "Técnico Responsável")],
        [("maquina", "Equipamento/Máquina", "input", []), ("tipo", "Tipo", "select", ["Preventiva", "Corretiva", "Preditiva"]), ("tecnico", "Técnico Alocado", "input", [])]
    ),
    "Produtividade": (
        "Produtividade (OEE)", "Métricas e Apontamentos", "mockData.pcpData", # Reuse pcp for now but different columns
        [("produto", "Produto / Lote"), ("qtd", "Peças Boas"), ("maquina", "Máquina Avaliada")],
        [("maquina", "Selecione a Máquina", "select", ["Corte 01", "Corte 02", "Montagem"]), ("boas", "Peças Boas", "input", []), ("refugo", "Peças Refugadas", "input", [])]
    ),
    "Auditoria": (
        "Auditoria de Sistema", "Logs e Rastreabilidade", "mockData.auditoriaData",
        [("usuario", "Usuário Responsável"), ("acao", "Ação Realizada"), ("data", "Data e Hora")],
        [] # No forms for logs
    ),
    "Usuarios": (
        "Gestão de Usuários", "Acessos e Permissões", "mockData.usuariosData",
        [("nome", "Nome do Colaborador"), ("email", "E-mail de Login"), ("role", "Nível de Acesso")],
        [("nome", "Nome Completo", "input", []), ("email", "E-mail", "input", []), ("role", "Nível", "select", ["Administrador", "Vendas", "Produção", "Financeiro"])]
    )
}

shared_imports = """import React, { useState } from "react";
import { TableToolbar, Pagination, Badge, Modal, Input, Select, FormSection, fmt } from "../components/ui/SharedUI";
import { Eye, Edit3, Trash2, ShieldAlert } from "lucide-react";
import * as mockData from "../data/mockData";
import { useLocalData } from "../hooks/useLocalData";
"""

def gen_form(fields):
    if not fields:
        return '<div className="p-4 text-center text-muted-foreground">Este módulo não possui formulário de inserção manual.</div>'
    
    html = '<form onSubmit={(e) => { e.preventDefault(); const formData = new FormData(e.currentTarget); const novo = { id: "NEW-" + Math.floor(Math.random() * 10000) }; formData.forEach((val, key) => novo[key] = val); onSave(novo); onClose(); }}><FormSection title="Dados Principais"><div className="grid grid-cols-2 gap-4">'
    for name, label, t, options in fields:
        if t == "input":
            html += f'<Input label="{label}" name="{name}" placeholder="Digite aqui..." />'
        elif t == "select":
            opts = "".join([f'<option>{o}</option>' for o in options])
            html += f'<Select label="{label}" name="{name}"><option value="">Selecione...</option>{opts}</Select>'
    html += '</div></FormSection>'
    
    html += '<div className="flex justify-end gap-2 mt-6 pt-4 border-t border-border"><button type="button" className="px-4 py-2 text-sm text-muted-foreground hover:bg-muted rounded-lg" onClick={onClose}>Cancelar</button><button type="submit" className="px-4 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary/90">Salvar Dados</button></div></form>'
    return html

def gen_table_headers(cols):
    h = '<th className="text-left px-5 py-3 font-medium">Cód.</th>'
    for _, label in cols:
        h += f'<th className="text-left px-4 py-3 font-medium">{label}</th>'
    h += '<th className="text-left px-4 py-3 font-medium">Status</th><th className="px-4 py-3 text-right">Ações</th>'
    return h

def gen_table_rows(cols):
    r = '<td className="px-5 py-3.5 text-xs font-mono text-muted-foreground">{item.id}</td>'
    for prop, _ in cols:
        if prop == "total":
            r += f'<td className="px-4 py-3.5 text-xs font-medium text-foreground">{{fmt(item.{prop})}}</td>'
        else:
            r += f'<td className="px-4 py-3.5 text-xs text-foreground">{{item.{prop}}}</td>'
            
    r += """<td className="px-4 py-3.5">
              <Badge variant={item.status === "Ativo" || item.status === "Aprovado" || item.status === "Entregue" || item.status === "Concluído" ? "success" : item.status === "Inativo" || item.status === "Em Atraso" ? "danger" : "warning"}>
                {item.status || "Pendente"}
              </Badge>
            </td>"""
    r += """<td className="px-4 py-3.5 flex items-center justify-end gap-1">
              <button className="p-1 rounded hover:bg-muted text-muted-foreground"><Edit3 size={14} /></button>
              <button onClick={() => onRemove(item.id)} className="p-1 rounded hover:bg-muted text-red-500"><Trash2 size={14} /></button>
            </td>"""
    return r

for screen, (title, sub, data_arr, cols, fields) in screens.items():
    code = shared_imports + f"""
export function {screen}Form({{ onClose, onSave }}: {{ onClose: () => void; onSave: (item: any) => void }}) {{
  return (
    <div className="space-y-4">
      {gen_form(fields)}
    </div>
  );
}}

export function {screen}() {{
  const [modal, setModal] = useState(false);
  const {{ data, search, setSearch, page, setPage, totalPages, paginatedData, add, remove }} = useLocalData({data_arr});

  return (
    <div className="space-y-4">
      <Modal open={{modal}} onClose={{() => setModal(false)}} title="Novo Registro - {title}" wide>
        <{screen}Form onClose={{() => setModal(false)}} onSave={{add}} />
      </Modal>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <TableToolbar 
          title="{title}" 
          subtitle="{sub}" 
          count={{data.length}} 
          onNew={{{'undefined' if not fields else '() => setModal(true)'}}} 
          newLabel="Adicionar"
          search={{search}}
          onSearch={{setSearch}}
        />
        
        <div className="overflow-x-auto min-h-[300px]">
          <table className="w-full">
            <thead>
              <tr className="text-xs text-muted-foreground bg-muted/40 border-b border-border">
                {gen_table_headers(cols)}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {{paginatedData.length === 0 ? 
                <tr><td colSpan={{10}} className="text-center py-10 text-muted-foreground">Nenhum registro encontrado.</td></tr> : 
                paginatedData.map((item: any) => (
                <tr key={{item.id}} className="hover:bg-muted/30 transition-colors">
                  {gen_table_rows(cols)}
                </tr>
              ))}}
            </tbody>
          </table>
        </div>
        <Pagination total={{data.length}} shown={{paginatedData.length}} page={{page}} totalPages={{totalPages}} onPageChange={{setPage}} />
      </div>
    </div>
  );
}}

export default {screen};
"""
    with open(os.path.join(SCREENS_DIR, f"{screen}.tsx"), "w", encoding="utf-8") as f:
        f.write(code)


# Handle Configuracoes and Relatorios which are special dashboard-like screens
conf_code = shared_imports + """
export function Configuracoes() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div className="bg-card rounded-xl border border-border p-6">
        <h2 className="text-lg font-bold mb-4">Configurações Gerais do ERP</h2>
        <FormSection title="Dados da Empresa">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Razão Social" defaultValue="ERP Venner Indústria LTDA" />
            <Input label="CNPJ" defaultValue="12.345.678/0001-90" />
          </div>
        </FormSection>
        <div className="mt-6">
          <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90">Salvar Preferências</button>
        </div>
      </div>
    </div>
  );
}
export default Configuracoes;
"""
with open(os.path.join(SCREENS_DIR, "Configuracoes.tsx"), "w", encoding="utf-8") as f: f.write(conf_code)

rel_code = shared_imports + """
export function Relatorios() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-xl p-5 hover:border-primary transition-colors cursor-pointer">
          <h3 className="font-bold text-lg mb-1">DRE Gerencial</h3>
          <p className="text-xs text-muted-foreground mb-4">Relatório completo de receitas e despesas.</p>
          <button className="text-xs text-primary font-medium">Exportar PDF</button>
        </div>
        <div className="bg-card border border-border rounded-xl p-5 hover:border-primary transition-colors cursor-pointer">
          <h3 className="font-bold text-lg mb-1">Curva ABC (Estoque)</h3>
          <p className="text-xs text-muted-foreground mb-4">Produtos com maior giro e faturamento.</p>
          <button className="text-xs text-primary font-medium">Exportar Excel</button>
        </div>
      </div>
    </div>
  );
}
export default Relatorios;
"""
with open(os.path.join(SCREENS_DIR, "Relatorios.tsx"), "w", encoding="utf-8") as f: f.write(rel_code)

print("All screens refactored successfully.")
