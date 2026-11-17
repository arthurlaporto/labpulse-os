import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCampusDto } from './dto/create-campus.dto';
import { UpdateCampusDto } from './dto/update-campus.dto';

@Injectable()
export class CampiService {
  constructor(private readonly prisma: PrismaService) {}

  listar() {
    return this.prisma.campus.findMany({ include: { universidade: true } });
  }

  async buscarPorId(id: number) {
    const campus = await this.prisma.campus.findUnique({
      where: { id },
      include: { universidade: true, laboratorios: true },
    });
    if (!campus) {
      throw new NotFoundException(`Campus ${id} não encontrado`);
    }
    return campus;
  }

  async criar(dto: CreateCampusDto) {
    await this.verificarUniversidade(dto.universidadeId);
    return this.prisma.campus.create({ data: dto });
  }

  async atualizar(id: number, dto: UpdateCampusDto) {
    await this.buscarPorId(id);
    if (dto.universidadeId !== undefined) {
      await this.verificarUniversidade(dto.universidadeId);
    }
    return this.prisma.campus.update({ where: { id }, data: dto });
  }

  async remover(id: number) {
    await this.buscarPorId(id);
    return this.prisma.campus.delete({ where: { id } });
  }

  private async verificarUniversidade(id: number) {
    const universidade = await this.prisma.universidade.findUnique({
      where: { id },
    });
    if (!universidade) {
      throw new NotFoundException(`Universidade ${id} não encontrada`);
    }
  }
}
