const BASE = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export class ApiError extends Error {
  constructor(public status: number, public messages: string[]) {
    super(messages.join(" "));
  }
}

let token: string | null = null;
let aoExpirar: (() => void) | null = null;

export const setToken = (t: string | null) => { token = t; };
export const setAoExpirar = (fn: (() => void) | null) => { aoExpirar = fn; };

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${BASE}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...init?.headers,
      },
    });
  } catch {
    throw new ApiError(0, ["Não foi possível conectar à API. Verifique se o back-end está rodando."]);
  }

  if (!res.ok) {
    let messages = ["Erro inesperado no servidor."];
    if (res.status >= 500) {
      messages = ["O servidor não conseguiu concluir a operação. Verifique se há dados duplicados (como e-mail ou código) ou vinculados a outros registros."];
    } else {
      try {
        const body = await res.json();
        if (body.message) messages = Array.isArray(body.message) ? body.message : [body.message];
      } catch { /* mantém a mensagem padrão */ }
    }
    // Token vencido ou inválido: derruba a sessão.
    if (res.status === 401 && token) aoExpirar?.();
    throw new ApiError(res.status, messages);
  }
  return res.json() as Promise<T>;
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "POST", body: JSON.stringify(body) }),
  list: <T>(path: string) => request<T[]>(path),
  create: (path: string, body: unknown) =>
    request(path, { method: "POST", body: JSON.stringify(body) }),
  update: (path: string, id: number, body: unknown) =>
    request(`${path}/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
  remove: (path: string, id: number) => request(`${path}/${id}`, { method: "DELETE" }),
};
