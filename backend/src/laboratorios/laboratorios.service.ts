import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { AccessService } from '../auth/access.service';
import type { AuthUser } from '../auth/auth-user';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLaboratorioDto } from './dto/create-laboratorio.dto';
import { UpdateLaboratorioDto } from './dto/update-laboratorio.dto';

const INCLUIR = {
  campus: true,
  coordenador: { select: { id: true, nome: true } },
};

@Injectable()
export class LaboratoriosService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: AccessService,
  ) {}

  listar(user: AuthUser) {
    return this.prisma.laboratorio.findMany({
      where: this.access.laboratorio(user),
      include: INCLUIR,
    });
  }

  async buscarPorId(id: number, user: AuthUser) {
    const laboratorio = await this.prisma.laboratorio.findFirst({
      where: { AND: [{ id }, this.access.laboratorio(user)] },
      include: { ...INCLUIR, equipamentos: { where: this.access.equipamento(user) } },
    });
    if (!laboratorio) {
      throw new NotFoundException(`Laboratório ${id} não encontrado`);
    }
    return laboratorio;
  }

  async criar(dto: CreateLaboratorioDto, user: AuthUser) {
    await this.verificarCampus(dto.campusId);
    // Quem não é administrador só cria laboratório em que é o próprio coordenador.
    const coordenadorId = this.access.isAdmin(user) ? dto.coordenadorId : user.sub;
    if (coordenadorId != null) await this.verificarUsuario(coordenadorId);
    return this.prisma.laboratorio.create({
      data: { ...dto, coordenadorId },
      include: INCLUIR,
    });
  }

  async atualizar(id: number, dto: UpdateLaboratorioDto, user: AuthUser) {
    await this.buscarPorId(id, user);
    await this.exigirCoordenacao(id, user);
    if (!this.access.isAdmin(user) && dto.coordenadorId !== undefined) {
      throw new ForbiddenException('Somente o administrador troca o coordenador');
    }
    if (dto.campusId !== undefined) await this.verificarCampus(dto.campusId);
    if (dto.coordenadorId != null) await this.verificarUsuario(dto.coordenadorId);
    return this.prisma.laboratorio.update({ where: { id }, data: dto, include: INCLUIR });
  }

  async remover(id: number, user: AuthUser) {
    await this.buscarPorId(id, user);
    await this.exigirCoordenacao(id, user);
    return this.prisma.laboratorio.delete({ where: { id } });
  }

  private async exigirCoordenacao(id: number, user: AuthUser) {
    if (!(await this.access.coordena(user, id))) {
      throw new ForbiddenException('Somente o coordenador do laboratório pode fazer isso');
    }
  }

  private async verificarCampus(id: number) {
    const campus = await this.prisma.campus.findUnique({ where: { id } });
    if (!campus) throw new NotFoundException(`Campus ${id} não encontrado`);
  }

  private async verificarUsuario(id: number) {
    const usuario = await this.prisma.usuario.findUnique({ where: { id } });
    if (!usuario) throw new NotFoundException(`Usuário ${id} não encontrado`);
  }
}
