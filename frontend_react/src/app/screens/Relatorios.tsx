import React, { useState } from "react";
import { TableToolbar, Pagination, Badge, Modal, Input, Select, FormSection, fmt } from "../components/ui/SharedUI";
import { Eye, Edit3, Trash2, ShieldAlert } from "lucide-react";
import * as mockData from "../data/mockData";
import { useLocalData } from "../hooks/useLocalData";

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
