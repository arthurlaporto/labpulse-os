import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthRequest } from './auth-user';

export const CurrentUser = createParamDecorator((_: unknown, ctx: ExecutionContext) =>
  ctx.switchToHttp().getRequest<AuthRequest>().user,
);
