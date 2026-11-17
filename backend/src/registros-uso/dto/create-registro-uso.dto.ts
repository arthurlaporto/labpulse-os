import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
} from 'class-validator';
import { FinalidadeUso, StatusRegistroUso } from '../../generated/prisma/client';

export class CreateRegistroUsoDto {
  @IsDateString()
  dataInicio!: string;

  @IsDateString()
  @IsOptional()
  dataFim?: string;

  @IsEnum(FinalidadeUso)
  finalidadeUso!: FinalidadeUso;

  @IsEnum(StatusRegistroUso)
  @IsOptional()
  status?: StatusRegistroUso;

  @IsString()
  @IsOptional()
  amostraDescricao?: string;

  @IsString()
  @IsOptional()
  oQueFoiMedido?: string;

  @IsString()
  @IsOptional()
  arquivosResultadoUrl?: string;

  @IsString()
  @IsOptional()
  intercorrencias?: string;

  @IsInt()
  usuarioId!: number;

  @IsInt()
  equipamentoId!: number;

  @IsInt()
  @IsOptional()
  projetoId?: number;
}
