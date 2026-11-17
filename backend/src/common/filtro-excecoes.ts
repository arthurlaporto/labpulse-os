import { ArgumentsHost, Catch, ExceptionFilter, HttpException, Logger } from '@nestjs/common';
import type { Response } from 'express';

const TITULOS: Record<number, string> = {
  400: 'Requisição inválida',
  401: 'Não autorizado',
  403: 'Acesso negado',
  404: 'Não encontrado',
  409: 'Conflito',
  500: 'Erro interno',
};

function traduzir(msg: string): string {
  if (/^Cannot (GET|POST|PUT|PATCH|DELETE) /.test(msg)) return 'Endereço não encontrado.';
  if (/numeric string is expected/i.test(msg)) return 'O identificador informado é inválido.';
  if (/enum string is expected/i.test(msg)) return 'Um dos filtros informados tem um valor inválido.';
  if (/^Validation failed/i.test(msg)) return 'Há um valor inválido na requisição.';
  if (/not valid JSON|Unexpected token/i.test(msg)) return 'Os dados enviados não estão em um formato válido.';
  if (/entity too large/i.test(msg)) return 'Os dados enviados são grandes demais.';
  const fixas: Record<string, string> = {
    'Forbidden resource': 'Você não tem permissão para esta ação.',
    Unauthorized: 'Faça login para continuar.',
    'Not Found': 'Registro não encontrado.',
    'Bad Request': 'Requisição inválida.',
    Conflict: 'Os dados entram em conflito com os já existentes.',
    'Internal server error': 'Erro interno do servidor.',
  };
  return fixas[msg] ?? msg;
}

@Catch()
export class FiltroDeExcecoes implements ExceptionFilter {
  private readonly log = new Logger('Erro');

  catch(exception: unknown, host: ArgumentsHost) {
    const res = host.switchToHttp().getResponse<Response>();
    let status = 500;
    let message: string | string[] = 'Erro interno do servidor. Tente novamente em instantes.';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const corpo = exception.getResponse();
      const bruto =
        typeof corpo === 'string'
          ? corpo
          : ((corpo as { message?: string | string[] }).message ?? exception.message);
      message = Array.isArray(bruto) ? bruto.map(traduzir) : traduzir(bruto);
    } else {
      const prisma = exception as { name?: string; code?: unknown };
      if (prisma?.name === 'PrismaClientKnownRequestError' && typeof prisma.code === 'string') {
        if (prisma.code === 'P2002') {
          status = 409;
          message = 'Já existe um registro com estes dados (valor repetido em um campo que deve ser único).';
        } else if (prisma.code === 'P2003') {
          status = 409;
          message = 'Este registro está vinculado a outros e não pode ser alterado ou excluído. Remova ou troque os vínculos primeiro.';
        } else if (prisma.code === 'P2025') {
          status = 404;
          message = 'Registro não encontrado.';
        } else {
          this.log.error(exception);
        }
      } else {
        this.log.error(exception);
      }
    }

    res.status(status).json({ statusCode: status, message, error: TITULOS[status] ?? 'Erro' });
  }
}
