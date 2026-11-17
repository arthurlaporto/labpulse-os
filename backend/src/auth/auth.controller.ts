import { Body, Controller, Get, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import type { AuthUser } from './auth-user';
import { CurrentUser } from './current-user.decorator';
import { LoginDto } from './dto/login.dto';
import { Public } from './public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto.email, dto.senha);
  }

  @Get('me')
  me(@CurrentUser() user: AuthUser) {
    return this.authService.perfil(user.sub);
  }
}
