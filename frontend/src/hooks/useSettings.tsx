import { createContext, useContext, useEffect, type ReactNode } from "react";
import { useLocalStorage } from "./useLocalStorage";

export interface Settings {
  escuro: boolean;
  nome: string;
  email: string;
  papel: string;
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
  nome: "Usuário",
  email: "",
  papel: "Administrador",
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

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [stored, setStored] = useLocalStorage<Settings>("labpulse:settings", defaultSettings);
  const settings = { ...defaultSettings, ...stored };
  const update: Ctx["update"] = (patch) => setStored((s) => ({ ...defaultSettings, ...s, ...patch }));

  useEffect(() => { document.documentElement.classList.toggle("dark", settings.escuro); }, [settings.escuro]);

  return <SettingsCtx.Provider value={{ settings, update }}>{children}</SettingsCtx.Provider>;
}

export const useSettings = () => {
  const ctx = useContext(SettingsCtx);
  if (!ctx) throw new Error("useSettings fora do SettingsProvider");
  return ctx;
};
