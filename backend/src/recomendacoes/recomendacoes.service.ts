import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { AccessService } from '../auth/access.service';
import type { AuthUser } from '../auth/auth-user';
import { PrismaService } from '../prisma/prisma.service';
import { StatusAprovacao } from '../generated/prisma/client';
import { CreateRecomendacaoDto } from './dto/create-recomendacao.dto';
import { UpdateRecomendacaoDto } from './dto/update-recomendacao.dto';

const INCLUIR = {
  solicitante: { select: { id: true, nome: true } },
  laboratorio: true,
};

@Injectable()
export class RecomendacoesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: AccessService,
  ) {}

  listar(
    filtros: { laboratorioId?: number; statusAprovacao?: StatusAprovacao },
    user: AuthUser,
  ) {
    return this.prisma.recomendacaoEquipamento.findMany({
      where: { AND: [filtros, this.access.recomendacao(user)] },
      include: INCLUIR,
      orderBy: { dataSolicitacao: 'desc' },
    });
  }

  async buscarPorId(id: number, user: AuthUser) {
    const recomendacao = await this.prisma.recomendacaoEquipamento.findFirst({
      where: { AND: [{ id }, this.access.recomendacao(user)] },
      include: INCLUIR,
    });
    if (!recomendacao) throw new NotFoundException(`Recomendação ${id} não encontrada`);
    return recomendacao;
  }

  async criar(dto: CreateRecomendacaoDto, user: AuthUser) {
    await this.laboratorioVisivel(dto.laboratorioId, user);
    const solicitanteId = this.access.isAdmin(user) ? dto.solicitanteId : user.sub;
    return this.prisma.recomendacaoEquipamento.create({
      data: { ...dto, solicitanteId },
      include: INCLUIR,
    });
  }

  async atualizar(id: number, dto: UpdateRecomendacaoDto, user: AuthUser) {
    const atual = await this.buscarPorId(id, user);
    const coordena = await this.access.coordena(user, atual.laboratorioId);
    if (!coordena && atual.solicitanteId !== user.sub) {
      throw new ForbiddenException('Você não pode alterar esta recomendação');
    }
    if (dto.statusAprovacao !== undefined && !coordena) {
      throw new ForbiddenException('Só o coordenador do laboratório avalia recomendações');
    }
    if (
      !this.access.isAdmin(user) &&
      dto.solicitanteId !== undefined &&
      dto.solicitanteId !== atual.solicitanteId
    ) {
      throw new ForbiddenException('Não é possível trocar o solicitante');
    }
    if (dto.laboratorioId !== undefined) await this.laboratorioVisivel(dto.laboratorioId, user);
    return this.prisma.recomendacaoEquipamento.update({
      where: { id },
      data: dto,
      include: INCLUIR,
    });
  }

  async remover(id: number, user: AuthUser) {
    const atual = await this.buscarPorId(id, user);
    const coordena = await this.access.coordena(user, atual.laboratorioId);
    if (!coordena && atual.solicitanteId !== user.sub) {
      throw new ForbiddenException('Você não pode excluir esta recomendação');
    }
    return this.prisma.recomendacaoEquipamento.delete({ where: { id } });
  }

  private async laboratorioVisivel(id: number, user: AuthUser) {
    const laboratorio = await this.prisma.laboratorio.findFirst({
      where: { AND: [{ id }, this.access.laboratorio(user)] },
    });
    if (!laboratorio) throw new NotFoundException(`Laboratório ${id} não encontrado`);
  }
}
