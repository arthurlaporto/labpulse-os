import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useAuth } from "../auth";

export interface Settings {
  escuro: boolean;
  campusPadrao: string;
  desempenhoMinimo: number; // % abaixo do qual o equipamento gera alerta
  vidaUtilAlerta: number;   // % da vida útil consumida que gera alerta
  notifNovoUso: boolean;
  notifManutencao: boolean;
  notifInoperante: boolean;
  notifVidaUtil: boolean;
}

export const defaultSettings: Settings = {
  escuro: false,
  campusPadrao: "Vila Santa Cecília",
  desempenhoMinimo: 70,
  vidaUtilAlerta: 80,
  notifNovoUso: true,
  notifManutencao: true,
  notifInoperante: true,
  notifVidaUtil: false,
};

interface Ctx { settings: Settings; update: (patch: Partial<Settings>) => void }
const SettingsCtx = createContext<Ctx | null>(null);

function ler(key: string): Settings {
  try {
    const raw = localStorage.getItem(key);
    return { ...defaultSettings, ...(raw ? JSON.parse(raw) : {}) };
  } catch {
    return defaultSettings;
  }
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  // Cada usuário tem a sua própria chave; antes do login vale a chave "visitante".
  const key = `labpulse:settings:${user?.id ?? "visitante"}`;
  const [settings, setSettings] = useState<Settings>(() => ler(key));

  // Ao trocar de usuário, carrega as preferências dele.
  useEffect(() => { setSettings(ler(key)); }, [key]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", settings.escuro);
  }, [settings.escuro]);

  const update: Ctx["update"] = (patch) =>
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      try { localStorage.setItem(key, JSON.stringify(next)); } catch { /* ignora */ }
      return next;
    });

  return <SettingsCtx.Provider value={{ settings, update }}>{children}</SettingsCtx.Provider>;
}

export const useSettings = () => {
  const ctx = useContext(SettingsCtx);
  if (!ctx) throw new Error("useSettings fora do SettingsProvider");
  return ctx;
};
