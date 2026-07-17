import os

config_path = r"d:\ERP Venner\frontend_react\src\app\screens\Configuracoes.tsx"

new_content = """import React, { useState } from "react";
import { Building2, Users, Package, ShoppingCart, Warehouse, FileText, DollarSign, Shield, Bell, HardDrive, Save, Check } from "lucide-react";
import { Input, Select, FormSection, Badge, Textarea } from "../components/ui/SharedUI";
import { useAuth } from "../hooks/useAuth";

const tabs = [
  { id: "geral", label: "Geral / Empresa", icon: Building2 },
  { id: "usuarios", label: "Usuários e Permissões", icon: Users },
  { id: "cadastros", label: "Cadastros", icon: Package },
  { id: "vendas", label: "Vendas / Pedidos", icon: ShoppingCart },
  { id: "estoque", label: "Estoque", icon: Warehouse },
  { id: "fiscal", label: "Fiscal", icon: FileText },
  { id: "financeiro", label: "Financeiro", icon: DollarSign },
  { id: "seguranca", label: "Segurança e Acesso", icon: Shield },
  { id: "comunicacao", label: "Comunicação e Notificações", icon: Bell },
  { id: "backup", label: "Backup e Auditoria", icon: HardDrive },
];

export function Configuracoes() {
  const [activeTab, setActiveTab] = useState("geral");
  const { can } = useAuth();
  
  if (!can('admin', 'view')) {
    return <div className="p-8 text-center text-muted-foreground">Acesso negado. Apenas administradores podem visualizar esta tela.</div>;
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Floating Save Bar */}
      <div className="flex-shrink-0 mb-4 bg-card rounded-xl border border-border p-4 shadow-sm flex items-center justify-between sticky top-0 z-10">
        <div>
          <h2 className="text-lg font-bold text-foreground" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Painel de Configurações</h2>
          <p className="text-xs text-muted-foreground">Suas alterações afetarão todos os usuários do ERP Venner.</p>
        </div>
        <button className="px-5 py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 font-medium flex items-center gap-2 shadow-sm transition-all hover:shadow">
          <Save size={16} /> Salvar Alterações
        </button>
      </div>

      <div className="flex flex-1 gap-6 min-h-0">
        {/* Sidebar */}
        <div className="w-64 flex-shrink-0 bg-card rounded-xl border border-border flex flex-col overflow-hidden">
          <div className="p-4 border-b border-border bg-muted/20">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Categorias</h3>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}
                >
                  <tab.icon size={16} className={isActive ? "text-primary" : "opacity-70"} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Pane */}
        <div className="flex-1 bg-card rounded-xl border border-border overflow-y-auto custom-scrollbar p-6">
          <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
            
            {activeTab === "geral" && (
              <div className="space-y-6">
                <FormSection title="Dados Institucionais">
                  <div className="grid grid-cols-2 gap-4">
                    <Input label="Razão Social" defaultValue="ERP Venner Indústria LTDA" />
                    <Input label="Nome Fantasia" defaultValue="Venner Indústria" />
                    <Input label="CNPJ" defaultValue="12.345.678/0001-90" />
                    <Select label="Regime Tributário"><option>Simples Nacional</option><option>Lucro Presumido</option><option>Lucro Real</option></Select>
                    <Input label="Inscrição Estadual" defaultValue="123.456.789.111" />
                    <Input label="Inscrição Municipal" defaultValue="987654-3" />
                  </div>
                </FormSection>
                <FormSection title="Endereço Sede">
                  <div className="grid grid-cols-4 gap-4">
                    <div className="col-span-1"><Input label="CEP" defaultValue="01234-567" /></div>
                    <div className="col-span-2"><Input label="Logradouro" defaultValue="Av. Paulista" /></div>
                    <div className="col-span-1"><Input label="Número" defaultValue="1000" /></div>
                    <div className="col-span-2"><Input label="Bairro" defaultValue="Bela Vista" /></div>
                    <div className="col-span-1"><Input label="Cidade" defaultValue="São Paulo" /></div>
                    <div className="col-span-1"><Input label="UF" defaultValue="SP" /></div>
                  </div>
                </FormSection>
                <FormSection title="Geral">
                  <div className="grid grid-cols-2 gap-4">
                    <Select label="Fuso Horário Padrão"><option>America/Sao_Paulo (BRT)</option><option>America/Manaus (AMT)</option></Select>
                    <Input label="Moeda Padrão" defaultValue="BRL (R$)" readOnly className="bg-muted/30" />
                  </div>
                </FormSection>
              </div>
            )}

            {activeTab === "usuarios" && (
              <div className="space-y-6">
                <FormSection title="Gerenciamento Rápido">
                  <p className="text-sm text-muted-foreground mb-4">Para gerenciar e excluir usuários, acesse a tela dedicada em Sistema &gt; Usuários.</p>
                  <button className="px-4 py-2 border border-border text-sm font-medium rounded-lg hover:bg-muted text-foreground">Acessar Tela de Usuários</button>
                </FormSection>
                <FormSection title="Configurações Globais de Permissão">
                  <div className="space-y-4">
                    <label className="flex items-center gap-3 p-3 border border-border rounded-lg bg-muted/10 cursor-pointer">
                      <input type="checkbox" defaultChecked className="w-4 h-4 accent-primary rounded" />
                      <div>
                        <p className="text-sm font-medium text-foreground">Isolamento de Dados (Row-level security)</p>
                        <p className="text-xs text-muted-foreground">Vendedores só podem visualizar os próprios pedidos (Não aplicável a Gerentes/Admins).</p>
                      </div>
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <Input label="Limite de Desconto Máximo (%) - Vendedores" type="number" defaultValue="5" />
                      <Input label="Limite de Desconto Máximo (%) - Gerentes" type="number" defaultValue="20" />
                    </div>
                  </div>
                </FormSection>
              </div>
            )}

            {activeTab === "cadastros" && (
              <div className="space-y-6">
                <FormSection title="Configurações de Produto e Estoque">
                  <div className="grid grid-cols-2 gap-4">
                    <Select label="Geração Automática de SKU">
                      <option>Habilitado (Padrão: PRD-0001)</option>
                      <option>Desabilitado (Manual)</option>
                    </Select>
                    <Select label="Controle de Estoque Padrão">
                      <option>Sim (Controlar estoque de novos produtos)</option>
                      <option>Não</option>
                    </Select>
                  </div>
                </FormSection>
                <FormSection title="Obrigatoriedades (Trava de Salvamento)">
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm"><input type="checkbox" defaultChecked className="accent-primary" /> Exigir NCM no cadastro de Produtos</label>
                    <label className="flex items-center gap-2 text-sm"><input type="checkbox" defaultChecked className="accent-primary" /> Exigir Peso/Dimensões se produto for físico</label>
                    <label className="flex items-center gap-2 text-sm"><input type="checkbox" className="accent-primary" /> Exigir Código de Serviço Municipal para Serviços</label>
                  </div>
                </FormSection>
                <FormSection title="Regras de Cliente">
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm"><input type="checkbox" defaultChecked className="accent-primary" /> Bloquear CPF/CNPJ duplicado no banco de dados</label>
                  </div>
                </FormSection>
              </div>
            )}

            {activeTab === "vendas" && (
              <div className="space-y-6">
                <FormSection title="Fluxo de Aprovação e Automações">
                  <div className="space-y-4">
                    <Select label="Ação automática ao APROVAR pedido">
                      <option>Baixar Estoque E Lançar Financeiro (Automático)</option>
                      <option>Apenas Baixar Estoque</option>
                      <option>Manual (Não gerar baixas automáticas)</option>
                    </Select>
                    <label className="flex items-center gap-3 p-3 border border-border rounded-lg bg-muted/10 cursor-pointer">
                      <input type="checkbox" defaultChecked className="w-4 h-4 accent-primary rounded" />
                      <div>
                        <p className="text-sm font-medium text-foreground">Geração Automática de Nota Fiscal</p>
                        <p className="text-xs text-muted-foreground">Transmitir nota para SEFAZ imediatamente após o pedido mudar para Faturado.</p>
                      </div>
                    </label>
                  </div>
                </FormSection>
                <FormSection title="Layout de Impressão">
                  <Select label="Modelo do Pedido Impresso (PDF)">
                    <option>Completo (com fotos, detalhes e campos de assinatura)</option>
                    <option>Simplificado (estilo cupom)</option>
                  </Select>
                </FormSection>
                <FormSection title="Comissões">
                  <Input label="Percentual de Comissão Padrão (%)" type="number" defaultValue="3" />
                </FormSection>
              </div>
            )}

            {activeTab === "estoque" && (
              <div className="space-y-6">
                <FormSection title="Parâmetros Gerais de Movimentação">
                  <div className="grid grid-cols-2 gap-4">
                    <Select label="Permitir Estoque Negativo">
                      <option>Não (Bloquear vendas sem saldo)</option>
                      <option>Sim (Gerar pendência de reposição)</option>
                    </Select>
                    <Select label="Depósito Padrão">
                      <option>Depósito Principal - SP</option>
                      <option>Estoque Secundário - RJ</option>
                    </Select>
                  </div>
                </FormSection>
                <FormSection title="Alertas e Limites">
                  <div className="grid grid-cols-2 gap-4">
                    <Input label="Estoque Mínimo Padrão (Sugerido)" type="number" defaultValue="5" />
                    <Input label="Estoque Máximo Padrão (Sugerido)" type="number" defaultValue="100" />
                  </div>
                  <label className="flex items-center gap-2 text-sm mt-4"><input type="checkbox" defaultChecked className="accent-primary" /> Enviar notificação ao gerente de compras quando estoque atingir o mínimo</label>
                </FormSection>
              </div>
            )}

            {activeTab === "fiscal" && (
              <div className="space-y-6">
                {/* Alerta de Ambiente */}
                <div className="bg-amber-500/10 border-l-4 border-amber-500 p-4 rounded-r-lg flex gap-3">
                  <Shield size={20} className="text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-amber-800">Atenção: Você está operando em Ambiente de HOMOLOGAÇÃO</h4>
                    <p className="text-xs text-amber-700/80 mt-1">As notas fiscais emitidas neste ambiente não têm validade jurídica e não geram imposto. Recomendado para testes iniciais.</p>
                    <button className="mt-3 text-xs bg-amber-500 text-white px-3 py-1.5 rounded-md hover:bg-amber-600 font-medium">Trocar para PRODUÇÃO</button>
                  </div>
                </div>

                <FormSection title="Certificado Digital A1">
                  <div className="p-4 border border-border rounded-lg bg-muted/10 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-600"><Check size={18}/></div>
                        <div>
                          <p className="text-sm font-medium">Certificado VENNER_LTDA_2026.pfx</p>
                          <p className="text-xs text-muted-foreground">Válido até 13/07/2027 (Restam 365 dias)</p>
                        </div>
                      </div>
                      <button className="px-3 py-1.5 border border-border rounded-lg text-xs font-medium bg-background hover:bg-muted">Substituir Arquivo</button>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <Input label="Senha do Certificado" type="password" defaultValue="********" />
                    </div>
                  </div>
                </FormSection>

                <FormSection title="Série e Numeração">
                  <div className="grid grid-cols-3 gap-4">
                    <Input label="Série NF-e" type="number" defaultValue="1" />
                    <Input label="Próxima Numeração (NF-e)" type="number" defaultValue="1045" />
                    <Input label="Série NFS-e" type="number" defaultValue="1" />
                  </div>
                </FormSection>

                <FormSection title="Regras de Tributação Padrão">
                  <div className="grid grid-cols-2 gap-4">
                    <Input label="CFOP Padrão (Estadual)" defaultValue="5102" />
                    <Input label="CFOP Padrão (Interestadual)" defaultValue="6102" />
                    <Input label="Alíquota ISS Padrão (%)" defaultValue="5" />
                    <Select label="Ação em Contingência (SEFAZ Offline)">
                      <option>Emitir em Contingência Offline (NFC-e)</option>
                      <option>Bloquear emissão e notificar</option>
                    </Select>
                  </div>
                </FormSection>
              </div>
            )}

            {activeTab === "financeiro" && (
              <div className="space-y-6">
                <FormSection title="Contas e Recebimentos">
                  <div className="grid grid-cols-2 gap-4">
                    <Select label="Lançamento de Contas a Receber">
                      <option>Automático (Ao faturar pedido)</option>
                      <option>Manual</option>
                    </Select>
                    <Select label="Conta Bancária Padrão">
                      <option>Conta Principal BB (Padrão)</option>
                      <option>Conta Digital</option>
                    </Select>
                  </div>
                  <label className="flex items-center gap-2 text-sm mt-4"><input type="checkbox" defaultChecked className="accent-primary" /> Ao emitir nota fiscal, recalcular vencimentos das parcelas a partir da data de emissão</label>
                </FormSection>
                <FormSection title="Configuração de Boleto">
                  <div className="grid grid-cols-2 gap-4">
                    <Input label="Prazo de Compensação (Dias)" type="number" defaultValue="2" />
                    <Input label="Multa após vencimento (%)" type="number" defaultValue="2" />
                  </div>
                  <label className="flex items-center gap-2 text-sm mt-4"><input type="checkbox" defaultChecked className="accent-primary" /> Enviar boleto automaticamente por e-mail ao cliente quando aprovado</label>
                </FormSection>
              </div>
            )}

            {activeTab === "seguranca" && (
              <div className="space-y-6">
                <FormSection title="Políticas de Acesso">
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm"><input type="checkbox" defaultChecked className="accent-primary" /> Exigir Autenticação em Duas Etapas (2FA) para Administradores e Fiscais</label>
                    <label className="flex items-center gap-2 text-sm"><input type="checkbox" className="accent-primary" /> Bloquear acessos fora do horário comercial (08:00 às 18:00)</label>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <Select label="Tempo de Expiração de Sessão (Inatividade)">
                      <option>30 minutos</option>
                      <option>1 hora</option>
                      <option>4 horas</option>
                      <option>Nunca expirar (Não recomendado)</option>
                    </Select>
                  </div>
                </FormSection>
                <FormSection title="Segurança de Senha">
                  <div className="grid grid-cols-2 gap-4">
                    <Input label="Tamanho Mínimo da Senha" type="number" defaultValue="8" />
                    <Select label="Forçar troca de senha">
                      <option>A cada 90 dias</option>
                      <option>A cada 180 dias</option>
                      <option>Nunca</option>
                    </Select>
                  </div>
                </FormSection>
              </div>
            )}

            {activeTab === "comunicacao" && (
              <div className="space-y-6">
                <FormSection title="Configurações de E-mail (SMTP)">
                  <div className="grid grid-cols-2 gap-4">
                    <Input label="Servidor SMTP" defaultValue="smtp.venner.com" />
                    <Input label="Porta" defaultValue="587" />
                    <Input label="Usuário" defaultValue="notificacoes@venner.com" />
                    <Input label="Senha" type="password" defaultValue="********" />
                  </div>
                </FormSection>
                <FormSection title="Integrações">
                  <label className="flex items-center gap-3 p-3 border border-border rounded-lg bg-muted/10 cursor-pointer">
                    <input type="checkbox" defaultChecked className="w-4 h-4 accent-primary rounded" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Envio via WhatsApp (API)</p>
                      <p className="text-xs text-muted-foreground">Enviar PDF do Pedido e XML da Nota Fiscal diretamente para o WhatsApp do cliente.</p>
                    </div>
                  </label>
                </FormSection>
              </div>
            )}

            {activeTab === "backup" && (
              <div className="space-y-6">
                <FormSection title="Rotina de Backup (Banco de Dados e Arquivos)">
                  <div className="grid grid-cols-2 gap-4">
                    <Select label="Frequência do Backup">
                      <option>Diário (03:00 AM)</option>
                      <option>Semanal (Domingo 03:00 AM)</option>
                    </Select>
                    <Select label="Retenção de Arquivos (Nuvem)">
                      <option>Manter últimos 30 dias</option>
                      <option>Manter últimos 365 dias (Recomendado para Fiscal)</option>
                    </Select>
                  </div>
                </FormSection>
                <FormSection title="Exportação e Compliance (LGPD)">
                  <p className="text-sm text-muted-foreground mb-4">Em caso de auditoria ou requisição legal, você pode gerar um dump completo dos dados.</p>
                  <button className="px-4 py-2 border border-border text-sm font-medium rounded-lg hover:bg-muted text-foreground flex items-center gap-2">
                    <HardDrive size={16} /> Solicitar Exportação Completa de Dados
                  </button>
                </FormSection>
              </div>
            )}
            
          </div>
        </div>
      </div>
    </div>
  );
}

export default Configuracoes;
"""
with open(config_path, "w", encoding="utf-8") as f:
    f.write(new_content)
    print("Configuracoes.tsx refactored.")
