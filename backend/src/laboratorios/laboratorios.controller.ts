import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import type { AuthUser } from '../auth/auth-user';
import { CurrentUser } from '../auth/current-user.decorator';
import { Roles } from '../auth/roles.decorator';
import { LaboratoriosService } from './laboratorios.service';
import { CreateLaboratorioDto } from './dto/create-laboratorio.dto';
import { UpdateLaboratorioDto } from './dto/update-laboratorio.dto';

@Controller('laboratorios')
export class LaboratoriosController {
  constructor(private readonly laboratoriosService: LaboratoriosService) {}

  @Get()
  listar(@CurrentUser() user: AuthUser) {
    return this.laboratoriosService.listar(user);
  }

  @Get(':id')
  buscarPorId(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: AuthUser) {
    return this.laboratoriosService.buscarPorId(id, user);
  }

  @Roles('ADMINISTRADOR', 'COORDENADOR_LABORATORIO')
  @Post()
  criar(@Body() dto: CreateLaboratorioDto, @CurrentUser() user: AuthUser) {
    return this.laboratoriosService.criar(dto, user);
  }

  @Roles('ADMINISTRADOR', 'COORDENADOR_LABORATORIO')
  @Patch(':id')
  atualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateLaboratorioDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.laboratoriosService.atualizar(id, dto, user);
  }

  @Roles('ADMINISTRADOR', 'COORDENADOR_LABORATORIO')
  @Delete(':id')
  remover(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: AuthUser) {
    return this.laboratoriosService.remover(id, user);
  }
}
