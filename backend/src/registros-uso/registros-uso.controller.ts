import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import type { AuthUser } from '../auth/auth-user';
import { CurrentUser } from '../auth/current-user.decorator';
import { Roles } from '../auth/roles.decorator';
import { RegistrosUsoService } from './registros-uso.service';
import { CreateRegistroUsoDto } from './dto/create-registro-uso.dto';
import { UpdateRegistroUsoDto } from './dto/update-registro-uso.dto';

@Controller('registros-uso')
export class RegistrosUsoController {
  constructor(private readonly registrosUsoService: RegistrosUsoService) {}

  @Get()
  listar(@CurrentUser() user: AuthUser) {
    return this.registrosUsoService.listar(user);
  }

  @Get(':id')
  buscarPorId(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: AuthUser) {
    return this.registrosUsoService.buscarPorId(id, user);
  }

  // Sem @Roles: qualquer usuário logado pode pedir uso.
  @Post()
  criar(@Body() dto: CreateRegistroUsoDto, @CurrentUser() user: AuthUser) {
    return this.registrosUsoService.criar(dto, user);
  }

  @Roles('ADMINISTRADOR', 'COORDENADOR_LABORATORIO', 'RESPONSAVEL_EQUIPAMENTO')
  @Patch(':id')
  atualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateRegistroUsoDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.registrosUsoService.atualizar(id, dto, user);
  }

  @Roles('ADMINISTRADOR', 'COORDENADOR_LABORATORIO')
  @Delete(':id')
  remover(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: AuthUser) {
    return this.registrosUsoService.remover(id, user);
  }
}
