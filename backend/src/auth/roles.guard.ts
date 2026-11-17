import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { TipoUsuario } from '../generated/prisma/client';
import { AuthRequest } from './auth-user';
import { ROLES_KEY } from './roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(ctx: ExecutionContext): boolean {
    const permitidos = this.reflector.getAllAndOverride<TipoUsuario[]>(ROLES_KEY, [
      ctx.getHandler(),
      ctx.getClass(),
    ]);
    if (!permitidos || permitidos.length === 0) return true; // sem @Roles: qualquer logado

    const user = ctx.switchToHttp().getRequest<AuthRequest>().user;
    if (!user || !permitidos.includes(user.tipoUsuario)) {
      throw new ForbiddenException('Seu perfil não tem permissão para esta ação');
    }
    return true;
  }
}
