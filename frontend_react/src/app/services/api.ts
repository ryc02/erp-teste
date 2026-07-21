import { toast } from "sonner";

export const API_BASE = import.meta.env.VITE_API_URL ?? (import.meta.env.PROD ? "/api/v1" : "http://localhost:8000/api/v1");

export const TOKEN_KEY = "venner_jwt";

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

export class ApiError extends Error {
  response?: { data: any };
  constructor(message: string, data?: any) {
    super(message);
    this.name = "ApiError";
    this.response = { data };
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getToken();
  const empresaId = localStorage.getItem("empresa_ativa");
  
  const headers: Record<string, string> = {
    ...(init.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  if (empresaId) headers["X-Empresa-Id"] = empresaId;

  const res = await fetch(`${API_BASE}${path}`, { ...init, headers });

  if (res.status === 401 && !path.includes("/auth/login")) {
    clearToken();
    toast.error("Sessão expirada. Faça login novamente.");
    setTimeout(() => {
      window.location.href = "/";
    }, 600);
    throw new Error("Sessão expirada");
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const errorMsg = typeof body?.detail === 'string' ? body.detail : `Erro ${res.status}`;
    throw new ApiError(errorMsg, body);
  }

  // 204 No Content
  if (res.status === 204) return undefined as T;
  return res.json();
}

export const api = {
  get: <T>(path: string) => request<T>(path, { method: "GET" }),

  post: <T>(path: string, body?: unknown, formData?: URLSearchParams) => {
    if (formData) {
      return request<T>(path, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: formData.toString(),
      });
    }
    return request<T>(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  },

  put: <T>(path: string, body: unknown) =>
    request<T>(path, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),

  patch: <T>(path: string, body: unknown) =>
    request<T>(path, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),

  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};
