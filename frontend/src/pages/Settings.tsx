import { useState, type ReactNode } from "react";
import { Download, Trash2 } from "lucide-react";
import { Modal } from "../components/Modal";
import { useData } from "../data";
import { defaultSettings, useSettings, type Settings as S } from "../hooks/useSettings";

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
      <input type="range" min={10} max={100} step={5} value={value} className="w-full accent-brand"
        onChange={(e) => onChange(Number(e.target.value))} />
    </div>
  );
}

const Field = ({ label, children }: { label: string; children: ReactNode }) => (
  <div>
    <label className="mb-1 block text-[12px] font-semibold text-neutral-600 dark:text-neutral-300">{label}</label>
    {children}
  </div>
);

export function Settings() {
  const { settings: s, update } = useSettings();
  const { data } = useData();
  const [confirmReset, setConfirmReset] = useState(false);

  const exportData = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `labpulse-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const resetAll = () => {
    localStorage.removeItem("labpulse:data");
    location.reload();
  };

  const notifs: [keyof S, string, string][] = [
    ["notifNovoUso", "Novos pedidos de uso", "Avisar quando alguém solicitar um equipamento."],
    ["notifManutencao", "Ordens de manutenção", "Avisar ao abrir ou encerrar uma ordem de serviço."],
    ["notifInoperante", "Equipamento inoperante", "Avisar quando um ativo mudar para inoperante ou com restrições."],
    ["notifVidaUtil", "Fim de vida útil", "Avisar quando um ativo atingir o limite de vida útil abaixo."],
  ];

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-extrabold tracking-tight">Configurações</h1>
      <p className="mb-4 text-[15px]">Ajuste a plataforma ao jeito do seu laboratório. As alterações são salvas automaticamente.</p>

      <Section title="Perfil" hint="Como você aparece no topo da plataforma.">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Nome">
            <input className={input} value={s.nome} onChange={(e) => update({ nome: e.target.value })} />
          </Field>
          <Field label="E-mail institucional">
            <input className={input} type="email" placeholder="nome@id.uff.br" value={s.email} onChange={(e) => update({ email: e.target.value })} />
          </Field>
          <Field label="Papel">
            <select className={input} value={s.papel} onChange={(e) => update({ papel: e.target.value })}>
              {["Administrador", "Coordenador do laboratório", "Responsável pelo equipamento", "Técnico de laboratório", "Usuário interno UFF", "Usuário externo"].map((p) => <option key={p}>{p}</option>)}
            </select>
          </Field>
        </div>
      </Section>

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

      <Section title="Alertas de equipamentos" hint="Os limites usados na Visão Geral para destacar ativos que precisam de atenção.">
        <Slider label="Desempenho mínimo" hint="Equipamentos abaixo desse desempenho entram na lista de alertas."
          value={s.desempenhoMinimo} onChange={(v) => update({ desempenhoMinimo: v })} />
        <Slider label="Vida útil consumida" hint="Equipamentos que passarem dessa fração da vida útil estimada entram na lista de alertas."
          value={s.vidaUtilAlerta} onChange={(v) => update({ vidaUtilAlerta: v })} />
      </Section>

      <Section title="Notificações" hint="Escolha o que merece um aviso. As preferências ficam salvas para quando o envio for ligado ao back-end.">
        {notifs.map(([k, label, hint]) => (
          <Switch key={k} label={label} hint={hint} checked={s[k] as boolean} onChange={(v) => update({ [k]: v })} />
        ))}
      </Section>

      <Section title="Campus padrão" hint="Já vem selecionado ao cadastrar um novo laboratório.">
        <select className={input} value={s.campusPadrao} onChange={(e) => update({ campusPadrao: e.target.value })} aria-label="Campus padrão">
          <option>Vila Santa Cecília</option>
          <option>Aterrado</option>
        </select>
      </Section>

      <Section title="Dados" hint="Tudo fica guardado neste navegador.">
        <div className="flex flex-wrap gap-2">
          <button onClick={exportData}
            className="flex items-center gap-2 rounded-md bg-neutral-50 px-4 py-2 text-[13px] font-semibold hover:bg-neutral-100 dark:bg-neutral-900 dark:hover:bg-neutral-800">
            <Download size={15} /> Exportar cópia (JSON)
          </button>
          <button onClick={() => setConfirmReset(true)}
            className="flex items-center gap-2 rounded-md px-4 py-2 text-[13px] font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-950">
            <Trash2 size={15} />
          </button>
          <button onClick={() => update(defaultSettings)}
            className="rounded-md px-4 py-2 text-[13px] font-semibold text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800">
            Restaurar configurações
          </button>
        </div>
      </Section>

      {confirmReset && (
        <Modal title="Apagar todos os dados" onClose={() => setConfirmReset(false)}>
          <p className="px-6 py-4 text-[13px]">
            Isso remove todos os serviços, usuários, laboratórios, equipamentos e manutenções cadastrados. Exporte uma cópia antes se quiser guardá-los. Não dá para desfazer.
          </p>
          <div className="flex justify-end gap-2 border-t border-neutral-100 px-6 py-3 dark:border-neutral-800">
            <button onClick={() => setConfirmReset(false)} className="rounded-md px-4 py-2 text-[13px] font-semibold text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800">Cancelar</button>
            <button onClick={resetAll} className="rounded-md bg-red-600 px-4 py-2 text-[13px] font-semibold text-white hover:bg-red-700">Apagar tudo</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
