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
import { StatusManutencao, TipoManutencao } from '../generated/prisma/client';
import { CreateManutencaoDto } from './dto/create-manutencao.dto';
import { UpdateManutencaoDto } from './dto/update-manutencao.dto';

const INCLUIR = {
  equipamento: { include: { laboratorio: true } },
  solicitante: { select: { id: true, nome: true } },
};

@Injectable()
export class ManutencoesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: AccessService,
  ) {}

  listar(filtros: { tipo?: TipoManutencao; status?: StatusManutencao }, user: AuthUser) {
    return this.prisma.manutencao.findMany({
      where: { AND: [filtros, this.access.manutencao(user)] },
      include: INCLUIR,
      orderBy: { dataSolicitacao: 'desc' },
    });
  }

  async buscarPorId(id: number, user: AuthUser) {
    const manutencao = await this.prisma.manutencao.findFirst({
      where: { AND: [{ id }, this.access.manutencao(user)] },
      include: INCLUIR,
    });
    if (!manutencao) throw new NotFoundException(`Manutenção ${id} não encontrada`);
    return manutencao;
  }

  async criar(dto: CreateManutencaoDto, user: AuthUser) {
    const equipamento = await this.equipamentoVisivel(dto.equipamentoId, user);
    const podeEscolher = await this.access.coordena(user, equipamento.laboratorioId);
    const solicitanteId = podeEscolher ? dto.solicitanteId : user.sub;
    if (solicitanteId !== user.sub) await this.verificarUsuario(solicitanteId);

    return this.prisma.$transaction(async (tx) => {
      const criada = await tx.manutencao.create({
        data: { ...dto, solicitanteId, numeroOs: randomUUID() },
      });
      return tx.manutencao.update({
        where: { id: criada.id },
        data: { numeroOs: `OS-${String(criada.id).padStart(3, '0')}` },
        include: INCLUIR,
      });
    });
  }

  async atualizar(id: number, dto: UpdateManutencaoDto, user: AuthUser) {
    const atual = await this.buscarPorId(id, user);
    const coordena = await this.access.coordena(user, atual.equipamento.laboratorioId);
    if ((dto.equipamentoId !== undefined || dto.solicitanteId !== undefined) && !coordena) {
      throw new ForbiddenException('Somente o coordenador altera o equipamento ou o solicitante');
    }
    if (dto.equipamentoId !== undefined) await this.equipamentoVisivel(dto.equipamentoId, user);
    if (dto.solicitanteId !== undefined) await this.verificarUsuario(dto.solicitanteId);

    const statusFinal = dto.status ?? atual.status;
    if (dto.notaAvaliacao !== undefined && statusFinal !== 'ENCERRADA') {
      throw new BadRequestException('A nota só pode ser dada ao encerrar a manutenção');
    }

    const mudouStatus = dto.status !== undefined && dto.status !== atual.status;
    return this.prisma.manutencao.update({
      where: { id },
      data: {
        ...dto,
        ...(mudouStatus && {
          dataEncerramento: dto.status === 'ABERTA' ? null : new Date(),
        }),
      },
      include: INCLUIR,
    });
  }

  async remover(id: number, user: AuthUser) {
    const atual = await this.buscarPorId(id, user);
    if (!(await this.access.coordena(user, atual.equipamento.laboratorioId))) {
      throw new ForbiddenException('Somente o coordenador do laboratório exclui manutenções');
    }
    return this.prisma.manutencao.delete({ where: { id } });
  }

  private async equipamentoVisivel(id: number, user: AuthUser) {
    const equipamento = await this.prisma.equipamento.findFirst({
      where: { AND: [{ id }, this.access.equipamento(user)] },
    });
    if (!equipamento) throw new NotFoundException(`Equipamento ${id} não encontrado`);
    return equipamento;
  }

  private async verificarUsuario(id: number) {
    const usuario = await this.prisma.usuario.findUnique({ where: { id } });
    if (!usuario) throw new NotFoundException(`Usuário ${id} não encontrado`);
  }
}
