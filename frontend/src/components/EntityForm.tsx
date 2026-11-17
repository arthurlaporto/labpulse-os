import { useState, type FormEvent } from "react";
import { ApiError } from "../api";
import { useData } from "../data";
import { toForm } from "../entities";
import { useSettings } from "../hooks/useSettings";
import type { EntityConfig, Field, FormValues, Option, Row } from "../types";

const input =
  "w-full rounded-md border border-neutral-200 bg-white px-2.5 py-2 text-[13px] outline-none focus:border-brand focus:ring-2 focus:ring-brand/30 dark:border-neutral-700 dark:bg-neutral-950";

interface Props {
  entity: EntityConfig;
  initial?: Row;
  onSubmit: (v: FormValues) => Promise<void>;
  onCancel: () => void;
}

export function EntityForm({ entity, initial, onSubmit, onCancel }: Props) {
  const { data, labelOf } = useData();
  const { settings } = useSettings();
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const [values, setValues] = useState<FormValues>(() => {
    const base = toForm(entity, initial);
    if (!initial && "campusId" in base) {
      const padrao = data.campi.find((c) => c.nome === settings.campusPadrao);
      if (padrao) base.campusId = String(padrao.id);
    }
    return base;
  });
  const set = (name: string, v: string | number | boolean) => setValues((p) => ({ ...p, [name]: v }));

  const optionsOf = (f: Field): Option[] =>
    f.ref
      ? (f.ref === "usuarios" ? data.usuariosOpcoes : data[f.ref]).map((r) => ({
          value: String(r.id),
          label: labelOf(f.ref!, r.id),
        }))
      : (f.options ?? []);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrors([]);
    try {
      await onSubmit(values);
    } catch (err) {
      setErrors(err instanceof ApiError ? err.messages : ["Erro inesperado."]);
    } finally {
      setSaving(false);
    }
  };

  const control = (f: Field) => {
    const common = { id: f.name, required: f.required || (f.requiredOnCreate && !initial), className: input };
    switch (f.type) {
      case "textarea":
        return <textarea {...common} rows={3} value={String(values[f.name])} onChange={(e) => set(f.name, e.target.value)} />;
      case "select": {
        const opts = optionsOf(f);
        return (
          <select {...common} value={String(values[f.name])} onChange={(e) => set(f.name, e.target.value)}>
            <option value="">{f.ref && opts.length === 0 ? "Nenhum cadastro disponível" : "Selecione"}</option>
            {opts.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        );
      }
      case "checkbox":
        return (
          <label className="flex items-center gap-2 py-2 text-[13px]">
            <input type="checkbox" id={f.name} className="size-4 accent-brand"
              checked={Boolean(values[f.name])} onChange={(e) => set(f.name, e.target.checked)} />
            Sim
          </label>
        );
      case "file":
        return (
          <div>
            <input id={f.name} type="file" accept={f.name.includes("foto") ? "image/*" : undefined}
              required={f.required && !values[f.name]}
              className={`${input} file:mr-3 file:rounded file:border-0 file:bg-brand file:px-2.5 file:py-1 file:text-xs file:font-semibold file:text-white`}
              onChange={(e) => e.target.files?.[0] && set(f.name, e.target.files[0].name)} />
            {values[f.name] !== "" && <p className="mt-1 text-[12px] text-neutral-500">Arquivo atual: {String(values[f.name])}</p>}
          </div>
        );
      case "range":
        return (
          <div className="flex items-center gap-3">
            <input id={f.name} type="range" min={f.min} max={f.max} className="w-full accent-brand"
              value={Number(values[f.name])} onChange={(e) => set(f.name, Number(e.target.value))} />
            <span className="w-10 text-right text-[13px] tabular-nums">{String(values[f.name])}%</span>
          </div>
        );
      case "number":
        return <input {...common} type="number" min={f.min} value={String(values[f.name])}
          onChange={(e) => set(f.name, e.target.value === "" ? "" : Number(e.target.value))} />;
      default:
        return <input {...common} type={f.type} placeholder={f.placeholder}
          autoComplete={f.type === "password" ? "new-password" : undefined}
          value={String(values[f.name])} onChange={(e) => set(f.name, e.target.value)} />;
    }
  };

  const campos = entity.fields.filter((f) => !f.editOnly || initial);

  return (
    <form onSubmit={submit} className="flex min-h-0 flex-1 flex-col">
      <div className="grid grid-cols-1 gap-x-4 gap-y-3 overflow-y-auto px-6 py-4 sm:grid-cols-2">
        {campos.map((f) => (
          <div key={f.name} className={f.full ? "sm:col-span-2" : ""}>
            <label htmlFor={f.name} className="mb-1 block text-[12px] font-semibold text-neutral-600 dark:text-neutral-300">
              {f.label}{(f.required || (f.requiredOnCreate && !initial)) && <span className="text-red-500"> *</span>}
              {f.requiredOnCreate && initial && <span className="font-normal text-neutral-400"> (deixe em branco para manter a atual)</span>}
            </label>
            {control(f)}
          </div>
        ))}
        {errors.length > 0 && (
          <div role="alert" className="rounded-md bg-red-50 px-3 py-2 text-[13px] text-red-800 sm:col-span-2 dark:bg-red-950 dark:text-red-200">
            <ul className="list-disc pl-4">{errors.map((m) => <li key={m}>{m}</li>)}</ul>
          </div>
        )}
      </div>
      <div className="flex justify-end gap-2 border-t border-neutral-100 px-6 py-3 dark:border-neutral-800">
        <button type="button" onClick={onCancel}
          className="rounded-md px-4 py-2 text-[13px] font-semibold text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800">
          Cancelar
        </button>
        <button type="submit" disabled={saving}
          className="rounded-md bg-brand px-4 py-2 text-[13px] font-semibold text-white hover:bg-brand-dark disabled:opacity-60">
          {saving ? "Salvando..." : "Salvar"}
        </button>
      </div>
    </form>
  );
}
