import { useEffect, useRef, useState, type RefObject } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, CheckCheck, ClipboardList, Hand, LogOut, Moon, Search, Sun, TriangleAlert, type LucideIcon } from "lucide-react";
import { useAuth } from "../auth";
import { useData } from "../data";
import { entities } from "../entities";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { useSettings } from "../hooks/useSettings";
import { haystack, norm } from "../search";

const iconBtn =
  "relative grid size-8 place-items-center rounded-md text-neutral-500 hover:bg-neutral-100 focus-visible:outline-2 focus-visible:outline-brand dark:hover:bg-neutral-800";
const painel =
  "absolute z-40 mt-2 overflow-y-auto rounded-lg border border-neutral-100 bg-white shadow-lg dark:border-neutral-800 dark:bg-neutral-900";

function useFora(ref: RefObject<HTMLElement | null>, fechar: () => void) {
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) fechar();
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [ref, fechar]);
}

interface Aviso { key: string; texto: string; detalhe: string; to: string; icone: LucideIcon }

export function Header() {
  const { settings, update } = useSettings();
  const auth = useAuth() as ReturnType<typeof useAuth> & { logout?: () => void };
  const { user, logout } = auth;
  const { data, labelOf } = useData();
  const navigate = useNavigate();
  const dark = settings.escuro;

  // Dados vivos do cadastro: se o nome ou o perfil mudar, o cabeçalho acompanha.
  const atual = data.usuariosOpcoes.find((u) => u.id === user?.id);
  const nome = String(atual?.nome ?? user?.nome ?? "");
  const perfilValor = String(atual?.tipoUsuario ?? user?.tipoUsuario ?? "");
  const rotuloPerfil = entities.usuarios.fields
    .find((f) => f.name === "tipoUsuario")?.options?.find((o) => o.value === perfilValor)?.label;
  const funcao =
    perfilValor === "RESPONSAVEL_EQUIPAMENTO" && atual?.vinculoInstitucional === "Técnico de laboratório"
      ? "Técnico de laboratório"
      : rotuloPerfil;

  // ---------- busca ----------
  const [busca, setBusca] = useState("");
  const [buscaAberta, setBuscaAberta] = useState(false);
  const buscaRef = useRef<HTMLDivElement>(null);
  useFora(buscaRef, () => setBuscaAberta(false));

  const q = norm(busca.trim());
  const grupos =
    q.length < 2
      ? []
      : Object.values(entities)
          .map((entity) => ({
            entity,
            itens: data[entity.key].filter((r) => haystack(entity, r, labelOf).includes(q)),
          }))
          .filter((g) => g.itens.length > 0);

  const irParaBusca = (path: string) => {
    navigate(`${path}?busca=${encodeURIComponent(busca.trim())}`);
    setBuscaAberta(false);
    setBusca("");
  };

  // ---------- notificações ----------
  const [notifAberta, setNotifAberta] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  useFora(notifRef, () => setNotifAberta(false));
  const [lidas, setLidas] = useLocalStorage<string[]>("labpulse:lidas", []);

  const avisos: Aviso[] = [];
  for (const e of data.equipamentos) {
    const nome = String(e.nome);
    if (settings.notifInoperante && e.statusOperacionalidade === "INOPERANTE")
      avisos.push({ key: `inop-${e.id}`, texto: `${nome} está inoperante`, detalhe: "Indisponível para uso", to: "/equipamentos", icone: TriangleAlert });
    if (settings.notifInoperante && e.statusOperacionalidade === "COM_RESTRICOES")
      avisos.push({ key: `restr-${e.id}`, texto: `${nome} está com restrições`, detalhe: "Uso com limitações", to: "/equipamentos", icone: TriangleAlert });
    const vida = Number(e.vidaUtilEstimadaHoras);
    const uso = Number(e.horasUsoAcumuladas) || 0;
    if (settings.notifVidaUtil && vida > 0 && (uso / vida) * 100 >= settings.vidaUtilAlerta)
      avisos.push({ key: `vida-${e.id}`, texto: `${nome} consumiu ${Math.round((uso / vida) * 100)}% da vida útil`, detalhe: `${uso} de ${vida} horas`, to: "/equipamentos", icone: TriangleAlert });
  }
  if (settings.notifManutencao)
    for (const m of data.manutencao.filter((x) => x.status === "ABERTA"))
      avisos.push({ key: `man-${m.id}`, texto: `${m.numeroOs} aberta`, detalhe: String(m.descricao), to: "/manutencao", icone: ClipboardList });
  if (settings.notifNovoUso)
    for (const s of data.servicos.filter((x) => x.status === "SOLICITADO"))
      avisos.push({ key: `uso-${s.id}`, texto: `${s.numeroRegistro} aguarda aprovação`, detalhe: labelOf("equipamentos", s.equipamentoId), to: "/servicos", icone: Hand });

  const naoLidas = avisos.filter((a) => !lidas.includes(a.key));
  const abrirAviso = (a: Aviso) => {
    setLidas((l) => (l.includes(a.key) ? l : [...l, a.key]));
    setNotifAberta(false);
    navigate(a.to);
  };

  // ---------- perfil / logoff ----------
  const [perfilAberta, setPerfilAberta] = useState(false);
  const perfilRef = useRef<HTMLDivElement>(null);
  useFora(perfilRef, () => setPerfilAberta(false));

  const sair = () => {
    setPerfilAberta(false);
    if (logout) {
      logout();
    } else {
      localStorage.clear();
      sessionStorage.clear();
    }
    navigate("/login");
  };

  return (
    <header className="flex items-center justify-between gap-4 px-4 py-4">
      <div ref={buscaRef} className="relative w-full max-w-110"
        onKeyDown={(e) => e.key === "Escape" && setBuscaAberta(false)}>
        <label className="flex items-center gap-2.5 rounded-lg bg-neutral-50 px-2.5 py-1.5 text-neutral-400 focus-within:ring-2 focus-within:ring-brand dark:bg-neutral-900">
          <Search size={16} />
          <input
            type="search"
            value={busca}
            placeholder="procurar serviços, laboratórios..."
            aria-label="Buscar"
            className="w-full bg-transparent text-[13px] text-black outline-none placeholder:text-neutral-400 dark:text-white"
            onChange={(e) => { setBusca(e.target.value); setBuscaAberta(true); }}
            onFocus={() => setBuscaAberta(true)}
            onKeyDown={(e) => { if (e.key === "Enter" && grupos[0]) irParaBusca(grupos[0].entity.path); }}
          />
        </label>
        {buscaAberta && q.length >= 2 && (
          <div className={`${painel} left-0 max-h-96 w-full`}>
            {grupos.length === 0 ? (
              <p className="px-4 py-3 text-[13px] text-neutral-500">Nenhum resultado para “{busca.trim()}”.</p>
            ) : (
              grupos.map(({ entity, itens }) => (
                <div key={entity.key} className="border-b border-neutral-100 py-1 last:border-0 dark:border-neutral-800">
                  <p className="px-4 pb-0.5 pt-2 text-[11px] font-bold uppercase tracking-wide text-neutral-400">
                    {entity.title} ({itens.length})
                  </p>
                  {itens.slice(0, 4).map((r) => (
                    <button key={r.id} onClick={() => irParaBusca(entity.path)}
                      className="block w-full truncate px-4 py-1.5 text-left text-[13px] hover:bg-neutral-50 dark:hover:bg-neutral-800">
                      {String(r.nome ?? r.titulo ?? r.numeroOs ?? r.numeroRegistro ?? r.id)}
                    </button>
                  ))}
                  {itens.length > 4 && (
                    <button onClick={() => irParaBusca(entity.path)}
                      className="block w-full px-4 py-1.5 text-left text-[12px] font-semibold text-brand hover:bg-neutral-50 dark:hover:bg-neutral-800">
                      Ver todos os {itens.length}
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        <button className={iconBtn} onClick={() => update({ escuro: !dark })} aria-label={dark ? "Usar tema claro" : "Usar tema escuro"}>
          {dark ? <Sun size={15} /> : <Moon size={15} />}
        </button>

        <div ref={notifRef} className="relative" onKeyDown={(e) => e.key === "Escape" && setNotifAberta(false)}>
          <button className={iconBtn} aria-label={`Notificações${naoLidas.length ? `, ${naoLidas.length} não lidas` : ""}`}
            aria-expanded={notifAberta} onClick={() => setNotifAberta((a) => !a)}>
            <Bell size={15} />
            {naoLidas.length > 0 && (
              <span className="absolute -right-0.5 -top-0.5 grid min-w-4 place-items-center rounded-full bg-red-600 px-1 text-[10px] font-bold leading-4 text-white">
                {naoLidas.length > 9 ? "9+" : naoLidas.length}
              </span>
            )}
          </button>
          {notifAberta && (
            <div className={`${painel} right-0 max-h-96 w-80`}>
              <div className="flex items-center justify-between border-b border-neutral-100 px-4 py-2.5 dark:border-neutral-800">
                <h2 className="text-[13px] font-bold">Notificações</h2>
                {naoLidas.length > 0 && (
                  <button onClick={() => setLidas(avisos.map((a) => a.key))}
                    className="flex items-center gap-1 text-[12px] font-semibold text-brand">
                    <CheckCheck size={13} /> Marcar todas como lidas
                  </button>
                )}
              </div>
              {avisos.length === 0 ? (
                <p className="px-4 py-6 text-center text-[13px] text-neutral-500">Nada por aqui. Tudo em dia.</p>
              ) : (
                avisos.map((a) => {
                  const lida = lidas.includes(a.key);
                  return (
                    <button key={a.key} onClick={() => abrirAviso(a)}
                      className="flex w-full items-start gap-3 border-b border-neutral-100 px-4 py-2.5 text-left last:border-0 hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-800">
                      <a.icone size={15} className={`mt-0.5 shrink-0 ${lida ? "text-neutral-400" : "text-amber-600"}`} />
                      <span className="min-w-0 flex-1">
                        <span className={`block truncate text-[13px] ${lida ? "text-neutral-500" : "font-semibold"}`}>{a.texto}</span>
                        <span className="block truncate text-[12px] text-neutral-500">{a.detalhe}</span>
                      </span>
                      {!lida && <span className="mt-1.5 size-2 shrink-0 rounded-full bg-brand" aria-label="não lida" />}
                    </button>
                  );
                })
              )}
            </div>
          )}
        </div>

        <div ref={perfilRef} className="relative" onKeyDown={(e) => e.key === "Escape" && setPerfilAberta(false)}>
          <button
            type="button"
            onClick={() => setPerfilAberta((a) => !a)}
            aria-expanded={perfilAberta}
            className="flex items-center gap-2.5 rounded-lg p-1 text-left transition-colors hover:bg-neutral-100 focus-visible:outline-2 focus-visible:outline-brand dark:hover:bg-neutral-800"
          >
            <span aria-hidden className="grid size-8 place-items-center rounded-full bg-brand/10 text-[13px] font-bold text-brand">
              {nome.charAt(0).toUpperCase()}
            </span>
            <div className="max-w-44 text-[13px] leading-tight">
              <div className="truncate font-semibold">{nome}</div>
              <div className="truncate text-[12px] text-neutral-500">{funcao}</div>
            </div>
          </button>

          {perfilAberta && (
            <div className={`${painel} right-0 w-44 py-1`}>
              <button
                type="button"
                onClick={sair}
                className="flex w-full items-center gap-2 px-4 py-2 text-left text-[13px] font-medium text-red-600 hover:bg-neutral-50 dark:text-red-400 dark:hover:bg-neutral-800"
              >
                <LogOut size={15} />
                Sair da conta
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
