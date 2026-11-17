export interface Acesso {
  cargo: string;
  ve: string;
  faz: string;
}

export const ACESSO: Record<string, Acesso> = {
  ADMINISTRADOR: {
    cargo: "Administrador",
    ve: "Todos os dados do sistema: todos os laboratórios, equipamentos, usuários e registros.",
    faz: "Cadastrar e editar usuários, universidades, campi, laboratórios e equipamentos, e aprovar ou excluir qualquer registro.",
  },
  COORDENADOR_LABORATORIO: {
    cargo: "Coordenador do laboratório",
    ve: "Os laboratórios que você coordena e tudo ligado a eles: equipamentos, usos, manutenções, recomendações e projetos.",
    faz: "Cadastrar os equipamentos dos seus laboratórios, aprovar usos e recomendações, e abrir e encerrar manutenções.",
  },
  RESPONSAVEL_EQUIPAMENTO: {
    cargo: "Responsável pelo equipamento",
    ve: "Os equipamentos pelos quais você responde, o laboratório deles e os usos e manutenções desses equipamentos.",
    faz: "Atualizar o estado, o desempenho e as horas de uso dos seus equipamentos, e acompanhar usos e manutenções.",
  },
  INTERNO_UFF: {
    cargo: "Usuário interno UFF",
    ve: "O catálogo de laboratórios e equipamentos, e os seus próprios pedidos de uso, manutenções, recomendações e projetos.",
    faz: "Pedir uso de equipamentos, cadastrar projetos em seu nome, abrir manutenções e sugerir novos equipamentos.",
  },
  EXTERNO: {
    cargo: "Usuário externo",
    ve: "O catálogo de laboratórios e equipamentos, e os seus próprios pedidos de uso.",
    faz: "Consultar o catálogo e pedir uso de equipamentos.",
  },
};

/** Quem gerencia equipamentos (e por isso acompanha alertas de estado e vida útil). */
export const gerencia = (tipo?: string) =>
  tipo === "ADMINISTRADOR" || tipo === "COORDENADOR_LABORATORIO" || tipo === "RESPONSAVEL_EQUIPAMENTO";
