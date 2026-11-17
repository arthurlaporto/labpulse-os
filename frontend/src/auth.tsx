import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { api, setAoExpirar, setToken } from "./api";

export interface AuthUser { id: number; nome: string; email: string; tipoUsuario: string }

interface Ctx {
  user: AuthUser | null;
  loading: boolean;
  aviso: string | null;
  login: (email: string, senha: string) => Promise<void>;
  logout: () => void;
}
const AuthCtx = createContext<Ctx | null>(null);
const CHAVE = "labpulse:token";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [aviso, setAviso] = useState<string | null>(null);

  const logout = useCallback(() => {
    setToken(null);
    localStorage.removeItem(CHAVE);
    setUser(null);
  }, []);

  useEffect(() => {
    setAoExpirar(() => {
      logout();
      setAviso("Sua sessão expirou. Entre novamente.");
    });
    const salvo = localStorage.getItem(CHAVE);
    if (!salvo) { setLoading(false); return; }
    setToken(salvo);
    api.get<AuthUser>("/auth/me")
      .then(setUser)
      .catch(logout)
      .finally(() => setLoading(false));
  }, [logout]);

  const login: Ctx["login"] = async (email, senha) => {
    setAviso(null);
    const r = await api.post<{ accessToken: string; usuario: AuthUser }>("/auth/login", { email, senha });
    setToken(r.accessToken);
    localStorage.setItem(CHAVE, r.accessToken);
    setUser(r.usuario);
  };

  return <AuthCtx.Provider value={{ user, loading, aviso, login, logout }}>{children}</AuthCtx.Provider>;
}

export const useAuth = () => {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error("useAuth fora do AuthProvider");
  return ctx;
};
