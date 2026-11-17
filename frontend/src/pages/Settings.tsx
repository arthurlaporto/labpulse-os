import type { ReactNode } from "react";
import { Download, LogOut } from "lucide-react";
import { useAuth } from "../auth";
import { ACESSO, gerencia } from "../cargos";
import { useData } from "../data";
import { defaultSettings, useSettings, type Settings as S } from "../hooks/useSettings";
import { can } from "../permissions";

const input =
  "w-full rounded-md border border-neutral-200 bg-white px-2.5 py-2 text-[13px] outline-none focus:border-brand focus:ring-2 focus:ring-brand/30 dark:border-neutral-700 dark:bg-neutral-950";

function Section({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
  return (
    <section className="grid gap-4 border-t border-neutral-100 py-6 first:border-t-0 md:grid-cols-[220px_1fr] dark:border-neutral-800">
      <div>
        <h2 className="text-[15px] font-bold">{title}</h2>
        {hint && <p className="mt-1 text-[13px] text-neutral-500">{hint}</p>}
      </div>
      <div className="flex flex-col gap-4">{children}</div>
    </section>
  );
}

function Switch({ checked, onChange, label, hint }: { checked: boolean; onChange: (v: boolean) => void; label: string; hint: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <div className="text-[13px] font-semibold">{label}</div>
        <div className="text-[12px] text-neutral-500">{hint}</div>
      </div>
      <button role="switch" aria-checked={checked} aria-label={label} onClick={() => onChange(!checked)}
        className={`relative h-6 w-10 shrink-0 rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${checked ? "bg-brand" : "bg-neutral-300 dark:bg-neutral-700"}`}>
        <span className={`absolute left-0.5 top-0.5 size-5 rounded-full bg-white transition-transform ${checked ? "translate-x-4" : ""}`} />
      </button>
    </div>
  );
}

function Slider({ label, hint, value, onChange }: { label: string; hint: string; value: number; onChange: (v: number) => void }) {
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <label className="text-[13px] font-semibold">{label}</label>
        <span className="text-[13px] font-bold tabular-nums">{value}%</span>
      </div>
      <p className="mb-1 text-[12px] text-neutral-500">{hint}</p>
      <input type="range" min={10} max={100} step={5} value={value} className="w-full accent-\[\#0873d6\]"
        onChange={(e) => onChange(Number(e.target.value))} />
    </div>
  );
}

