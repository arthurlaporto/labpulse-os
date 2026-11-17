import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { api, ApiError } from "./api";
import { useAuth } from "./auth";
import type { EntityKey, Row, StoreKey } from "./types";

// Rota de cada coleção na API do Nest.
const ROTAS: Record<StoreKey, string> = {
  usuarios: "/usuarios",
  usuariosOpcoes: "/usuarios/opcoes",
  campi: "/campi",
  laboratorios: "/laboratorios",
  equipamentos: "/equipamentos",
  projetos: "/projetos",
  servicos: "/registros-uso",
  manutencao: "/manutencoes",
};

type Store = Record<StoreKey, Row[]>;
const vazio: Store = {
  usuarios: [], usuariosOpcoes: [], campi: [], laboratorios: [],
  equipamentos: [], projetos: [], servicos: [], manutencao: [],
};

interface Ctx {
  data: Store;
  loading: boolean;
  error: string | null;
  reload: () => Promise<void>;
  add: (key: EntityKey, body: unknown) => Promise<void>;
  update: (key: EntityKey, id: number, body: unknown) => Promise<void>;
  remove: (key: EntityKey, id: number) => Promise<void>;
  /** Nome legível de uma linha referenciada (chave estrangeira) */
  labelOf: (key: StoreKey, id: unknown) => string;
}
const DataCtx = createContext<Ctx | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const admin = user?.tipoUsuario === "ADMINISTRADOR";
  const [data, setData] = useState<Store>(vazio);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    try {
      // A lista completa de usuários (com e-mail e CPF) é só do administrador.
      const chaves = (Object.keys(ROTAS) as StoreKey[]).filter((k) => k !== "usuarios" || admin);
      const listas = await Promise.all(chaves.map((k) => api.list<Row>(ROTAS[k])));
      setData({ ...vazio, ...Object.fromEntries(chaves.map((k, i) => [k, listas[i]])) } as Store);
      setError(null);
    } catch (e) {
      setError(e instanceof ApiError ? e.messages[0] : "Erro ao carregar os dados.");
    } finally {
      setLoading(false);
    }
  }, [admin]);

  useEffect(() => { void reload(); }, [reload]);

  // Depois de cada alteração, recarrega tudo: um uso concluído, por exemplo,
  // muda as horas do equipamento, e os gráficos precisam refletir isso.
  const add: Ctx["add"] = async (key, body) => { await api.create(ROTAS[key], body); await reload(); };
  const update: Ctx["update"] = async (key, id, body) => { await api.update(ROTAS[key], id, body); await reload(); };
  const remove: Ctx["remove"] = async (key, id) => { await api.remove(ROTAS[key], id); await reload(); };

  const labelOf: Ctx["labelOf"] = (key, id) => {
    const lista = key === "usuarios" ? data.usuariosOpcoes : data[key];
    const row = lista.find((r) => r.id === Number(id));
    if (!row) return "—";
    return String(row.nome ?? row.titulo ?? row.numeroOs ?? row.numeroRegistro ?? row.id);
  };

  return (
    <DataCtx.Provider value={{ data, loading, error, reload, add, update, remove, labelOf }}>
      {children}
    </DataCtx.Provider>
  );
}

export const useData = () => {
  const ctx = useContext(DataCtx);
  if (!ctx) throw new Error("useData fora do DataProvider");
  return ctx;
};
