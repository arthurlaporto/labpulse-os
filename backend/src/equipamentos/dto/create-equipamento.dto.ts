import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { StatusOperacional } from '../../generated/prisma/client';

export class CreateEquipamentoDto {
  @IsString()
  @IsNotEmpty()
  nome!: string;

  @IsString()
  @IsOptional()
  descricao?: string;

  @IsString()
  @IsOptional()
  fabricante?: string;

  @IsString()
  @IsOptional()
  modelo?: string;

  @IsString()
  @IsOptional()
  numeroSerie?: string;

  @IsDateString()
  @IsOptional()
  dataAquisicao?: string;

  @IsString()
  @IsNotEmpty()
  fotoUrl!: string;

  @IsEnum(StatusOperacional)
  @IsOptional()
  statusOperacionalidade?: StatusOperacional;

  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  percentualDesempenho?: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  vidaUtilEstimadaHoras?: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  horasUsoAcumuladas?: number;

  @IsInt()
  laboratorioId!: number;

  @IsInt()
  responsavelId!: number;
}
