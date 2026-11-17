import { randomUUID } from 'crypto';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AccessService } from '../auth/access.service';
import type { AuthUser } from '../auth/auth-user';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRegistroUsoDto } from './dto/create-registro-uso.dto';
import { UpdateRegistroUsoDto } from './dto/update-registro-uso.dto';

const INCLUIR = {
  usuario: { select: { id: true, nome: true } },
  equipamento: true,
  projeto: true,
};

@Injectable()
export class RegistrosUsoService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: AccessService,
  ) {}

  listar(user: AuthUser) {
    return this.prisma.registroUso.findMany({
      where: this.access.registroUso(user),
      include: INCLUIR,
      orderBy: { dataInicio: 'desc' },
    });
  }

  async buscarPorId(id: number, user: AuthUser) {
    const registro = await this.prisma.registroUso.findFirst({
      where: { AND: [{ id }, this.access.registroUso(user)] },
      include: INCLUIR,
    });
    if (!registro) throw new NotFoundException(`Registro de uso ${id} não encontrado`);
    return registro;
  }

  async criar(dto: CreateRegistroUsoDto, user: AuthUser) {
    const { dataInicio, dataFim, ...resto } = dto;
    const inicio = new Date(dataInicio);
    const fim = dataFim ? new Date(dataFim) : undefined;
    this.validarPeriodo(inicio, fim);

    const equipamento = await this.equipamentoVisivel(dto.equipamentoId, user);
    if (['INOPERANTE', 'SUBSTITUIDO'].includes(equipamento.statusOperacionalidade)) {
      throw new BadRequestException(`O equipamento ${equipamento.nome} não está disponível para uso`);
    }

    // Só o coordenador do laboratório registra uso em nome de outra pessoa.
    const podeEscolher = await this.access.coordena(user, equipamento.laboratorioId);
    const usuarioId = podeEscolher ? dto.usuarioId : user.sub;
    if (usuarioId !== user.sub) await this.verificarUsuario(usuarioId);
    if (dto.projetoId !== undefined) await this.projetoVisivel(dto.projetoId, user);

    return this.prisma.$transaction(async (tx) => {
      const criado = await tx.registroUso.create({
        data: {
          ...resto,
          usuarioId,
          numeroRegistro: randomUUID(),
          dataInicio: inicio,
          dataFim: fim,
        },
      });
      return tx.registroUso.update({
        where: { id: criado.id },
        data: { numeroRegistro: `RU-${String(criado.id).padStart(3, '0')}` },
        include: INCLUIR,
      });
    });
  }

  async atualizar(id: number, dto: UpdateRegistroUsoDto, user: AuthUser) {
    const atual = await this.buscarPorId(id, user);
    const coordena = await this.access.coordena(user, atual.equipamento.laboratorioId);
    const mexeVinculo =
      dto.usuarioId !== undefined || dto.equipamentoId !== undefined || dto.projetoId !== undefined;
    if (mexeVinculo && !coordena) {
      throw new ForbiddenException('Somente o coordenador altera o solicitante, o equipamento ou o projeto');
    }

    const { dataInicio, dataFim, ...resto } = dto;
    const inicio = dataInicio ? new Date(dataInicio) : atual.dataInicio;
    const fim = dataFim ? new Date(dataFim) : (atual.dataFim ?? undefined);
    this.validarPeriodo(inicio, fim);

    if (dto.usuarioId !== undefined) await this.verificarUsuario(dto.usuarioId);
    if (dto.equipamentoId !== undefined) await this.equipamentoVisivel(dto.equipamentoId, user);
    if (dto.projetoId !== undefined) await this.projetoVisivel(dto.projetoId, user);

    const dados = {
      ...resto,
      dataInicio: dataInicio ? inicio : undefined,
      dataFim: dataFim ? fim : undefined,
    };

    // Só soma horas na transição para CONCLUIDO (evita contar duas vezes)
    const concluindo = dto.status === 'CONCLUIDO' && atual.status !== 'CONCLUIDO';
    if (!concluindo) {
      return this.prisma.registroUso.update({ where: { id }, data: dados, include: INCLUIR });
    }
    if (!fim) {
      throw new BadRequestException('Informe a data de fim para concluir o registro');
    }
    const horas = Math.max(0, Math.round((fim.getTime() - inicio.getTime()) / 3600000));
    const equipamentoId = dto.equipamentoId ?? atual.equipamentoId;

    return this.prisma.$transaction(async (tx) => {
      await tx.equipamento.update({
        where: { id: equipamentoId },
        data: { horasUsoAcumuladas: { increment: horas } },
      });
      return tx.registroUso.update({ where: { id }, data: dados, include: INCLUIR });
    });
  }

  async remover(id: number, user: AuthUser) {
    const atual = await this.buscarPorId(id, user);
    if (!(await this.access.coordena(user, atual.equipamento.laboratorioId))) {
      throw new ForbiddenException('Somente o coordenador do laboratório exclui registros de uso');
    }
    return this.prisma.registroUso.delete({ where: { id } });
  }

  private validarPeriodo(inicio: Date, fim?: Date) {
    if (fim && fim < inicio) {
      throw new BadRequestException('A data de fim não pode ser anterior à data de início');
    }
  }

  private async verificarUsuario(id: number) {
    const usuario = await this.prisma.usuario.findUnique({ where: { id } });
    if (!usuario) throw new NotFoundException(`Usuário ${id} não encontrado`);
  }

  private async equipamentoVisivel(id: number, user: AuthUser) {
    const equipamento = await this.prisma.equipamento.findFirst({
      where: { AND: [{ id }, this.access.equipamento(user)] },
    });
    if (!equipamento) throw new NotFoundException(`Equipamento ${id} não encontrado`);
    return equipamento;
  }

  private async projetoVisivel(id: number, user: AuthUser) {
    const projeto = await this.prisma.projetoPesquisa.findFirst({
      where: { AND: [{ id }, this.access.projeto(user)] },
    });
    if (!projeto) throw new NotFoundException(`Projeto ${id} não encontrado`);
  }
}
