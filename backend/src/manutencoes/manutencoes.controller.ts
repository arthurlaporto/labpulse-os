import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseEnumPipe,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import type { AuthUser } from '../auth/auth-user';
import { CurrentUser } from '../auth/current-user.decorator';
import { Roles } from '../auth/roles.decorator';
import { StatusManutencao, TipoManutencao } from '../generated/prisma/client';
import { ManutencoesService } from './manutencoes.service';
import { CreateManutencaoDto } from './dto/create-manutencao.dto';
import { UpdateManutencaoDto } from './dto/update-manutencao.dto';

@Controller('manutencoes')
export class ManutencoesController {
  constructor(private readonly manutencoesService: ManutencoesService) {}

  @Get()
  listar(
    @CurrentUser() user: AuthUser,
    @Query('tipo', new ParseEnumPipe(TipoManutencao, { optional: true }))
    tipo?: TipoManutencao,
    @Query('status', new ParseEnumPipe(StatusManutencao, { optional: true }))
    status?: StatusManutencao,
  ) {
    return this.manutencoesService.listar({ tipo, status }, user);
  }

  @Get(':id')
  buscarPorId(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: AuthUser) {
    return this.manutencoesService.buscarPorId(id, user);
  }

  @Roles('ADMINISTRADOR', 'COORDENADOR_LABORATORIO', 'RESPONSAVEL_EQUIPAMENTO', 'INTERNO_UFF')
  @Post()
  criar(@Body() dto: CreateManutencaoDto, @CurrentUser() user: AuthUser) {
    return this.manutencoesService.criar(dto, user);
  }

  @Roles('ADMINISTRADOR', 'COORDENADOR_LABORATORIO', 'RESPONSAVEL_EQUIPAMENTO')
  @Patch(':id')
  atualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateManutencaoDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.manutencoesService.atualizar(id, dto, user);
  }

  @Roles('ADMINISTRADOR', 'COORDENADOR_LABORATORIO')
  @Delete(':id')
  remover(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: AuthUser) {
    return this.manutencoesService.remover(id, user);
  }
}
