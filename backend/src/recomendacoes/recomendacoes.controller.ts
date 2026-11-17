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
import { StatusAprovacao } from '../generated/prisma/client';
import { RecomendacoesService } from './recomendacoes.service';
import { CreateRecomendacaoDto } from './dto/create-recomendacao.dto';
import { UpdateRecomendacaoDto } from './dto/update-recomendacao.dto';

@Controller('recomendacoes')
export class RecomendacoesController {
  constructor(private readonly recomendacoesService: RecomendacoesService) {}

  @Get()
  listar(
    @CurrentUser() user: AuthUser,
    @Query('laboratorioId', new ParseIntPipe({ optional: true }))
    laboratorioId?: number,
    @Query('statusAprovacao', new ParseEnumPipe(StatusAprovacao, { optional: true }))
    statusAprovacao?: StatusAprovacao,
  ) {
    return this.recomendacoesService.listar({ laboratorioId, statusAprovacao }, user);
  }

  @Get(':id')
  buscarPorId(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: AuthUser) {
    return this.recomendacoesService.buscarPorId(id, user);
  }

  @Roles('ADMINISTRADOR', 'COORDENADOR_LABORATORIO', 'RESPONSAVEL_EQUIPAMENTO', 'INTERNO_UFF')
  @Post()
  criar(@Body() dto: CreateRecomendacaoDto, @CurrentUser() user: AuthUser) {
    return this.recomendacoesService.criar(dto, user);
  }

  @Roles('ADMINISTRADOR', 'COORDENADOR_LABORATORIO')
  @Patch(':id')
  atualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateRecomendacaoDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.recomendacoesService.atualizar(id, dto, user);
  }

  @Roles('ADMINISTRADOR', 'COORDENADOR_LABORATORIO')
  @Delete(':id')
  remover(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: AuthUser) {
    return this.recomendacoesService.remover(id, user);
  }
}
