import type { Request } from 'express';
import { TipoUsuario } from '../generated/prisma/client';

export interface AuthUser {
  sub: number; // id do usuário
  email: string;
  tipoUsuario: TipoUsuario;
}

export type AuthRequest = Request & { user?: AuthUser };
