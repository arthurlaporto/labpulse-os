import type { EntityConfig, EntityKey, FormValues, Option, Row } from "./types";

const pares = (...p: [string, string][]): Option[] => p.map(([value, label]) => ({ value, label }));
const iguais = (...t: string[]): Option[] => t.map((x) => ({ value: x, label: x }));

export const STATUS_EQUIPAMENTO = pares(
  ["DISPONIVEL", "Disponível"], ["EM_USO", "Em uso"], ["COM_RESTRICOES", "Com restrições"],
  ["INOPERANTE", "Inoperante"], ["SUBSTITUIDO", "Substituído / descartado"],
);

export const entities: Record<EntityKey, EntityConfig> = {
  servicos: {
    key: "servicos", path: "/servicos", title: "Serviços",
    subtitle: "Registros de uso e agendamentos de equipamentos dos laboratórios.",
    createLabel: "Criar serviço", modalTitle: "Novo registro de uso",
    modalHint: "Vincule o uso a um projeto de pesquisa e descreva a amostra e as medições.",
    columns: ["numeroRegistro", "equipamentoId", "usuarioId", "projetoId", "dataInicio", "status"],
    fields: [
      { name: "equipamentoId", label: "Equipamento", type: "select", ref: "equipamentos", required: true },
      { name: "usuarioId", label: "Solicitante", type: "select", ref: "usuarios", required: true },
      { name: "projetoId", label: "Projeto de pesquisa", type: "select", ref: "projetos" },
      { name: "finalidadeUso", label: "Finalidade do uso", type: "select", required: true,
        options: pares(["PESQUISA", "Pesquisa"], ["ENSINO", "Ensino"], ["EXTENSAO", "Extensão"], ["SERVICO_EXTERNO", "Prestação de serviço externo"]) },
      { name: "dataInicio", label: "Início", type: "datetime-local", required: true },
      { name: "dataFim", label: "Fim", type: "datetime-local" },
      { name: "status", label: "Status", type: "select",
        options: pares(["SOLICITADO", "Solicitado"], ["APROVADO", "Aprovado"], ["EM_ANDAMENTO", "Em andamento"], ["CONCLUIDO", "Concluído"], ["RECUSADO", "Recusado"]) },
      { name: "amostraDescricao", label: "Descrição da amostra", type: "textarea", full: true },
      { name: "oQueFoiMedido", label: "O que foi medido", type: "textarea", full: true },
      { name: "arquivosResultadoUrl", label: "Arquivos de resultado", type: "file" },
      { name: "intercorrencias", label: "Intercorrências", type: "textarea", full: true },
    ],
  },
  projetos: {
    key: "projetos", path: "/projetos", title: "Projetos",
    subtitle: "Projetos de pesquisa aos quais os usos de equipamentos são vinculados.",
    createLabel: "Criar projeto", modalTitle: "Novo projeto de pesquisa",
    modalHint: "O código é único e costuma ser o do fomento (CNPq, FAPERJ, FINEP).",
    columns: ["titulo", "codigoProjeto", "professorResponsavelId"],
    fields: [
      { name: "titulo", label: "Título", type: "text", required: true, full: true },
      { name: "codigoProjeto", label: "Código do projeto / fomento", type: "text", required: true, placeholder: "Ex.: FAPERJ-2026-001" },
      { name: "professorResponsavelId", label: "Professor responsável", type: "select", ref: "usuarios", required: true },
    ],
  },
  usuarios: {
    key: "usuarios", path: "/usuarios", title: "Usuários",
    subtitle: "Pessoas com acesso à plataforma, internas ou externas à UFF.",
    createLabel: "Criar usuário", modalTitle: "Novo usuário",
    modalHint: "O perfil define o que a pessoa pode ver e fazer na plataforma.",
    columns: ["nome", "email", "tipoUsuario", "vinculoInstitucional", "ehUff"],
    fields: [
      { name: "nome", label: "Nome completo", type: "text", required: true, full: true },
      { name: "email", label: "E-mail", type: "email", required: true, placeholder: "nome@id.uff.br" },
      { name: "matriculaCpf", label: "Matrícula ou CPF", type: "text", required: true },
      { name: "tipoUsuario", label: "Perfil de acesso", type: "select", required: true,
        options: pares(["EXTERNO", "Usuário externo"], ["INTERNO_UFF", "Usuário interno UFF"],
          ["RESPONSAVEL_EQUIPAMENTO", "Responsável pelo equipamento"],
          ["COORDENADOR_LABORATORIO", "Coordenador do laboratório"], ["ADMINISTRADOR", "Administrador"]) },
      { name: "vinculoInstitucional", label: "Vínculo institucional", type: "select", required: true,
        options: iguais("Discente", "Docente", "Técnico de laboratório", "Pesquisador de outra IES", "Empresa / indústria") },
      { name: "ehUff", label: "Pertence à UFF", type: "checkbox" },
      { name: "senha", label: "Senha (mínimo 8 caracteres)", type: "password", requiredOnCreate: true },
    ],
  },
  laboratorios: {
    key: "laboratorios", path: "/laboratorios", title: "Laboratórios",
    subtitle: "Laboratórios organizados por campus, com seu coordenador.",
    createLabel: "Criar laboratório", modalTitle: "Novo laboratório",
    modalHint: "Cada laboratório pertence a um campus e pode ter um coordenador.",
    columns: ["nome", "campusId", "localizacao", "coordenadorId"],
    fields: [
      { name: "nome", label: "Nome do laboratório", type: "text", required: true, full: true },
      { name: "campusId", label: "Campus", type: "select", ref: "campi", required: true },
      { name: "localizacao", label: "Sala / bloco", type: "text", required: true, placeholder: "Ex.: A32" },
      { name: "coordenadorId", label: "Coordenador", type: "select", ref: "usuarios", clearable: true, full: true },
    ],
  },
  equipamentos: {
    key: "equipamentos", path: "/equipamentos", title: "Equipamentos",
    subtitle: "Ativos cadastrados, com estado de operação, desempenho e vida útil.",
    createLabel: "Criar equipamento", modalTitle: "Novo equipamento",
    modalHint: "A foto é obrigatória no cadastro e serve de registro visual do ativo.",
    columns: ["nome", "laboratorioId", "fabricante", "modelo", "statusOperacionalidade", "percentualDesempenho"],
    fields: [
      { name: "nome", label: "Nome do equipamento", type: "text", required: true, full: true },
      { name: "laboratorioId", label: "Laboratório", type: "select", ref: "laboratorios", required: true },
      { name: "responsavelId", label: "Responsável", type: "select", ref: "usuarios", required: true },
      { name: "fabricante", label: "Fabricante", type: "text" },
      { name: "modelo", label: "Modelo", type: "text" },
      { name: "numeroSerie", label: "Número de série", type: "text" },
      { name: "dataAquisicao", label: "Data de aquisição", type: "date" },
      { name: "statusOperacionalidade", label: "Operacionalidade", type: "select", options: STATUS_EQUIPAMENTO },
      { name: "percentualDesempenho", label: "Desempenho (%)", type: "range", min: 0, max: 100 },
      { name: "vidaUtilEstimadaHoras", label: "Vida útil estimada (h)", type: "number", min: 0 },
      { name: "horasUsoAcumuladas", label: "Horas de uso acumuladas", type: "number", min: 0 },
      { name: "descricao", label: "Descrição", type: "textarea", full: true },
      { name: "fotoUrl", label: "Foto do equipamento", type: "file", required: true, full: true },
    ],
  },
  manutencao: {
    key: "manutencao", path: "/manutencao", title: "Manutenção",
    subtitle: "Ordens de serviço corretivas, preventivas e preditivas.",
    createLabel: "Criar manutenção", modalTitle: "Nova ordem de manutenção",
    modalHint: "O número da ordem é gerado automaticamente e toda ordem começa aberta.",
    columns: ["numeroOs", "tipo", "equipamentoId", "laboratorio", "dataSolicitacao", "status"],
    fields: [
      { name: "tipo", label: "Tipo de manutenção", type: "select", required: true,
        options: pares(["CORRETIVA", "Corretiva"], ["PREVENTIVA", "Preventiva"], ["PREDITIVA", "Preditiva"]) },
      { name: "equipamentoId", label: "Equipamento", type: "select", ref: "equipamentos", required: true },
      { name: "solicitanteId", label: "Solicitante", type: "select", ref: "usuarios", required: true },
      { name: "descricao", label: "Descrição do problema ou necessidade", type: "textarea", required: true, full: true },
      { name: "status", label: "Status", type: "select", editOnly: true,
        options: pares(["ABERTA", "Aberta"], ["ENCERRADA", "Encerrada"], ["CANCELADA", "Cancelada"]) },
      { name: "notaAvaliacao", label: "Nota do atendimento (1 a 5)", type: "number", min: 1, editOnly: true },
      { name: "observacoes", label: "Observações do encerramento", type: "textarea", editOnly: true, full: true },
    ],
  },
};

