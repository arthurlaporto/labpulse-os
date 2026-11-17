import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { AccessService } from '../auth/access.service';
import type { AuthUser } from '../auth/auth-user';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEquipamentoDto } from './dto/create-equipamento.dto';
import { UpdateEquipamentoDto } from './dto/update-equipamento.dto';

const PESSOA = { select: { id: true, nome: true } };

@Injectable()
export class EquipamentosService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: AccessService,
  ) {}

  listar(user: AuthUser) {
    return this.prisma.equipamento.findMany({
      where: this.access.equipamento(user),
      include: { laboratorio: true, responsavel: PESSOA },
    });
  }

  async buscarPorId(id: number, user: AuthUser) {
    const equipamento = await this.prisma.equipamento.findFirst({
      where: { AND: [{ id }, this.access.equipamento(user)] },
      include: {
        laboratorio: true,
        responsavel: PESSOA,
        manutencoes: { where: this.access.manutencao(user) },
      },
    });
    if (!equipamento) {
      throw new NotFoundException(`Equipamento ${id} não encontrado`);
    }
    return equipamento;
  }

  async criar(dto: CreateEquipamentoDto, user: AuthUser) {
    if (!(await this.access.coordena(user, dto.laboratorioId))) {
      throw new ForbiddenException('Você só cadastra equipamentos nos laboratórios que coordena');
    }
    await this.verificarLaboratorio(dto.laboratorioId);
    await this.verificarUsuario(dto.responsavelId);
    const { dataAquisicao, ...resto } = dto;
    return this.prisma.equipamento.create({
      data: { ...resto, dataAquisicao: dataAquisicao ? new Date(dataAquisicao) : undefined },
    });
  }

  async atualizar(id: number, dto: UpdateEquipamentoDto, user: AuthUser) {
    const atual = await this.buscarPorId(id, user);
    const coordena = await this.access.coordena(user, atual.laboratorioId);

    if (dto.laboratorioId !== undefined && dto.laboratorioId !== atual.laboratorioId) {
      if (!coordena || !(await this.access.coordena(user, dto.laboratorioId))) {
        throw new ForbiddenException('Você só move equipamentos entre laboratórios que coordena');
      }
      await this.verificarLaboratorio(dto.laboratorioId);
    }
    if (dto.responsavelId !== undefined && dto.responsavelId !== atual.responsavelId) {
      if (!coordena) {
        throw new ForbiddenException('Somente o coordenador troca o responsável');
      }
      await this.verificarUsuario(dto.responsavelId);
    }

    const { dataAquisicao, ...resto } = dto;
    return this.prisma.equipamento.update({
      where: { id },
      data: { ...resto, dataAquisicao: dataAquisicao ? new Date(dataAquisicao) : undefined },
    });
  }

  async remover(id: number, user: AuthUser) {
    const atual = await this.buscarPorId(id, user);
    if (!(await this.access.coordena(user, atual.laboratorioId))) {
      throw new ForbiddenException('Somente o coordenador do laboratório exclui equipamentos');
    }
    return this.prisma.equipamento.delete({ where: { id } });
  }

  private async verificarLaboratorio(id: number) {
    const laboratorio = await this.prisma.laboratorio.findUnique({ where: { id } });
    if (!laboratorio) throw new NotFoundException(`Laboratório ${id} não encontrado`);
  }

  private async verificarUsuario(id: number) {
    const usuario = await this.prisma.usuario.findUnique({ where: { id } });
    if (!usuario) throw new NotFoundException(`Usuário ${id} não encontrado`);
  }
}
