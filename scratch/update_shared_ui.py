import os
import re

hooks_dir = r"d:\ERP Venner\frontend_react\src\app\hooks"
os.makedirs(hooks_dir, exist_ok=True)

# 1. Create useLocalData hook
hook_code = """import { useState, useMemo } from 'react';

export function useLocalData<T extends { id: string }>(initialData: T[]) {
  const [data, setData] = useState<T[]>(initialData);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  // Filter based on any string value in the object
  const filteredData = useMemo(() => {
    if (!search.trim()) return data;
    const lowerSearch = search.toLowerCase();
    return data.filter(item => 
      Object.values(item).some(val => 
        String(val).toLowerCase().includes(lowerSearch)
      )
    );
  }, [data, search]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  
  const paginatedData = useMemo(() => {
    const start = (page - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, page]);

  const add = (item: T) => {
    setData([item, ...data]);
    setPage(1); // Go back to first page
  };

  const remove = (id: string) => {
    setData(data.filter(i => i.id !== id));
  };
  
  const update = (id: string, updatedFields: Partial<T>) => {
    setData(data.map(i => i.id === id ? { ...i, ...updatedFields } : i));
  }

  return {
    data,
    search,
    setSearch: (s: string) => { setSearch(s); setPage(1); },
    page,
    setPage,
    totalPages,
    paginatedData,
    add,
    remove,
    update
  };
}
"""
with open(os.path.join(hooks_dir, "useLocalData.ts"), "w", encoding="utf-8") as f:
    f.write(hook_code)

# 2. Modify SharedUI.tsx
shared_ui_path = r"d:\ERP Venner\frontend_react\src\app\components\ui\SharedUI.tsx"
with open(shared_ui_path, "r", encoding="utf-8") as f:
    shared_content = f.read()

# Modify TableToolbar interface and implementation
toolbar_regex = r"export function TableToolbar\(\{.*?\}\) \{.*?return \("
new_toolbar = """export function TableToolbar({ title, subtitle, count, onNew, newLabel, children, search, onSearch }: { title: string; subtitle?: string; count?: number; onNew?: () => void; newLabel?: string; children?: React.ReactNode; search?: string; onSearch?: (v: string) => void }) {
  return ("""

shared_content = re.sub(toolbar_regex, new_toolbar, shared_content, flags=re.DOTALL)

# Modify TableToolbar input
input_regex = r"<input className=\"[^\"]*\" placeholder=\"Buscar\.\.\.\" />"
new_input = """<input className="text-xs pl-8 pr-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 w-44" placeholder="Buscar..." value={search || ""} onChange={(e) => onSearch?.(e.target.value)} />"""
shared_content = re.sub(input_regex, new_input, shared_content)

# Modify Pagination interface and implementation
pagination_regex = r"export function Pagination\(\{ total, shown \}: \{ total: number; shown: number \}\) \{.*?return \("
new_pagination = """export function Pagination({ total, shown, page, totalPages, onPageChange }: { total: number; shown: number; page?: number; totalPages?: number; onPageChange?: (p: number) => void }) {
  const p = page || 1;
  const tp = totalPages || 1;
  return ("""
shared_content = re.sub(pagination_regex, new_pagination, shared_content, flags=re.DOTALL)

# Modify Pagination buttons
prev_btn_regex = r"<button className=\"p-1\.5 rounded hover:bg-muted text-muted-foreground disabled:opacity-50\" disabled><ChevronLeft size={14} \/><\/button>"
new_prev_btn = """<button className="p-1.5 rounded hover:bg-muted text-muted-foreground disabled:opacity-50" disabled={p <= 1} onClick={() => onPageChange?.(p - 1)}><ChevronLeft size={14} /></button>"""
shared_content = re.sub(prev_btn_regex, new_prev_btn, shared_content)

next_btn_regex = r"<button className=\"p-1\.5 rounded hover:bg-muted text-muted-foreground disabled:opacity-50\"><ChevronRight size={14} \/><\/button>"
new_next_btn = """<button className="p-1.5 rounded hover:bg-muted text-muted-foreground disabled:opacity-50" disabled={p >= tp} onClick={() => onPageChange?.(p + 1)}><ChevronRight size={14} /></button>"""
shared_content = re.sub(next_btn_regex, new_next_btn, shared_content)

# Update the 1 of 3 text
pages_text_regex = r"<span className=\"text-muted-foreground\">Página 1 de 3<\/span>"
new_pages_text = """<span className="text-muted-foreground">Página {p} de {tp}</span>"""
shared_content = re.sub(pages_text_regex, new_pages_text, shared_content)

with open(shared_ui_path, "w", encoding="utf-8") as f:
    f.write(shared_content)

print("Hooks created and SharedUI modified successfully.")
