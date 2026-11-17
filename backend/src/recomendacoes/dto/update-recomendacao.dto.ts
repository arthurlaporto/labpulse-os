import { PartialType } from '@nestjs/mapped-types';
import { IsEnum, IsOptional } from 'class-validator';
import { StatusAprovacao } from '../../generated/prisma/client';
import { CreateRecomendacaoDto } from './create-recomendacao.dto';

export class UpdateRecomendacaoDto extends PartialType(CreateRecomendacaoDto) {
  @IsEnum(StatusAprovacao)
  @IsOptional()
  statusAprovacao?: StatusAprovacao;
}
