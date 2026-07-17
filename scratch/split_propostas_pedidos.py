import os
import shutil

app_dir = r"d:\ERP Venner\frontend_react\src\app"
screens_dir = os.path.join(app_dir, "screens")
pedidos_path = os.path.join(screens_dir, "Pedidos.tsx")
propostas_path = os.path.join(screens_dir, "Propostas.tsx")
app_path = os.path.join(app_dir, "App.tsx")

# 1. Copiar Pedidos para Propostas e ajustar
with open(pedidos_path, "r", encoding="utf-8") as f:
    code = f.read()

# Substituições para Propostas.tsx
code_prop = code.replace("Gestão de Pedidos", "Propostas Comerciais")
code_prop = code.replace("Incluir Pedido", "Nova Proposta")
code_prop = code.replace("Pedidos()", "Propostas()")
code_prop = code.replace("export default Pedidos;", "export default Propostas;")
code_prop = code.replace("Novo Pedido", "Nova Proposta")
code_prop = code.replace("NovoPedidoForm", "NovaPropostaForm")
code_prop = code.replace("Aprovar Pedido", "Aprovar e Converter em Pedido")
code_prop = code.replace('api.get<any[]>("/vendas/pedidos")', 'api.get<any[]>("/vendas/pedidos?tipo=COTACAO")')
code_prop = code.replace('tipo: "PEDIDO"', 'tipo: "COTACAO"')
code_prop = code.replace("const filters = [\"todos\", \"RASCUNHO\", \"APROVADO\", \"FATURADO\", \"CONCLUIDO\", \"CANCELADO\"];", "const filters = [\"todos\", \"EM_ABERTO\", \"APROVADO\", \"CANCELADO\"];")

# Adicionar a lógica de conversão no Propostas.tsx (Na tabela)
# Procurar o botão de <MoreHorizontal> e trocar por botões úteis
tr_replace_from = """<td className="px-4 py-3.5 flex items-center justify-end gap-1 opacity-50 group-hover:opacity-100 transition-opacity">
                        <button className="p-1.5 rounded-md hover:bg-muted text-muted-foreground"><MoreHorizontal size={14} /></button>
                      </td>"""
tr_replace_to = """<td className="px-4 py-3.5 flex items-center justify-end gap-1 opacity-50 group-hover:opacity-100 transition-opacity">
                        {o.status === 'EM_ABERTO' && (
                           <button onClick={async () => {
                             if(confirm('Aprovar e converter em Pedido?')) {
                               await api.post(`/vendas/pedidos/${o.id}/converter-em-pedido`);
                               loadData();
                             }
                           }} className="text-xs px-2 py-1 bg-primary text-white rounded hover:bg-primary/90">Converter em Pedido</button>
                        )}
                        <button onClick={async () => {
                             if(confirm('Cancelar proposta?')) {
                               await api.post(`/vendas/pedidos/${o.id}/cancelar`);
                               loadData();
                             }
                        }} className="p-1.5 rounded-md hover:bg-red-500/10 text-red-500"><Trash2 size={14} /></button>
                      </td>"""
code_prop = code_prop.replace(tr_replace_from, tr_replace_to)

with open(propostas_path, "w", encoding="utf-8") as f:
    f.write(code_prop)

# 2. Ajustar Pedidos.tsx (apenas listagem de PEDIDO, sem botão de inclusão)
code_ped = code
code_ped = code_ped.replace('api.get<any[]>("/vendas/pedidos")', 'api.get<any[]>("/vendas/pedidos?tipo=PEDIDO")')
# Remover botão de Incluir Pedido da Toolbar em Pedidos
code_ped = code_ped.replace('onNew={can(\'pedidos\', \'create\') ? () => setView("new") : undefined}', '')
code_ped = code_ped.replace('newLabel="Incluir Pedido"', '')
# Não remover o Form do código fonte para não quebrar referências caso precise, mas não será mais usado pela UI
# O view === "new" nunca será acionado pois onNew não é passado

with open(pedidos_path, "w", encoding="utf-8") as f:
    f.write(code_ped)

# 3. Adicionar Propostas no App.tsx
with open(app_path, "r", encoding="utf-8") as f:
    app_code = f.read()

if "import { Propostas }" not in app_code:
    app_code = app_code.replace('import { Pedidos } from "./screens/Pedidos";', 'import { Pedidos } from "./screens/Pedidos";\nimport { Propostas } from "./screens/Propostas";')
    app_code = app_code.replace('{ id: "pedidos", label: "Pedidos", icon: ShoppingCart },', '{ id: "propostas", label: "Propostas Comerciais", icon: FileText },\n      { id: "pedidos", label: "Gestão de Pedidos", icon: ShoppingCart },')
    app_code = app_code.replace('case "pedidos": return <Pedidos />;', 'case "propostas": return <Propostas />;\n      case "pedidos": return <Pedidos />;')

    with open(app_path, "w", encoding="utf-8") as f:
        f.write(app_code)

print("Frontend separado com sucesso!")
