import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { Roles } from '../auth/roles.decorator';
import { UniversidadesService } from './universidades.service';
import { CreateUniversidadeDto } from './dto/create-universidade.dto';
import { UpdateUniversidadeDto } from './dto/update-universidade.dto';

@Controller('universidades')
export class UniversidadesController {
  constructor(private readonly universidadesService: UniversidadesService) {}

  @Get()
  listar() {
    return this.universidadesService.listar();
  }

  @Get(':id')
  buscarPorId(@Param('id', ParseIntPipe) id: number) {
    return this.universidadesService.buscarPorId(id);
  }

  @Roles('ADMINISTRADOR')
  @Post()
  criar(@Body() dto: CreateUniversidadeDto) {
    return this.universidadesService.criar(dto);
  }

  @Roles('ADMINISTRADOR')
  @Patch(':id')
  atualizar(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateUniversidadeDto) {
    return this.universidadesService.atualizar(id, dto);
  }

  @Roles('ADMINISTRADOR')
  @Delete(':id')
  remover(@Param('id', ParseIntPipe) id: number) {
    return this.universidadesService.remover(id);
  }
}
