import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  MinLength,
} from 'class-validator';
import { TipoUsuario } from '../../generated/prisma/client';

export class CreateUsuarioDto {
  @IsString()
  @IsNotEmpty()
  nome!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @IsNotEmpty()
  matriculaCpf!: string;

  @IsEnum(TipoUsuario)
  tipoUsuario!: TipoUsuario;

  @IsString()
  @IsNotEmpty()
  vinculoInstitucional!: string;

  @IsBoolean()
  ehUff!: boolean;

  @IsString()
  @MinLength(8)
  senha!: string;
}
