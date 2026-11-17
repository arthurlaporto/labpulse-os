import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import type { AuthUser } from '../auth/auth-user';
import { CurrentUser } from '../auth/current-user.decorator';
import { Roles } from '../auth/roles.decorator';
import { ProjetosService } from './projetos.service';
import { CreateProjetoDto } from './dto/create-projeto.dto';
import { UpdateProjetoDto } from './dto/update-projeto.dto';

@Controller('projetos')
export class ProjetosController {
  constructor(private readonly projetosService: ProjetosService) {}

  @Get()
  listar(@CurrentUser() user: AuthUser) {
    return this.projetosService.listar(user);
  }

  @Get(':id')
  buscarPorId(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: AuthUser) {
    return this.projetosService.buscarPorId(id, user);
  }

  @Roles('ADMINISTRADOR', 'COORDENADOR_LABORATORIO', 'INTERNO_UFF')
  @Post()
  criar(@Body() dto: CreateProjetoDto, @CurrentUser() user: AuthUser) {
    return this.projetosService.criar(dto, user);
  }

  @Roles('ADMINISTRADOR', 'COORDENADOR_LABORATORIO', 'INTERNO_UFF')
  @Patch(':id')
  atualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateProjetoDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.projetosService.atualizar(id, dto, user);
  }

  @Roles('ADMINISTRADOR', 'COORDENADOR_LABORATORIO')
  @Delete(':id')
  remover(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: AuthUser) {
    return this.projetosService.remover(id, user);
  }
}
