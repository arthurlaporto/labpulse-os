import { useSearchParams } from "react-router-dom";
import { haystack, norm } from "../search";
import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { ApiError } from "../api";
import { useData } from "../data";
import { columnLabel, toApi } from "../entities";
import type { EntityConfig, Row } from "../types";
import { EntityForm } from "./EntityForm";
import { Modal } from "./Modal";

const actionBtn =
  "grid size-8 place-items-center rounded-md text-neutral-500 hover:bg-neutral-100 focus-visible:outline-2 focus-visible:outline-brand dark:hover:bg-neutral-800";

export function EntityPage({ entity }: { entity: EntityConfig }) {
  const { data, loading, add, update, remove, labelOf } = useData();
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Row | null>(null);
  const [deleting, setDeleting] = useState<Row | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [params, setParams] = useSearchParams();
  const busca = params.get("busca") ?? "";
  const todas = data[entity.key];
  const rows = busca ? todas.filter((r) => haystack(entity, r, labelOf).includes(norm(busca))) : todas;

  const cell = (row: Row, name: string): string => {
    if (name === "laboratorio") {
      const eq = data.equipamentos.find((e) => e.id === row.equipamentoId);
      return eq ? labelOf("laboratorios", eq.laboratorioId) : "—";
    }
    const field = entity.fields.find((f) => f.name === name);
    const v = row[name];
    if (v === null || v === undefined || v === "") return "—";
    if (field?.ref) return labelOf(field.ref, v);
    if (field?.options) return field.options.find((o) => o.value === v)?.label ?? String(v);
    if (typeof v === "boolean") return v ? "Sim" : "Não";
    if (name === "percentualDesempenho") return `${v}%`;
    if (field?.type === "datetime-local" || name === "dataSolicitacao") return new Date(String(v)).toLocaleString("pt-BR");
    if (field?.type === "date") return new Date(String(v)).toLocaleDateString("pt-BR", { timeZone: "UTC" });
    return String(v);
  };

  const rowName = (r: Row) => String(r.nome ?? r.titulo ?? r.numeroOs ?? r.numeroRegistro ?? "este registro");

  const confirmarExclusao = async () => {
    if (!deleting) return;
    try {
      await remove(entity.key, deleting.id);
      setDeleting(null);
    } catch (e) {
      setDeleteError(e instanceof ApiError ? e.messages[0] : "Não foi possível excluir.");
    }
  };

  return (
    <section>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">{entity.title}</h1>
          <p className="text-[15px]">{entity.subtitle}</p>
        </div>
        <button onClick={() => setCreating(true)}
          className="flex items-center gap-6 rounded-lg bg-brand px-4 py-2.5 text-[13px] font-semibold text-white hover:bg-brand-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand">
          {entity.createLabel} <Plus size={16} />
        </button>
      </div>

      {busca && (
        <p className="mt-4 text-[13px]">
          Filtrando por <strong>“{busca}”</strong> · {rows.length} {rows.length === 1 ? "resultado" : "resultados"}{" "}
          <button onClick={() => setParams({})} className="font-semibold text-brand underline">Limpar</button>
        </p>
      )}
      {busca && rows.length === 0 && (
        <p className="mt-6 text-[13px] text-neutral-500">Nada encontrado nesta página.</p>
      )}

      {loading && <p className="mt-6 text-[13px] text-neutral-500">Carregando...</p>}

      {rows.length > 0 && (
        <div className="mt-6 overflow-x-auto rounded-lg border border-neutral-100 dark:border-neutral-800">
          <table className="w-full text-left text-[13px]">
            <thead className="bg-neutral-50 text-neutral-500 dark:bg-neutral-900">
              <tr>
                {entity.columns.map((c) => <th key={c} className="px-4 py-2.5 font-semibold">{columnLabel(entity, c)}</th>)}
                <th className="w-24 px-4 py-2.5 text-right font-semibold">Ações</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t border-neutral-100 dark:border-neutral-800">
                  {entity.columns.map((c) => <td key={c} className="px-4 py-2.5">{cell(r, c)}</td>)}
                  <td className="px-4 py-1.5">
                    <div className="flex justify-end gap-1">
                      <button className={actionBtn} onClick={() => setEditing(r)} aria-label={`Editar ${rowName(r)}`}>
                        <Pencil size={15} />
                      </button>
                      <button className={`${actionBtn} hover:text-red-600`}
                        onClick={() => { setDeleteError(null); setDeleting(r); }} aria-label={`Excluir ${rowName(r)}`}>
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {creating && (
        <Modal title={entity.modalTitle} hint={entity.modalHint} onClose={() => setCreating(false)}>
          <EntityForm entity={entity} onCancel={() => setCreating(false)}
            onSubmit={async (v) => { await add(entity.key, toApi(entity, v, false)); setCreating(false); }} />
        </Modal>
      )}

      {editing && (
        <Modal title={`Editar ${rowName(editing)}`} hint="Altere os campos e salve." onClose={() => setEditing(null)}>
          <EntityForm entity={entity} initial={editing} onCancel={() => setEditing(null)}
            onSubmit={async (v) => { await update(entity.key, editing.id, toApi(entity, v, true)); setEditing(null); }} />
        </Modal>
      )}

      {deleting && (
        <Modal title="Excluir registro" onClose={() => setDeleting(null)}>
          <div className="px-6 py-4 text-[13px]">
            <p>Tem certeza que deseja excluir <strong>{rowName(deleting)}</strong>? Essa ação não pode ser desfeita.</p>
            {deleteError && (
              <p role="alert" className="mt-3 rounded-md bg-red-50 px-3 py-2 text-red-800 dark:bg-red-950 dark:text-red-200">{deleteError}</p>
            )}
          </div>
          <div className="flex justify-end gap-2 border-t border-neutral-100 px-6 py-3 dark:border-neutral-800">
            <button onClick={() => setDeleting(null)}
              className="rounded-md px-4 py-2 text-[13px] font-semibold text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800">
              Cancelar
            </button>
            <button onClick={confirmarExclusao}
              className="rounded-md bg-red-600 px-4 py-2 text-[13px] font-semibold text-white hover:bg-red-700">
              Excluir
            </button>
          </div>
        </Modal>
      )}
    </section>
  );
}
