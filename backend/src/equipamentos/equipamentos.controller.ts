import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import type { AuthUser } from '../auth/auth-user';
import { CurrentUser } from '../auth/current-user.decorator';
import { Roles } from '../auth/roles.decorator';
import { EquipamentosService } from './equipamentos.service';
import { CreateEquipamentoDto } from './dto/create-equipamento.dto';
import { UpdateEquipamentoDto } from './dto/update-equipamento.dto';

@Controller('equipamentos')
export class EquipamentosController {
  constructor(private readonly equipamentosService: EquipamentosService) {}

  @Get()
  listar(@CurrentUser() user: AuthUser) {
    return this.equipamentosService.listar(user);
  }

  @Get(':id')
  buscarPorId(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: AuthUser) {
    return this.equipamentosService.buscarPorId(id, user);
  }

  @Roles('ADMINISTRADOR', 'COORDENADOR_LABORATORIO')
  @Post()
  criar(@Body() dto: CreateEquipamentoDto, @CurrentUser() user: AuthUser) {
    return this.equipamentosService.criar(dto, user);
  }

  @Roles('ADMINISTRADOR', 'COORDENADOR_LABORATORIO', 'RESPONSAVEL_EQUIPAMENTO')
  @Patch(':id')
  atualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateEquipamentoDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.equipamentosService.atualizar(id, dto, user);
  }

  @Roles('ADMINISTRADOR', 'COORDENADOR_LABORATORIO')
  @Delete(':id')
  remover(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: AuthUser) {
    return this.equipamentosService.remover(id, user);
  }
}
