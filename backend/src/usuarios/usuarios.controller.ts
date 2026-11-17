import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { Roles } from '../auth/roles.decorator';
import { UsuariosService } from './usuarios.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';

@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Roles('ADMINISTRADOR')
  @Get()
  listar() {
    return this.usuariosService.listar();
  }

  @Get('opcoes')
  opcoes() {
    return this.usuariosService.opcoes();
  }

  @Roles('ADMINISTRADOR')
  @Get(':id')
  buscarPorId(@Param('id', ParseIntPipe) id: number) {
    return this.usuariosService.buscarPorId(id);
  }

  @Roles('ADMINISTRADOR')
  @Post()
  criar(@Body() dto: CreateUsuarioDto) {
    return this.usuariosService.criar(dto);
  }

  @Roles('ADMINISTRADOR')
  @Patch(':id')
  atualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUsuarioDto,
  ) {
    return this.usuariosService.atualizar(id, dto);
  }

  @Roles('ADMINISTRADOR')
  @Delete(':id')
  remover(@Param('id', ParseIntPipe) id: number) {
    return this.usuariosService.remover(id);
  }
}
