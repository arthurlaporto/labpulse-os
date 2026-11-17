import type { EntityConfig, Row, StoreKey } from "./types";

/** Minúsculas e sem acentos, para "balanca" achar "Balança". */
export const norm = (s: string) =>
  s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

/** Todo o texto pesquisável de uma linha: valores, nomes dos vínculos e rótulos dos selects. */
export function haystack(
  entity: EntityConfig,
  row: Row,
  labelOf: (key: StoreKey, id: unknown) => string,
): string {
  const brutos = Object.values(row).filter((v) => typeof v === "string" || typeof v === "number");
  const vinculos = entity.fields.filter((f) => f.ref).map((f) => labelOf(f.ref!, row[f.name]));
  const rotulos = entity.fields
    .filter((f) => f.options)
    .map((f) => f.options!.find((o) => o.value === row[f.name])?.label ?? "");
  return norm([...brutos, ...vinculos, ...rotulos].join(" "));
}
