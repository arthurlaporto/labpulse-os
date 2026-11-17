import { Injectable, OnModuleInit, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { AuthUser } from './auth-user';

@Injectable()
export class AuthService implements OnModuleInit {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  // Cria o primeiro administrador, se ainda ninguém tem senha.
  async onModuleInit() {
    const email = this.config.get<string>('ADMIN_EMAIL');
    const senha = this.config.get<string>('ADMIN_SENHA');
    if (!email || !senha) return;

    const adminsComSenha = await this.prisma.usuario.count({
      where: { tipoUsuario: 'ADMINISTRADOR', senhaHash: { not: null } },
    });
    if (adminsComSenha > 0) return;

    const senhaHash = await bcrypt.hash(senha, 10);
    await this.prisma.usuario.upsert({
      where: { email },
      update: { senhaHash, tipoUsuario: 'ADMINISTRADOR' },
      create: {
        nome: this.config.get<string>('ADMIN_NOME') ?? 'Administrador',
        email,
        matriculaCpf: 'admin',
        tipoUsuario: 'ADMINISTRADOR',
        vinculoInstitucional: 'Administrador do sistema',
        ehUff: true,
        senhaHash,
      },
    });
  }

  async login(email: string, senha: string) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { email },
      omit: { senhaHash: false }, // aqui sim precisamos do hash
    });
    const confere = usuario?.senhaHash
      ? await bcrypt.compare(senha, usuario.senhaHash)
      : false;
    if (!usuario || !confere) {
      throw new UnauthorizedException('E-mail ou senha incorretos');
    }

    const payload: AuthUser = {
      sub: usuario.id,
      email: usuario.email,
      tipoUsuario: usuario.tipoUsuario,
    };
    return {
      accessToken: await this.jwt.signAsync(payload),
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        tipoUsuario: usuario.tipoUsuario,
      },
    };
  }

  async perfil(id: number) {
    return this.prisma.usuario.findUnique({
      where: { id },
      select: { id: true, nome: true, email: true, tipoUsuario: true },
    });
  }
}
