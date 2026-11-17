import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUniversidadeDto } from './dto/create-universidade.dto';
import { UpdateUniversidadeDto } from './dto/update-universidade.dto';

@Injectable()
export class UniversidadesService {
  constructor(private readonly prisma: PrismaService) {}

  listar() {
    return this.prisma.universidade.findMany();
  }

  async buscarPorId(id: number) {
    const universidade = await this.prisma.universidade.findUnique({
      where: { id },
      include: { campi: true },
    });
    if (!universidade) {
      throw new NotFoundException(`Universidade ${id} não encontrada`);
    }
    return universidade;
  }

  criar(dto: CreateUniversidadeDto) {
    return this.prisma.universidade.create({ data: dto });
  }

  async atualizar(id: number, dto: UpdateUniversidadeDto) {
    await this.buscarPorId(id);
    return this.prisma.universidade.update({ where: { id }, data: dto });
  }

  async remover(id: number) {
    await this.buscarPorId(id);
    return this.prisma.universidade.delete({ where: { id } });
  }
}
