import os

SCREENS_DIR = r"d:\ERP Venner\frontend_react\src\app\screens"
os.makedirs(SCREENS_DIR, exist_ok=True)

new_screens = {
    "Compras": "Gestão de Fornecedores e Pedidos de Compra",
    "Expedicao": "Roteirização e Controle de Separação",
    "Pcp": "Ordens de Produção e Gestão de Fábrica",
    "Manutencao": "Ordens de Serviço e Maquinário",
    "Produtividade": "Métricas de Eficiência e OEE",
    "Auditoria": "Logs e Rastreabilidade do Sistema",
    "Usuarios": "Controle de Acessos e Permissões",
    "Configuracoes": "Ajustes Gerais do Sistema",
    "Relatorios": "Central de Relatórios e Exportações"
}

shared_imports = """import React, { useState } from "react";
import { TableToolbar, Pagination, Badge, Modal } from "../components/ui/SharedUI";
import { Eye, Edit3, Trash2, CheckCircle, Clock, XCircle, AlertCircle } from "lucide-react";
"""

for screen, subtitle in new_screens.items():
    screen_content = shared_imports + f"""
export default function {screen}() {{
  const [modal, setModal] = useState(false);
  const data = [1, 2, 3, 4, 5]; // placeholder data

  return (
    <div className="space-y-4">
      <Modal open={{modal}} onClose={{() => setModal(false)}} title="Novo Registro - {screen}" subtitle="Preencha os dados" wide>
        <div className="p-4 text-center text-muted-foreground">Formulário de {screen} em desenvolvimento.</div>
      </Modal>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <TableToolbar 
          title="{screen}" 
          subtitle="{subtitle}" 
          count={{data.length}} 
          onNew={{() => setModal(true)}} 
          newLabel="Novo Registro" 
        />
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-xs text-muted-foreground bg-muted/40">
                <th className="text-left px-5 py-3 font-medium">ID</th>
                <th className="text-left px-4 py-3 font-medium">Descrição</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {{data.map((item) => (
                <tr key={{item}} className="hover:bg-muted/30 transition-colors">
                  <td className="px-5 py-3.5 text-xs font-mono text-muted-foreground">REG-000{{item}}</td>
                  <td className="px-4 py-3.5">
                    <p className="text-xs font-medium text-foreground">Registro de Teste {{item}}</p>
                    <p className="text-xs text-muted-foreground">Detalhe secundário</p>
                  </td>
                  <td className="px-4 py-3.5">
                    <Badge variant={{item % 2 === 0 ? "success" : "warning"}}>
                      {{item % 2 === 0 ? "Concluído" : "Pendente"}}
                    </Badge>
                  </td>
                  <td className="px-4 py-3.5 flex items-center gap-1">
                    <button className="p-1 rounded hover:bg-muted text-muted-foreground"><Eye size={{13}} /></button>
                    <button className="p-1 rounded hover:bg-muted text-muted-foreground"><Edit3 size={{13}} /></button>
                    <button className="p-1 rounded hover:bg-muted text-red-500 hover:text-red-600"><Trash2 size={{13}} /></button>
                  </td>
                </tr>
              ))}}
            </tbody>
          </table>
        </div>
        <Pagination total={{data.length * 3}} shown={{data.length}} />
      </div>
    </div>
  );
}}
"""
    with open(os.path.join(SCREENS_DIR, f"{screen}.tsx"), "w", encoding="utf-8") as f:
        f.write(screen_content)

print("Novas telas com tabelas criadas.")
