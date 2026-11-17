import { PartialType } from '@nestjs/mapped-types';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { StatusManutencao } from '../../generated/prisma/client';
import { CreateManutencaoDto } from './create-manutencao.dto';

export class UpdateManutencaoDto extends PartialType(CreateManutencaoDto) {
  @IsEnum(StatusManutencao)
  @IsOptional()
  status?: StatusManutencao;

  @IsInt()
  @Min(1)
  @Max(5)
  @IsOptional()
  notaAvaliacao?: number;

  @IsString()
  @IsOptional()
  observacoes?: string;
}