const rotulos: Record<string, string> = {
  numeroRegistro: "Nº", numeroOs: "Nº OS", ehUff: "UFF", vinculoInstitucional: "Vínculo",
  tipoUsuario: "Perfil", percentualDesempenho: "Desempenho", statusOperacionalidade: "Operacionalidade",
  dataInicio: "Início", dataSolicitacao: "Solicitada em", laboratorio: "Laboratório",
  professorResponsavelId: "Professor", codigoProjeto: "Código",
};

export const columnLabel = (entity: EntityConfig, name: string): string =>
  rotulos[name] ?? entity.fields.find((f) => f.name === name)?.label ?? name;

// ---------- conversões formulário <-> API ----------

const doisDigitos = (n: number) => String(n).padStart(2, "0");

function paraInputLocal(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}-${doisDigitos(d.getMonth() + 1)}-${doisDigitos(d.getDate())}T${doisDigitos(d.getHours())}:${doisDigitos(d.getMinutes())}`;
}

/** Linha da API (ou nada, no cadastro) -> valores dos inputs do formulário. */
export function toForm(entity: EntityConfig, row?: Row): FormValues {
  return Object.fromEntries(
    entity.fields.map((f): [string, string | number | boolean] => {
      const v = row?.[f.name];
      if (v === null || v === undefined) {
        return [f.name, f.type === "checkbox" ? false : f.type === "range" ? 100 : ""];
      }
      if (f.type === "date") return [f.name, String(v).slice(0, 10)];
      if (f.type === "datetime-local") return [f.name, paraInputLocal(String(v))];
      if (f.type === "checkbox") return [f.name, Boolean(v)];
      if (f.type === "range" || f.type === "number") return [f.name, Number(v)];
      return [f.name, String(v)]; // selects (inclusive ids) trabalham com texto
    }),
  );
}

/** Valores do formulário -> corpo JSON que a API espera. */
export function toApi(entity: EntityConfig, values: FormValues, editando: boolean) {
  const corpo: Record<string, unknown> = {};
  for (const f of entity.fields) {
    if (f.editOnly && !editando) continue;
    const v = values[f.name];
    if (f.type === "checkbox") { corpo[f.name] = Boolean(v); continue; }
    if (v === "" || v === undefined) {
      if (editando && f.clearable) corpo[f.name] = null; // remove o vínculo
      continue;                                           // vazio = não envia
    }
    if (f.ref || f.type === "number" || f.type === "range") corpo[f.name] = Number(v);
    else if (f.type === "datetime-local") corpo[f.name] = new Date(String(v)).toISOString();
    else corpo[f.name] = v;
  }
  return corpo;
}
