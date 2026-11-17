import { Injectable } from '@nestjs/common';
import { Prisma } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import type { AuthUser } from './auth-user';

@Injectable()
export class AccessService {
  constructor(private readonly prisma: PrismaService) {}

  isAdmin(u: AuthUser) {
    return u.tipoUsuario === 'ADMINISTRADOR';
  }

  // Coordenador e responsável enxergam só o que é do seu laboratório/equipamento.
  isStaff(u: AuthUser) {
    return (
      u.tipoUsuario === 'COORDENADOR_LABORATORIO' ||
      u.tipoUsuario === 'RESPONSAVEL_EQUIPAMENTO'
    );
  }

  laboratorio(u: AuthUser): Prisma.LaboratorioWhereInput {
    if (!this.isStaff(u)) return {};
    return {
      OR: [
        { coordenadorId: u.sub },
        { equipamentos: { some: { responsavelId: u.sub } } },
      ],
    };
  }

  equipamento(u: AuthUser): Prisma.EquipamentoWhereInput {
    if (!this.isStaff(u)) return {};
    return { OR: [{ laboratorio: { coordenadorId: u.sub } }, { responsavelId: u.sub }] };
  }

  registroUso(u: AuthUser): Prisma.RegistroUsoWhereInput {
    if (this.isAdmin(u)) return {};
    if (this.isStaff(u)) {
      return { OR: [{ equipamento: this.equipamento(u) }, { usuarioId: u.sub }] };
    }
    return { usuarioId: u.sub };
  }

  manutencao(u: AuthUser): Prisma.ManutencaoWhereInput {
    if (this.isAdmin(u)) return {};
    if (this.isStaff(u)) {
      return { OR: [{ equipamento: this.equipamento(u) }, { solicitanteId: u.sub }] };
    }
    return { solicitanteId: u.sub };
  }

  recomendacao(u: AuthUser): Prisma.RecomendacaoEquipamentoWhereInput {
    if (this.isAdmin(u)) return {};
    return { OR: [{ laboratorio: { coordenadorId: u.sub } }, { solicitanteId: u.sub }] };
  }

  projeto(u: AuthUser): Prisma.ProjetoPesquisaWhereInput {
    if (this.isAdmin(u)) return {};
    if (this.isStaff(u)) {
      return {
        OR: [
          { professorResponsavelId: u.sub },
          { registrosUso: { some: { equipamento: this.equipamento(u) } } },
        ],
      };
    }
    return {
      OR: [
        { professorResponsavelId: u.sub },
        { registrosUso: { some: { usuarioId: u.sub } } },
      ],
    };
  }

  /** O usuário coordena este laboratório? (o administrador vale como coordenador de todos) */
  async coordena(u: AuthUser, laboratorioId: number): Promise<boolean> {
    if (this.isAdmin(u)) return true;
    const n = await this.prisma.laboratorio.count({
      where: { id: laboratorioId, coordenadorId: u.sub },
    });
    return n > 0;
  }
}
