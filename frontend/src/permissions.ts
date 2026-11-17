import type { EntityKey } from "./types";

const A = "ADMINISTRADOR";
const C = "COORDENADOR_LABORATORIO";
const R = "RESPONSAVEL_EQUIPAMENTO";
const I = "INTERNO_UFF";

type Acao = "create" | "edit" | "remove";

// "todos" = qualquer usuário logado
const REGRAS: Record<EntityKey, Record<Acao, string[] | "todos">> = {
  usuarios:     { create: [A],          edit: [A],       remove: [A] },
  laboratorios: { create: [A, C],       edit: [A, C],    remove: [A, C] },
  equipamentos: { create: [A, C],       edit: [A, C, R], remove: [A, C] },
  projetos:     { create: [A, C, I],    edit: [A, C, I], remove: [A, C] },
  servicos:     { create: "todos",      edit: [A, C, R], remove: [A, C] },
  manutencao:   { create: [A, C, R, I], edit: [A, C, R], remove: [A, C] },
};

export function can(perfil: string | undefined, entidade: EntityKey, acao: Acao): boolean {
  if (!perfil) return false;
  const regra = REGRAS[entidade][acao];
  return regra === "todos" || regra.includes(perfil);
}
