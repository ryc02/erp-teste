import React from "react";
import { Search, Filter, Download, Plus, X, AlertCircle, CheckCircle } from "lucide-react";

export function fmt(n: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(n);
}

export function fmtFull(n: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(n);
}

export function Badge({ children, variant = "default" }: { children: React.ReactNode; variant?: "default" | "success" | "warning" | "danger" | "info" | "neutral" }) {
  const v = { 
    default: "bg-secondary text-secondary-foreground", 
    success: "bg-emerald-50 text-emerald-700 border border-emerald-200", 
    warning: "bg-amber-50 text-amber-700 border border-amber-200", 
    danger: "bg-red-50 text-red-700 border border-red-200", 
    info: "bg-blue-50 text-blue-700 border border-blue-200", 
    neutral: "bg-muted text-muted-foreground" 
  };
  return <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${v[variant]}`}>{children}</span>;
}

export function Input({ label, required, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label?: string; required?: boolean }) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-xs font-medium text-foreground">{label}{required && <span className="text-red-500 ml-0.5">*</span>}</label>}
      <input className="text-xs px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-muted-foreground" {...props} />
    </div>
  );
}

export function Select({ label, required, children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement> & { label?: string; required?: boolean }) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-xs font-medium text-foreground">{label}{required && <span className="text-red-500 ml-0.5">*</span>}</label>}
      <select className="text-xs px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 text-foreground" {...props}>{children}</select>
    </div>
  );
}

export function Textarea({ label, required, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string; required?: boolean }) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-xs font-medium text-foreground">{label}{required && <span className="text-red-500 ml-0.5">*</span>}</label>}
      <textarea className="text-xs px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none placeholder:text-muted-foreground" rows={3} {...props} />
    </div>
  );
}

export function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider pb-1 border-b border-border">{title}</h3>
      {children}
    </div>
  );
}

export function Modal({ open, onClose, title, subtitle, children, wide }: { open: boolean; onClose: () => void; title: string; subtitle?: string; children: React.ReactNode; wide?: boolean }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className={`relative bg-card rounded-xl border border-border shadow-2xl flex flex-col max-h-[90vh] ${wide ? "w-full max-w-4xl" : "w-full max-w-2xl"}`}>
        <div className="flex items-start justify-between p-5 border-b border-border flex-shrink-0">
          <div>
            <h2 className="text-base font-semibold text-foreground" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{title}</h2>
            {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground"><X size={16} /></button>
        </div>
        <div className="overflow-y-auto flex-1 p-5">{children}</div>
      </div>
    </div>
  );
}

export function TableToolbar({ title, subtitle, count, onNew, newLabel, children, search, onSearch, onFilterClick, onExportClick, hasActiveFilters }: { title: string; subtitle?: string; count?: number; onNew?: () => void; newLabel?: string; children?: React.ReactNode; search?: string; onSearch?: (v: string) => void; onFilterClick?: () => void; onExportClick?: () => void; hasActiveFilters?: boolean }) {
  return (
    <div className="p-5 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div>
        <h2 className="text-base font-semibold text-foreground" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{title}</h2>
        {(subtitle || count !== undefined) && <p className="text-xs text-muted-foreground">{subtitle ?? `${count} registros encontrados`}</p>}
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input className="text-xs pl-8 pr-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 w-44" placeholder="Buscar..." value={search || ""} onChange={(e) => onSearch?.(e.target.value)} />
        </div>
        {children}
        <button 
          onClick={onFilterClick}
          className={`flex items-center gap-1.5 text-xs px-3 py-2 border rounded-lg transition-colors ${hasActiveFilters ? 'border-primary text-primary bg-primary/5' : 'border-border bg-background text-muted-foreground hover:bg-muted'}`}
        >
          <Filter size={12} /> Filtros
        </button>
        <button onClick={onExportClick} className="flex items-center gap-1.5 text-xs px-3 py-2 border border-border rounded-lg bg-background text-muted-foreground hover:bg-muted">
          <Download size={12} /> Exportar
        </button>
        {onNew && (
          <button onClick={onNew} className="flex items-center gap-1.5 text-xs px-3 py-2 bg-primary text-white rounded-lg hover:bg-primary/90">
            <Plus size={13} /> {newLabel ?? "Novo"}
          </button>
        )}
      </div>
    </div>
  );
}

export function Pagination({ total, shown, page, totalPages, onPageChange }: { total: number; shown: number; page?: number; totalPages?: number; onPageChange?: (p: number) => void }) {
  const p = page || 1;
  const tp = totalPages || 1;
  return (
    <div className="px-5 py-3 border-t border-border flex items-center justify-between">
      <p className="text-xs text-muted-foreground">Mostrando {shown} de {total} registros</p>
      <div className="flex gap-1">
        {[1, 2, 3].map((n) => (
          <button key={n} className={`w-7 h-7 text-xs rounded flex items-center justify-center ${n === 1 ? "bg-primary text-white" : "text-muted-foreground hover:bg-muted"}`}>{n}</button>
        ))}
      </div>
    </div>
  );
}
