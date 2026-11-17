import { TriangleAlert } from "lucide-react";
import { BarChart, ChartCard, DonutChart, HBarList } from "../components/Charts";
import { useData } from "../data";
import { STATUS_EQUIPAMENTO } from "../entities";
import { useSettings } from "../hooks/useSettings";
import { useAuth } from "../auth"

export function Overview() {
  const { data } = useData();
  const { settings } = useSettings();
  const { user } = useAuth();

  const admin = user?.tipoUsuario === "ADMINISTRADOR";
  const totals: [string, number][] = [
    ["Serviços", data.servicos.length],
    ...(admin ? ([["Usuários", data.usuarios.length]] as [string, number][]) : []),
    ["Laboratórios", data.laboratorios.length],
    ["Equipamentos", data.equipamentos.length],
    ["Manutenções abertas", data.manutencao.filter((m) => m.status === "ABERTA").length],
  ] as const;

  const statusColors = ["#2ca02c", "#0873d6", "#ff7f0e", "#d62728", "#9ca3af"];
  const porEstado = STATUS_EQUIPAMENTO.map((s, i) => ({
    label: s.label,
    color: statusColors[i],
    value: data.equipamentos.filter((e) => e.statusOperacionalidade === s.value).length,
  }));

  const porTipo = [
    { label: "Corretiva", valor: "CORRETIVA", color: "#ff7f0e" },
    { label: "Preventiva", valor: "PREVENTIVA", color: "#0873d6" },
    { label: "Preditiva", valor: "PREDITIVA", color: "#2ca02c" },
  ].map((t) => ({
    label: t.label,
    color: t.color,
    value: data.manutencao.filter((m) => m.tipo === t.valor).length,
  }));

  // Registros de uso nos últimos 6 meses
  const now = new Date();
  const meses = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const nome = d.toLocaleDateString("pt-BR", { month: "short" }).replace(".", "");
    return { key, label: nome.charAt(0).toUpperCase() + nome.slice(1) };
  });
  const usoPorMes = meses.map((m) => ({
    label: m.label,
    value: data.servicos.filter((sv) => String(sv.dataInicio).startsWith(m.key)).length,
  }));

  // Vida útil consumida (ciclo de vida do ativo)
  const vidaUtil = data.equipamentos
    .filter((e) => Number(e.vidaUtilEstimadaHoras) > 0)
    .map((e) => {
      const uso = Number(e.horasUsoAcumuladas) || 0;
      const vida = Number(e.vidaUtilEstimadaHoras);
      const pct = (uso / vida) * 100;
      const color = pct >= settings.vidaUtilAlerta ? "#d62728" : pct >= settings.vidaUtilAlerta * 0.75 ? "#ff7f0e" : "#2ca02c";
      return { label: String(e.nome), pct, color, detail: `${Math.round(pct)}% · ${uso}/${vida} h` };
    })
    .sort((a, b) => b.pct - a.pct)
    .slice(0, 6);

  // Uso compartilhado: registros por laboratório (via equipamento)
  const labDoEquip = new Map(data.equipamentos.map((e) => [e.id, e.laboratorioId]));
  const usoPorLab = data.laboratorios
    .map((l) => ({
      nome: String(l.nome),
      n: data.servicos.filter((sv) => labDoEquip.get(Number(sv.equipamentoId)) === l.id).length,
    }))
    .sort((a, b) => b.n - a.n)
    .slice(0, 6);
  const maxLab = Math.max(1, ...usoPorLab.map((l) => l.n));
  const usoLabItems = usoPorLab.some((l) => l.n > 0)
    ? usoPorLab.map((l) => ({
        label: l.nome,
        pct: (l.n / maxLab) * 100,
        color: "#0873d6",
        detail: `${l.n} ${l.n === 1 ? "registro" : "registros"}`,
      }))
    : [];

  const alerts = data.equipamentos.flatMap((e) => {
    const motivos: string[] = [];
    if (e.statusOperacionalidade === "INOPERANTE") motivos.push("inoperante");
    if (e.statusOperacionalidade === "COM_RESTRICOES") motivos.push("com restrições");
    const desempenho = Number(e.percentualDesempenho);
    if (e.percentualDesempenho != null && desempenho < settings.desempenhoMinimo) {
      motivos.push(`desempenho em ${desempenho}%`);
    }
    const vida = Number(e.vidaUtilEstimadaHoras);
    const uso = Number(e.horasUsoAcumuladas) || 0;
    if (vida > 0 && (uso / vida) * 100 >= settings.vidaUtilAlerta) {
      motivos.push(`${Math.round((uso / vida) * 100)}% da vida útil consumida`);
    }
    return motivos.length ? [{ id: e.id, nome: String(e.nome), motivos }] : [];
  });

  return (
    <section>
      <h1 className="text-2xl font-extrabold tracking-tight">Visão Geral</h1>
      <p className="text-[15px]">Resumo dos laboratórios e equipamentos cadastrados.</p>

      <dl className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-5">
        {totals.map(([label, n]) => (
          <div key={label} className="rounded-lg bg-neutral-50 px-4 py-3 dark:bg-neutral-900">
            <dt className="text-[12px] text-neutral-500">{label}</dt>
            <dd className="text-2xl font-bold tabular-nums">{n}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="lg:col-span-2">
          <ChartCard title="Registros de uso por mês" hint="Demanda pelos equipamentos nos últimos 6 meses">
            <BarChart data={usoPorMes} unit="Registros" empty="Sem registros de uso ainda. Crie um serviço." />
          </ChartCard>
        </div>
        <ChartCard title="Vida útil consumida" hint="Horas de uso x vida útil estimada; vermelho passa do limite definido em Configurações">
          <HBarList items={vidaUtil} empty="Informe a vida útil estimada ao cadastrar equipamentos." />
        </ChartCard>
        <ChartCard title="Uso por laboratório" hint="Registros de uso nos equipamentos de cada laboratório">
          <HBarList items={usoLabItems} empty="Sem registros de uso ainda." />
        </ChartCard>
        <ChartCard title="Equipamentos por estado" hint="Operacionalidade atual dos ativos cadastrados">
          {data.equipamentos.length === 0
            ? <p className="m-auto text-[13px] text-neutral-500">Sem dados ainda. Cadastre equipamentos.</p>
            : <DonutChart data={porEstado} centerLabel="equipamentos" />}
        </ChartCard>
        <ChartCard title="Manutenções por tipo" hint="Quanto maior a parte preventiva e preditiva, mais proativa é a gestão">
          <BarChart data={porTipo} unit="Ordens" empty="Sem dados ainda. Crie ordens em Manutenção." />
        </ChartCard>
      </div>

      <h2 className="mb-2 mt-8 text-[15px] font-bold">Precisam de atenção</h2>
      {alerts.length === 0 ? (
        <p className="text-[13px] text-neutral-500">Nenhum equipamento fora dos limites definidos em Configurações.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {alerts.map((a) => (
            <li key={a.id} className="flex items-center gap-2 rounded-lg bg-amber-50 px-4 py-2.5 text-[13px] text-amber-900 dark:bg-amber-950 dark:text-amber-200">
              <TriangleAlert size={15} className="shrink-0" />
              <span><strong>{a.nome}</strong>: {a.motivos.join(", ")}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
