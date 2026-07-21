import React, { useState, useEffect } from "react";
import { Building2, Plus, Edit2, Trash2 } from "lucide-react";
import { Input, Modal } from "../components/ui/SharedUI";
import { useAuth } from "../hooks/useAuth";
import { api } from "../services/api";
import { toast } from "sonner";

interface Empresa {
  id: number;
  razao_social: string;
  nome_fantasia: string;
  cnpj: string;
  inscricao_estadual: string;
  ativo: boolean;
  tipo_empresa: string;
  matriz_id: number | null;
  regime_tributario: string;
}

export function Empresas() {
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmpresa, setEditingEmpresa] = useState<Empresa | null>(null);
  const [formData, setFormData] = useState({
    razao_social: "",
    nome_fantasia: "",
    cnpj: "",
    inscricao_estadual: "",
    tipo_empresa: "MATRIZ",
    matriz_id: "" as number | string,
    regime_tributario: "SIMPLES_NACIONAL"
  });
  const { can } = useAuth();

  const fetchEmpresas = async () => {
    try {
      setLoading(true);
      const data = await api.get<Empresa[]>("/empresas/");
      setEmpresas(data);
    } catch (e) {
      toast.error("Erro ao carregar empresas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmpresas();
  }, []);

  const handleOpenModal = (empresa?: Empresa) => {
    if (empresa) {
      setEditingEmpresa(empresa);
      setFormData({
        razao_social: empresa.razao_social,
        nome_fantasia: empresa.nome_fantasia || "",
        cnpj: empresa.cnpj,
        inscricao_estadual: empresa.inscricao_estadual || "",
        tipo_empresa: empresa.tipo_empresa || "MATRIZ",
        matriz_id: empresa.matriz_id || "",
        regime_tributario: empresa.regime_tributario || "SIMPLES_NACIONAL"
      });
    } else {
      setEditingEmpresa(null);
      setFormData({
        razao_social: "",
        nome_fantasia: "",
        cnpj: "",
        inscricao_estadual: "",
        tipo_empresa: "MATRIZ",
        matriz_id: "",
        regime_tributario: "SIMPLES_NACIONAL"
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.razao_social || !formData.cnpj) {
      toast.error("Razão Social e CNPJ são obrigatórios");
      return;
    }
    try {
      if (editingEmpresa) {
        await api.put(`/empresas/${editingEmpresa.id}`, formData);
        toast.success("Empresa atualizada com sucesso");
      } else {
        await api.post("/empresas/", formData);
        toast.success("Empresa cadastrada com sucesso");
      }
      setIsModalOpen(false);
      fetchEmpresas();
    } catch (e: any) {
      toast.error(e.response?.data?.detail || "Erro ao salvar empresa");
    }
  };

  const handleToggleAtivo = async (id: number) => {
    try {
      // Simplificação: poderíamos ter um endpoint específico ou fazer um PUT completo
      toast.info("Em breve: Ativar/Inativar");
    } catch (e) {
      console.error(e);
    }
  };

  if (!can('admin', 'view')) {
    return <div className="p-8 text-center text-muted-foreground">Acesso negado. Apenas administradores podem gerenciar empresas.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Multi-Empresas (CNPJs)</h1>
          <p className="text-sm text-muted-foreground mt-1">Gerencie os CNPJs filiais ou empresas do grupo.</p>
        </div>
        <button onClick={() => handleOpenModal()} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 font-medium flex items-center gap-2 text-sm">
          <Plus size={16} /> Nova Empresa
        </button>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">Carregando empresas...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b border-border">
                <tr>
                  <th className="px-6 py-4 font-semibold">Razão Social / Fantasia</th>
                  <th className="px-6 py-4 font-semibold">CNPJ</th>
                  <th className="px-6 py-4 font-semibold">Insc. Estadual</th>
                  <th className="px-6 py-4 font-semibold text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {empresas.map((emp) => (
                  <tr key={emp.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                          <Building2 size={16} />
                        </div>
                        <div>
                          <div className="font-semibold text-foreground flex items-center gap-2">
                            {emp.razao_social}
                            {emp.tipo_empresa === 'MATRIZ' ? (
                              <span className="px-1.5 py-0.5 rounded-sm bg-blue-100 text-blue-700 text-[10px] font-bold">MATRIZ</span>
                            ) : (
                              <span className="px-1.5 py-0.5 rounded-sm bg-orange-100 text-orange-700 text-[10px] font-bold">FILIAL</span>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground">{emp.nome_fantasia || "Sem fantasia"} • {emp.regime_tributario.replace('_', ' ')}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium">{emp.cnpj}</td>
                    <td className="px-6 py-4">{emp.inscricao_estadual || "-"}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => handleOpenModal(emp)} className="p-2 text-muted-foreground hover:bg-muted rounded-lg transition-colors">
                          <Edit2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {empresas.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">
                      Nenhuma empresa cadastrada. A Empresa padrão é utilizada.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal 
        open={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title={editingEmpresa ? "Editar Empresa" : "Nova Empresa"}
      >
        <div className="space-y-4">
          <Input 
            label="Razão Social" 
            value={formData.razao_social}
            onChange={(e) => setFormData({...formData, razao_social: e.target.value})}
            placeholder="Ex: Venner Indústria LTDA"
          />
          <Input 
            label="Nome Fantasia" 
            value={formData.nome_fantasia}
            onChange={(e) => setFormData({...formData, nome_fantasia: e.target.value})}
            placeholder="Ex: Venner"
          />
          <Input 
            label="CNPJ" 
            value={formData.cnpj}
            onChange={(e) => setFormData({...formData, cnpj: e.target.value})}
            placeholder="Ex: 00.000.000/0000-00"
          />
          <Input 
            label="Inscrição Estadual" 
            value={formData.inscricao_estadual}
            onChange={(e) => setFormData({...formData, inscricao_estadual: e.target.value})}
          />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Tipo</label>
              <select 
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                value={formData.tipo_empresa}
                onChange={(e) => setFormData({...formData, tipo_empresa: e.target.value})}
              >
                <option value="MATRIZ">Matriz</option>
                <option value="FILIAL">Filial</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Regime Tributário</label>
              <select 
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                value={formData.regime_tributario}
                onChange={(e) => setFormData({...formData, regime_tributario: e.target.value})}
              >
                <option value="SIMPLES_NACIONAL">Simples Nacional</option>
                <option value="LUCRO_PRESUMIDO">Lucro Presumido</option>
                <option value="LUCRO_REAL">Lucro Real</option>
              </select>
            </div>
          </div>
          {formData.tipo_empresa === "FILIAL" && (
            <div>
              <label className="block text-sm font-medium mb-1">Matriz Vinculada</label>
              <select 
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                value={formData.matriz_id}
                onChange={(e) => setFormData({...formData, matriz_id: e.target.value})}
              >
                <option value="">Selecione a matriz...</option>
                {empresas.filter(e => e.tipo_empresa === 'MATRIZ').map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.razao_social}</option>
                ))}
              </select>
            </div>
          )}
          
          <div className="pt-4 flex justify-end gap-3 border-t border-border mt-6">
            <button className="px-4 py-2 text-sm font-medium border border-border rounded-lg text-muted-foreground hover:bg-muted" onClick={() => setIsModalOpen(false)}>Cancelar</button>
            <button className="px-4 py-2 text-sm font-medium bg-primary text-white rounded-lg hover:bg-primary/90" onClick={handleSave}>Salvar Empresa</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default Empresas;
