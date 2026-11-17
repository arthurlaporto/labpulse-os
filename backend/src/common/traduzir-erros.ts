import { ValidationError } from 'class-validator';

const ROTULOS: Record<string, string> = {
  nome: 'Nome', email: 'E-mail', senha: 'Senha', matriculaCpf: 'Matrícula ou CPF',
  tipoUsuario: 'Perfil de acesso', vinculoInstitucional: 'Vínculo institucional',
  ehUff: 'Pertence à UFF', sigla: 'Sigla', localizacao: 'Localização',
  universidadeId: 'Universidade', campusId: 'Campus', coordenadorId: 'Coordenador',
  laboratorioId: 'Laboratório', responsavelId: 'Responsável', equipamentoId: 'Equipamento',
  usuarioId: 'Solicitante', solicitanteId: 'Solicitante', projetoId: 'Projeto',
  professorResponsavelId: 'Professor responsável', titulo: 'Título',
  codigoProjeto: 'Código do projeto', descricao: 'Descrição', fabricante: 'Fabricante',
  modelo: 'Modelo', numeroSerie: 'Número de série', dataAquisicao: 'Data de aquisição',
  fotoUrl: 'Foto do equipamento', statusOperacionalidade: 'Operacionalidade',
  percentualDesempenho: 'Desempenho', vidaUtilEstimadaHoras: 'Vida útil estimada',
  horasUsoAcumuladas: 'Horas de uso acumuladas', dataInicio: 'Início', dataFim: 'Fim',
  finalidadeUso: 'Finalidade do uso', status: 'Status', tipo: 'Tipo',
  amostraDescricao: 'Descrição da amostra', oQueFoiMedido: 'O que foi medido',
  arquivosResultadoUrl: 'Arquivos de resultado', intercorrencias: 'Intercorrências',
  notaAvaliacao: 'Nota do atendimento', observacoes: 'Observações',
  nomeEquipamento: 'Nome do equipamento', especificacoesTecnicas: 'Especificações técnicas',
  justificativa: 'Justificativa', fotoReferenciaUrl: 'Foto de referência',
  statusAprovacao: 'Status da aprovação',
};

export function traduzirErros(erros: ValidationError[]): string[] {
  const mensagens = new Set<string>();

  for (const erro of erros) {
    const campo = erro.property;
    const nome = ROTULOS[campo] ?? campo;
    const regras = Object.entries(erro.constraints ?? {});

    if (regras.some(([regra]) => regra === 'whitelistValidation')) {
      mensagens.add(`O campo "${nome}" não pode ser informado.`);
      continue;
    }

    const vazio = erro.value === undefined || erro.value === null || erro.value === '';
    if (vazio) {
      mensagens.add(
        campo.endsWith('Id')
          ? `Selecione uma opção em "${nome}".`
          : `Preencha o campo "${nome}".`,
      );
      continue;
    }

    for (const [regra, original] of regras) {
      const n = original.match(/-?\d+(\.\d+)?/)?.[0];
      switch (regra) {
        case 'isString':
          mensagens.add(`O campo "${nome}" deve ser um texto.`);
          break;
        case 'isEmail':
          mensagens.add('Informe um e-mail válido.');
          break;
        case 'isEnum':
          mensagens.add(`O valor escolhido em "${nome}" não é válido.`);
          break;
        case 'isInt':
          mensagens.add(
            campo.endsWith('Id')
              ? `Selecione uma opção em "${nome}".`
              : `O campo "${nome}" deve ser um número inteiro.`,
          );
          break;
        case 'isNumber':
          mensagens.add(`O campo "${nome}" deve ser um número.`);
          break;
        case 'isBoolean':
          mensagens.add(`O campo "${nome}" deve ser sim ou não.`);
          break;
        case 'isDateString':
          mensagens.add(`O campo "${nome}" deve ser uma data válida.`);
          break;
        case 'minLength':
          mensagens.add(`O campo "${nome}" deve ter pelo menos ${n} caracteres.`);
          break;
        case 'min':
          mensagens.add(`O campo "${nome}" não pode ser menor que ${n}.`);
          break;
        case 'max':
          mensagens.add(`O campo "${nome}" não pode ser maior que ${n}.`);
          break;
        default:
          mensagens.add(`O campo "${nome}" é inválido.`);
      }
    }
  }
  return [...mensagens];
}