export function Settings() {
  const { settings: s, update } = useSettings();
  const { user, logout } = useAuth();
  const { data } = useData();

  const tipo = user?.tipoUsuario;
  const acesso = ACESSO[tipo ?? ""];
  const gestor = gerencia(tipo);
  const criaLaboratorio = can(tipo, "laboratorios", "create");
  const podeExportar = tipo === "ADMINISTRADOR" || tipo === "COORDENADOR_LABORATORIO";

  const exportData = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `labpulse-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  // As notificações oferecidas dependem do cargo.
  const notifs: [keyof S, string, string][] = gestor
    ? [
        ["notifNovoUso", "Novos pedidos de uso", "Avisar quando alguém solicitar um equipamento."],
        ["notifManutencao", "Ordens de manutenção", "Avisar sobre ordens de manutenção abertas."],
        ["notifInoperante", "Equipamento inoperante", "Avisar quando um ativo ficar inoperante ou com restrições."],
        ["notifVidaUtil", "Fim de vida útil", "Avisar quando um ativo atingir o limite de vida útil definido acima."],
      ]
    : tipo === "EXTERNO"
      ? [["notifNovoUso", "Meus pedidos de uso", "Avisar sobre os meus pedidos que aguardam aprovação."]]
      : [
          ["notifNovoUso", "Meus pedidos de uso", "Avisar sobre os meus pedidos que aguardam aprovação."],
          ["notifManutencao", "Minhas manutenções", "Avisar sobre as ordens que abri e ainda estão abertas."],
        ];

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-extrabold tracking-tight">Configurações</h1>
      <p className="mb-4 text-[15px]">
        Preferências da sua conta. Elas valem só para você e mudam de acordo com o seu cargo.
      </p>

      <Section title="Perfil" hint="Sua conta na plataforma.">
        <div className="text-[13px]">
          <div className="font-semibold">{user?.nome}</div>
          <div className="text-neutral-500">{user?.email}</div>
          <div className="mt-1 inline-block rounded-full bg-brand/10 px-2.5 py-0.5 text-[12px] font-semibold text-brand">
            {acesso?.cargo ?? tipo}
          </div>
        </div>
        <button onClick={logout}
          className="flex w-fit items-center gap-2 rounded-md bg-neutral-50 px-4 py-2 text-[13px] font-semibold hover:bg-neutral-100 dark:bg-neutral-900 dark:hover:bg-neutral-800">
          <LogOut size={15} /> Sair
        </button>
      </Section>

      {acesso && (
        <Section title="Seu acesso" hint="O que o seu cargo permite na plataforma.">
          <div>
            <h3 className="text-[13px] font-semibold">O que você vê</h3>
            <p className="text-[13px] text-neutral-600 dark:text-neutral-300">{acesso.ve}</p>
          </div>
          <div>
            <h3 className="text-[13px] font-semibold">O que você pode fazer</h3>
            <p className="text-[13px] text-neutral-600 dark:text-neutral-300">{acesso.faz}</p>
          </div>
        </Section>
      )}

      <Section title="Aparência" hint="Escolha o tema da interface.">
        <div className="inline-flex w-fit rounded-lg bg-neutral-50 p-1 dark:bg-neutral-900" role="radiogroup" aria-label="Tema">
          {[{ v: false, l: "Claro" }, { v: true, l: "Escuro" }].map(({ v, l }) => (
            <button key={l} role="radio" aria-checked={s.escuro === v} onClick={() => update({ escuro: v })}
              className={`rounded-md px-4 py-1.5 text-[13px] font-semibold ${s.escuro === v ? "bg-brand text-white" : "text-neutral-500"}`}>
              {l}
            </button>
          ))}
        </div>
      </Section>

      {gestor && (
        <Section title="Alertas de equipamentos" hint="Os limites usados na Visão Geral para destacar ativos que precisam de atenção.">
          <Slider label="Desempenho mínimo" hint="Equipamentos abaixo desse desempenho entram na lista de alertas."
            value={s.desempenhoMinimo} onChange={(v) => update({ desempenhoMinimo: v })} />
          <Slider label="Vida útil consumida" hint="Equipamentos que passarem dessa fração da vida útil estimada entram na lista de alertas."
            value={s.vidaUtilAlerta} onChange={(v) => update({ vidaUtilAlerta: v })} />
        </Section>
      )}

      <Section title="Notificações" hint="Escolha o que aparece no sino do topo.">
        {notifs.map(([k, label, hint]) => (
          <Switch key={k} label={label} hint={hint} checked={s[k] as boolean} onChange={(v) => update({ [k]: v })} />
        ))}
      </Section>

      {criaLaboratorio && (
        <Section title="Campus padrão" hint="Já vem selecionado ao cadastrar um novo laboratório.">
          <select className={input} value={s.campusPadrao} onChange={(e) => update({ campusPadrao: e.target.value })} aria-label="Campus padrão">
            <option>Vila Santa Cecília</option>
            <option>Aterrado</option>
          </select>
        </Section>
      )}

      <Section title="Dados" hint="Os dados ficam salvos no servidor, no banco PostgreSQL.">
        <div className="flex flex-wrap gap-2">
          {podeExportar && (
            <button onClick={exportData}
              className="flex items-center gap-2 rounded-md bg-neutral-50 px-4 py-2 text-[13px] font-semibold hover:bg-neutral-100 dark:bg-neutral-900 dark:hover:bg-neutral-800">
              <Download size={15} /> Exportar cópia (JSON)
            </button>
          )}
          <button onClick={() => update(defaultSettings)}
            className="rounded-md px-4 py-2 text-[13px] font-semibold text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800">
            Restaurar minhas configurações
          </button>
        </div>
      </Section>
    </div>
  );
}
