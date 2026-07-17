import React, { useState, useEffect } from "react";
import { X, Plus, Trash2, Check, Calculator, ChevronDown, ChevronUp } from "lucide-react";

const fmtCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

export function DrawerIncluirNota({ open, onClose, onSave, initialData }: { open: boolean, onClose: () => void, onSave: (data: any, isEdit?: boolean) => void, initialData?: any }) {
    const [activeSections, setActiveSections] = useState({
        cabecalho: true,
        destinatario: false,
        produtos: true,
        impostos: true,
        transporte: false,
        pagamento: false
    });

    const toggleSection = (key: keyof typeof activeSections) => {
        setActiveSections(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const [form, setForm] = useState({
        // Cabeçalho
        tipo_saida: "Emissão própria",
        serie: "1",
        numero: "",
        data_emissao: new Date().toISOString().split('T')[0],
        hora_emissao: new Date().toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'}),
        natureza_operacao: "Venda de produção própria",
        finalidade: "NF-e normal",
        crt: "Regime normal",
        consumidor_final: "Não",
        presenca_comprador: "Operação não presencial, outros",
        
        // Destinatário
        dest_nome: "",
        dest_tipo: "Jurídica",
        dest_cnpj: "",
        dest_ie: "",
        dest_cep: "",
        dest_cidade: "",
        dest_uf: "",
        dest_endereco: "",
        dest_numero: "",
        dest_bairro: "",
        
        // Transporte
        transporte_modalidade: "Não definida",
        peso_bruto: "",
        peso_liquido: "",
        
        // Pagamento
        forma_pagamento: "Depósito",
        observacoes: ""
    });

    const [itens, setItens] = useState<any[]>([]);

    const [totais, setTotais] = useState({
        produtos: 0, frete: 0, seguro: 0, desconto: 0,
        base_icms: 0, valor_icms: 0, valor_ipi: 0,
        fcp: 0, total_nota: 0
    });

    useEffect(() => {
        if (open && initialData) {
            setForm(prev => ({
                ...prev,
                ...initialData.cabecalho
            }));
            if (initialData.itens) setItens(initialData.itens);
            if (initialData.totais) setTotais(initialData.totais);
        } else if (open && !initialData) {
            // Reset state
            setForm({
                tipo_saida: "Emissão própria",
                serie: "1",
                numero: "",
                data_emissao: new Date().toISOString().split('T')[0],
                hora_emissao: new Date().toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'}),
                natureza_operacao: "Venda de produção própria",
                finalidade: "NF-e normal",
                crt: "Regime normal",
                consumidor_final: "Não",
                presenca_comprador: "Operação não presencial, outros",
                dest_nome: "",
                dest_tipo: "Jurídica",
                dest_cnpj: "",
                dest_ie: "",
                dest_cep: "",
                dest_cidade: "",
                dest_uf: "",
                dest_endereco: "",
                dest_numero: "",
                dest_bairro: "",
                transporte_modalidade: "Não definida",
                peso_bruto: "",
                peso_liquido: "",
                forma_pagamento: "Depósito",
                observacoes: ""
            });
            setItens([]);
            setTotais({
                produtos: 0, frete: 0, seguro: 0, desconto: 0,
                base_icms: 0, valor_icms: 0, valor_ipi: 0,
                fcp: 0, total_nota: 0
            });
        }
    }, [open, initialData]);

    const addItem = () => {
        setItens([...itens, { id: Date.now(), sku: "", descricao: "", unidade: "UN", qtde: 1, preco_un: 0, total: 0, ncm: "", cfop: "" }]);
    };

    const removeItem = (id: number) => {
        setItens(itens.filter(i => i.id !== id));
    };

    const updateItem = (id: number, field: string, val: any) => {
        setItens(itens.map(it => {
            if (it.id === id) {
                const updated = { ...it, [field]: val };
                if (field === 'qtde' || field === 'preco_un') {
                    updated.total = (parseFloat(updated.qtde || 0) * parseFloat(updated.preco_un || 0));
                }
                return updated;
            }
            return it;
        }));
    };

    useEffect(() => {
        // Cálculo automático
        let t_prod = 0;
        itens.forEach(it => t_prod += (it.total || 0));
        
        // Simulação de impostos baseada nos produtos
        const base_icms = t_prod;
        const icms = t_prod * 0.18;
        const ipi = t_prod * 0.05;
        const total = t_prod + ipi; // ICMS por dentro

        setTotais({
            produtos: t_prod,
            frete: 0, seguro: 0, desconto: 0,
            base_icms, valor_icms: icms, valor_ipi: ipi,
            fcp: 0, total_nota: total
        });
    }, [itens]);

    if (!open) return null;

    const SectionHeader = ({ title, sectionKey }: { title: string, sectionKey: keyof typeof activeSections }) => (
        <div 
            className="flex justify-between items-center bg-muted/40 p-3 mt-4 border border-border rounded-t-lg cursor-pointer hover:bg-muted/60 transition-colors"
            onClick={() => toggleSection(sectionKey)}
        >
            <h3 className="font-bold text-foreground text-sm">{title}</h3>
            {activeSections[sectionKey] ? <ChevronUp size={16} className="text-muted-foreground" /> : <ChevronDown size={16} className="text-muted-foreground" />}
        </div>
    );

    const handleSave = () => {
        onSave({ cabecalho: form, itens, totais }, !!initialData);
    };

    return (
        <>
            <div className="fixed inset-0 bg-black/40 z-[100] transition-opacity" onClick={onClose} />
            <div className="fixed inset-y-0 right-0 w-[90vw] md:w-[70vw] lg:w-[60vw] bg-background shadow-2xl z-[110] flex flex-col transform transition-transform duration-300">
                
                {/* Header do Drawer */}
                <div className="flex items-center justify-between p-4 border-b border-border bg-card">
                    <div>
                        <h2 className="text-lg font-bold text-foreground">Inclusão Manual de Nota Fiscal</h2>
                        <p className="text-xs text-muted-foreground">Preencha os campos estruturados da NF-e</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-muted rounded-full text-muted-foreground">
                        <X size={20} />
                    </button>
                </div>

                {/* Corpo (Scroll) */}
                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-zinc-50 dark:bg-zinc-950">
                    
                    {/* Cabeçalho */}
                    <SectionHeader title="Cabeçalho Fiscal" sectionKey="cabecalho" />
                    {activeSections.cabecalho && (
                        <div className="bg-card border border-t-0 border-border rounded-b-lg p-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                                <label className="text-xs font-medium mb-1 block">Série</label>
                                <input value={form.serie} onChange={e => setForm({...form, serie: e.target.value})} className="w-full text-sm border border-border bg-background p-2 rounded" />
                            </div>
                            <div>
                                <label className="text-xs font-medium mb-1 block">Número (opcional)</label>
                                <input value={form.numero} onChange={e => setForm({...form, numero: e.target.value})} placeholder="Automático" className="w-full text-sm border border-border bg-background p-2 rounded" />
                            </div>
                            <div>
                                <label className="text-xs font-medium mb-1 block">Data Emissão</label>
                                <input type="date" value={form.data_emissao} onChange={e => setForm({...form, data_emissao: e.target.value})} className="w-full text-sm border border-border bg-background p-2 rounded" />
                            </div>
                            <div>
                                <label className="text-xs font-medium mb-1 block">Hora Emissão</label>
                                <input type="time" value={form.hora_emissao} onChange={e => setForm({...form, hora_emissao: e.target.value})} className="w-full text-sm border border-border bg-background p-2 rounded" />
                            </div>
                            <div className="col-span-2">
                                <label className="text-xs font-medium mb-1 block">Natureza da Operação</label>
                                <input value={form.natureza_operacao} onChange={e => setForm({...form, natureza_operacao: e.target.value})} className="w-full text-sm border border-border bg-background p-2 rounded" />
                            </div>
                            <div className="col-span-2">
                                <label className="text-xs font-medium mb-1 block">Finalidade</label>
                                <select value={form.finalidade} onChange={e => setForm({...form, finalidade: e.target.value})} className="w-full text-sm border border-border bg-background p-2 rounded">
                                    <option>NF-e normal</option>
                                    <option>NF-e complementar</option>
                                    <option>NF-e de ajuste</option>
                                    <option>Devolução de mercadoria</option>
                                </select>
                            </div>
                            <div className="col-span-2">
                                <label className="text-xs font-medium mb-1 block">Presença do Comprador</label>
                                <select value={form.presenca_comprador} onChange={e => setForm({...form, presenca_comprador: e.target.value})} className="w-full text-sm border border-border bg-background p-2 rounded">
                                    <option>Operação presencial</option>
                                    <option>Operação não presencial, pela Internet</option>
                                    <option>Operação não presencial, Teleatendimento</option>
                                    <option>Operação não presencial, outros</option>
                                </select>
                            </div>
                        </div>
                    )}

                    {/* Destinatário */}
                    <SectionHeader title="Destinatário" sectionKey="destinatario" />
                    {activeSections.destinatario && (
                        <div className="bg-card border border-t-0 border-border rounded-b-lg p-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="col-span-2 md:col-span-4">
                                <label className="text-xs font-medium mb-1 block">Nome / Razão Social</label>
                                <input value={form.dest_nome} onChange={e => setForm({...form, dest_nome: e.target.value})} placeholder="Pesquise ou digite o nome..." className="w-full text-sm border border-border bg-background p-2 rounded" />
                            </div>
                            <div>
                                <label className="text-xs font-medium mb-1 block">Tipo de Pessoa</label>
                                <select value={form.dest_tipo} onChange={e => setForm({...form, dest_tipo: e.target.value})} className="w-full text-sm border border-border bg-background p-2 rounded">
                                    <option>Física</option>
                                    <option>Jurídica</option>
                                    <option>Estrangeira</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-medium mb-1 block">CPF/CNPJ</label>
                                <input value={form.dest_cnpj} onChange={e => setForm({...form, dest_cnpj: e.target.value})} className="w-full text-sm border border-border bg-background p-2 rounded" />
                            </div>
                            <div>
                                <label className="text-xs font-medium mb-1 block">CEP</label>
                                <input value={form.dest_cep} onChange={e => setForm({...form, dest_cep: e.target.value})} className="w-full text-sm border border-border bg-background p-2 rounded" />
                            </div>
                            <div>
                                <label className="text-xs font-medium mb-1 block">Estado (UF)</label>
                                <input value={form.dest_uf} onChange={e => setForm({...form, dest_uf: e.target.value})} maxLength={2} className="w-full text-sm border border-border bg-background p-2 rounded" />
                            </div>
                            <div className="col-span-2">
                                <label className="text-xs font-medium mb-1 block">Endereço (Rua)</label>
                                <input value={form.dest_endereco} onChange={e => setForm({...form, dest_endereco: e.target.value})} className="w-full text-sm border border-border bg-background p-2 rounded" />
                            </div>
                            <div>
                                <label className="text-xs font-medium mb-1 block">Número</label>
                                <input value={form.dest_numero} onChange={e => setForm({...form, dest_numero: e.target.value})} className="w-full text-sm border border-border bg-background p-2 rounded" />
                            </div>
                            <div>
                                <label className="text-xs font-medium mb-1 block">Bairro</label>
                                <input value={form.dest_bairro} onChange={e => setForm({...form, dest_bairro: e.target.value})} className="w-full text-sm border border-border bg-background p-2 rounded" />
                            </div>
                        </div>
                    )}

                    {/* Produtos */}
                    <SectionHeader title="Produtos ou Serviços" sectionKey="produtos" />
                    {activeSections.produtos && (
                        <div className="bg-card border border-t-0 border-border rounded-b-lg p-0 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-muted/50 text-muted-foreground text-xs">
                                        <tr>
                                            <th className="p-2 text-left w-1/3">Descrição / SKU</th>
                                            <th className="p-2 text-left w-20">NCM</th>
                                            <th className="p-2 text-left w-16">CFOP</th>
                                            <th className="p-2 text-right w-16">Qtde</th>
                                            <th className="p-2 text-right w-24">Preço Un</th>
                                            <th className="p-2 text-right w-24">Total</th>
                                            <th className="p-2 text-center w-12"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {itens.length === 0 ? (
                                            <tr>
                                                <td colSpan={7} className="p-8 text-center text-muted-foreground">
                                                    Nenhum item adicionado. Clique no botão abaixo para começar.
                                                </td>
                                            </tr>
                                        ) : itens.map((it) => (
                                            <tr key={it.id} className="hover:bg-muted/20">
                                                <td className="p-2">
                                                    <input value={it.descricao} onChange={e => updateItem(it.id, 'descricao', e.target.value)} placeholder="Pesquise..." className="w-full bg-transparent border-b border-transparent focus:border-primary outline-none" />
                                                </td>
                                                <td className="p-2">
                                                    <input value={it.ncm} onChange={e => updateItem(it.id, 'ncm', e.target.value)} placeholder="0000.00.00" className="w-full bg-transparent border-b border-transparent focus:border-primary outline-none" />
                                                </td>
                                                <td className="p-2">
                                                    <input value={it.cfop} onChange={e => updateItem(it.id, 'cfop', e.target.value)} placeholder="5101" className="w-full bg-transparent border-b border-transparent focus:border-primary outline-none" />
                                                </td>
                                                <td className="p-2">
                                                    <input type="number" min="1" value={it.qtde} onChange={e => updateItem(it.id, 'qtde', e.target.value)} className="w-full bg-transparent border-b border-transparent focus:border-primary outline-none text-right" />
                                                </td>
                                                <td className="p-2">
                                                    <input type="number" step="0.01" value={it.preco_un} onChange={e => updateItem(it.id, 'preco_un', e.target.value)} className="w-full bg-transparent border-b border-transparent focus:border-primary outline-none text-right" />
                                                </td>
                                                <td className="p-2 text-right font-medium">{fmtCurrency(it.total)}</td>
                                                <td className="p-2 text-center">
                                                    <button onClick={() => removeItem(it.id)} className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="p-3 bg-muted/20 border-t border-border flex items-center justify-between">
                                <button onClick={addItem} className="flex items-center gap-2 text-xs text-primary font-bold hover:underline">
                                    <Plus size={14} /> Adicionar Produto
                                </button>
                                <span className="text-xs text-muted-foreground flex items-center gap-2">
                                    <Calculator size={14} /> Cálculo automático ativo
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Impostos Totais */}
                    <SectionHeader title="Cálculo do Imposto (Totais)" sectionKey="impostos" />
                    {activeSections.impostos && (
                        <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-t-0 border-emerald-200 dark:border-emerald-900 rounded-b-lg p-4 grid grid-cols-3 md:grid-cols-5 gap-4">
                            <div>
                                <p className="text-[10px] text-muted-foreground uppercase">Total Produtos</p>
                                <p className="font-bold text-sm">{fmtCurrency(totais.produtos)}</p>
                            </div>
                            <div>
                                <p className="text-[10px] text-muted-foreground uppercase">Valor do Frete</p>
                                <p className="font-bold text-sm text-amber-600">R$ 0,00</p>
                            </div>
                            <div>
                                <p className="text-[10px] text-muted-foreground uppercase">Base ICMS</p>
                                <p className="font-bold text-sm">{fmtCurrency(totais.base_icms)}</p>
                            </div>
                            <div>
                                <p className="text-[10px] text-muted-foreground uppercase">Valor ICMS</p>
                                <p className="font-bold text-sm text-red-600">{fmtCurrency(totais.valor_icms)}</p>
                            </div>
                            <div>
                                <p className="text-[10px] text-muted-foreground uppercase">Valor IPI</p>
                                <p className="font-bold text-sm text-red-600">{fmtCurrency(totais.valor_ipi)}</p>
                            </div>
                            <div className="col-span-3 md:col-span-4 border-t border-emerald-200/50 mt-2 pt-2 text-right">
                                <p className="text-xs text-muted-foreground font-medium uppercase">Total da Nota Fiscal</p>
                            </div>
                            <div className="border-t border-emerald-200/50 mt-2 pt-2">
                                <p className="text-xl font-black text-emerald-600">{fmtCurrency(totais.total_nota)}</p>
                            </div>
                        </div>
                    )}

                    {/* Fim das sections */}
                    <div className="h-16"></div> 
                </div>

                {/* Footer Fixado */}
                <div className="p-4 bg-card border-t border-border flex justify-end gap-3 shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.1)]">
                    <button onClick={onClose} className="px-5 py-2 rounded-lg text-sm font-medium border border-border hover:bg-muted text-muted-foreground transition-colors">
                        Cancelar
                    </button>
                    <button onClick={handleSave} className="px-6 py-2 rounded-lg text-sm font-medium bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-2 transition-colors shadow-lg shadow-emerald-600/20">
                        <Check size={18} /> Emitir NFe / NFCe
                    </button>
                </div>
            </div>
        </>
    );
}
