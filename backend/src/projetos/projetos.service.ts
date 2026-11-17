import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AccessService } from '../auth/access.service';
import type { AuthUser } from '../auth/auth-user';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjetoDto } from './dto/create-projeto.dto';
import { UpdateProjetoDto } from './dto/update-projeto.dto';

const INCLUIR = { professorResponsavel: { select: { id: true, nome: true } } };

@Injectable()
export class ProjetosService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: AccessService,
  ) {}

  listar(user: AuthUser) {
    return this.prisma.projetoPesquisa.findMany({
      where: this.access.projeto(user),
      include: INCLUIR,
    });
  }

  async buscarPorId(id: number, user: AuthUser) {
    const projeto = await this.prisma.projetoPesquisa.findFirst({
      where: { AND: [{ id }, this.access.projeto(user)] },
      include: INCLUIR,
    });
    if (!projeto) throw new NotFoundException(`Projeto ${id} não encontrado`);
    return projeto;
  }

  async criar(dto: CreateProjetoDto, user: AuthUser) {
    await this.verificarCodigoLivre(dto.codigoProjeto);
    // Professor interno só cadastra projeto em seu próprio nome.
    const professorResponsavelId =
      user.tipoUsuario === 'INTERNO_UFF' ? user.sub : dto.professorResponsavelId;
    await this.verificarUsuario(professorResponsavelId);
    return this.prisma.projetoPesquisa.create({
      data: { ...dto, professorResponsavelId },
      include: INCLUIR,
    });
  }

  async atualizar(id: number, dto: UpdateProjetoDto, user: AuthUser) {
    const atual = await this.buscarPorId(id, user);
    this.exigirResponsavel(atual.professorResponsavelId, user);
    if (
      !this.access.isAdmin(user) &&
      dto.professorResponsavelId !== undefined &&
      dto.professorResponsavelId !== atual.professorResponsavelId
    ) {
      throw new ForbiddenException('Somente o administrador troca o professor responsável');
    }
    if (dto.codigoProjeto !== undefined) {
      await this.verificarCodigoLivre(dto.codigoProjeto, id);
    }
    if (dto.professorResponsavelId !== undefined) {
      await this.verificarUsuario(dto.professorResponsavelId);
    }
    return this.prisma.projetoPesquisa.update({ where: { id }, data: dto, include: INCLUIR });
  }

  async remover(id: number, user: AuthUser) {
    const atual = await this.buscarPorId(id, user);
    this.exigirResponsavel(atual.professorResponsavelId, user);
    return this.prisma.projetoPesquisa.delete({ where: { id } });
  }

  private exigirResponsavel(professorId: number, user: AuthUser) {
    if (!this.access.isAdmin(user) && professorId !== user.sub) {
      throw new ForbiddenException('Somente o professor responsável altera o projeto');
    }
  }

  private async verificarCodigoLivre(codigoProjeto: string, ignorarId?: number) {
    const existente = await this.prisma.projetoPesquisa.findFirst({
      where: { codigoProjeto, NOT: { id: ignorarId } },
    });
    if (existente) {
      throw new ConflictException(`Já existe um projeto com o código ${codigoProjeto}`);
    }
  }

  private async verificarUsuario(id: number) {
    const usuario = await this.prisma.usuario.findUnique({ where: { id } });
    if (!usuario) throw new NotFoundException(`Usuário ${id} não encontrado`);
  }
}
