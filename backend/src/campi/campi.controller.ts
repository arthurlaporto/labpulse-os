import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { Roles } from '../auth/roles.decorator';
import { CampiService } from './campi.service';
import { CreateCampusDto } from './dto/create-campus.dto';
import { UpdateCampusDto } from './dto/update-campus.dto';

@Controller('campi')
export class CampiController {
  constructor(private readonly campiService: CampiService) {}

  @Get()
  listar() {
    return this.campiService.listar();
  }

  @Get(':id')
  buscarPorId(@Param('id', ParseIntPipe) id: number) {
    return this.campiService.buscarPorId(id);
  }

  @Roles('ADMINISTRADOR')
  @Post()
  criar(@Body() dto: CreateCampusDto) {
    return this.campiService.criar(dto);
  }

  @Roles('ADMINISTRADOR')
  @Patch(':id')
  atualizar(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateCampusDto) {
    return this.campiService.atualizar(id, dto);
  }

  @Roles('ADMINISTRADOR')
  @Delete(':id')
  remover(@Param('id', ParseIntPipe) id: number) {
    return this.campiService.remover(id);
  }
}
