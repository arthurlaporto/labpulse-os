import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';

@Injectable()
export class UsuariosService {
  constructor(private readonly prisma: PrismaService) {}

  listar() {
    return this.prisma.usuario.findMany();
  }

  async buscarPorId(id: number) {
    const usuario = await this.prisma.usuario.findUnique({ where: { id } });
    if (!usuario) {
      throw new NotFoundException(`Usuário ${id} não encontrado`);
    }
    return usuario;
  }

  async criar(dto: CreateUsuarioDto) {
    await this.verificarEmailLivre(dto.email);
    const { senha, ...resto } = dto;
    const senhaHash = await bcrypt.hash(senha, 10);
    return this.prisma.usuario.create({ data: { ...resto, senhaHash } });
  }

  async atualizar(id: number, dto: UpdateUsuarioDto) {
    await this.buscarPorId(id);
    if (dto.email !== undefined) await this.verificarEmailLivre(dto.email, id);
    const { senha, ...resto } = dto;
    return this.prisma.usuario.update({
      where: { id },
      data: {
        ...resto,
        ...(senha && { senhaHash: await bcrypt.hash(senha, 10) }),
      },
    });
  }

  async remover(id: number) {
    await this.buscarPorId(id);
    return this.prisma.usuario.delete({ where: { id } });
  }

  // Lista enxuta para exibir nomes e preencher selects; sem e-mail nem CPF.
  opcoes() {
    return this.prisma.usuario.findMany({
      select: { id: true, nome: true, tipoUsuario: true, vinculoInstitucional: true },
      orderBy: { nome: 'asc' },
    });
  }

  private async verificarEmailLivre(email: string, ignorarId?: number) {
    const existente = await this.prisma.usuario.findFirst({
      where: { email, NOT: { id: ignorarId } },
    });
    if (existente) {
      throw new ConflictException('Já existe um usuário com este e-mail.');
    }
  }
}
