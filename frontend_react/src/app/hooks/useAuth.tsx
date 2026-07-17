import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { api, setToken, getToken, clearToken } from "../services/api";

export type Role = "ADMIN" | "VENDEDOR" | "FINANCEIRO" | "ESTOQUE" | "FISCAL" | "GERENTE";

export interface User {
  id: number;
  username: string;
  nome_completo: string;
  email: string;
  role: { id: number; nome: Role };
  ativo: boolean;
  permissoes?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  can: (module: string, action: string) => boolean;
}

// Matriz de permissões por role (fallback para usuários legados que ainda não possuem permissões salvas na string)
const permissions: Record<string, Record<string, Record<string, boolean>>> = {
  ADMIN: {
    cadastros: { view: true, create: true, edit: true, delete: true, edit_price: true },
    pedidos: { view: true, create: true, edit_draft: true, edit_approved: true, cancel: true, export: true },
    estoque: { view: true, move: true, configure: true },
    financeiro: { view: true, move: true, configure: true },
    fiscal: { view: true, emit: true, cancel: true, configure: true },
    admin: { view: true },
  },
  VENDEDOR: {
    cadastros: { view: true, create: true, edit: true, delete: false, edit_price: false },
    pedidos: { view: true, create: true, edit_draft: true, edit_approved: false, cancel: false, export: false },
    estoque: { view: true, move: false, configure: false },
    financeiro: { view: false, move: false, configure: false },
    fiscal: { view: false, emit: false, cancel: false, configure: false },
    admin: { view: false },
  },
  FINANCEIRO: {
    cadastros: { view: true, create: false, edit: false, delete: false, edit_price: false },
    pedidos: { view: true, create: false, edit_draft: false, edit_approved: false, cancel: false, export: true },
    estoque: { view: true, move: false, configure: false },
    financeiro: { view: true, move: true, configure: true },
    fiscal: { view: true, emit: false, cancel: false, configure: false },
    admin: { view: false },
  },
  ESTOQUE: {
    cadastros: { view: true, create: false, edit: false, delete: false, edit_price: false },
    pedidos: { view: true, create: false, edit_draft: false, edit_approved: false, cancel: false, export: true },
    estoque: { view: true, move: true, configure: true },
    financeiro: { view: false, move: false, configure: false },
    fiscal: { view: false, emit: false, cancel: false, configure: false },
    admin: { view: false },
  },
  FISCAL: {
    cadastros: { view: true, create: false, edit: false, delete: false, edit_price: false },
    pedidos: { view: true, create: false, edit_draft: false, edit_approved: false, cancel: false, export: true },
    estoque: { view: true, move: false, configure: false },
    financeiro: { view: true, move: false, configure: false },
    fiscal: { view: true, emit: true, cancel: true, configure: true },
    admin: { view: false },
  },
  GERENTE: {
    cadastros: { view: true, create: true, edit: true, delete: true, edit_price: true },
    pedidos: { view: true, create: true, edit_draft: true, edit_approved: false, cancel: true, export: true },
    estoque: { view: true, move: false, configure: true },
    financeiro: { view: true, move: false, configure: false },
    fiscal: { view: true, emit: false, cancel: false, configure: false },
    admin: { view: true },
  },
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }
    api.get<User>("/usuarios/me")
      .then((u) => setUser(u))
      .catch(() => clearToken())
      .finally(() => setLoading(false));
  }, []);

  async function login(username: string, password: string): Promise<void> {
    const form = new URLSearchParams();
    form.set("username", username);
    form.set("password", password);

    const data = await api.post<{ access_token: string; token_type: string }>(
      "/auth/login",
      undefined,
      form
    );
    setToken(data.access_token);
    const me = await api.get<User>("/usuarios/me");
    setUser(me);
  }

  function logout() {
    clearToken();
    setUser(null);
  }

  function can(module: string, action: string): boolean {
    if (!user) return false;
    const role = user.role?.nome ?? "";
    
    // ADMIN sempre pode ver/fazer tudo
    if (role === "ADMIN") return true;

    // Se o usuário tem permissões dinâmicas definidas, usamos elas prioritariamente
    if (user.permissoes !== undefined && user.permissoes !== null) {
        const permitidos = user.permissoes.split(",").map(s => s.trim());
        if (permitidos.includes(module)) {
            return true;
        }
        // Se a string existir (mesmo vazia) e não contiver o módulo, barra o acesso.
        // Exceto se for uma permissão interna específica. Para menu, barra.
        return false;
    }

    // Fallback para usuários antigos
    return permissions[role]?.[module]?.[action] ?? false;
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, can }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
