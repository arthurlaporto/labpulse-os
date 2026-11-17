import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateRecomendacaoDto {
  @IsString()
  @IsNotEmpty()
  nomeEquipamento!: string;

  @IsString()
  @IsOptional()
  especificacoesTecnicas?: string;

  @IsString()
  @IsNotEmpty()
  justificativa!: string;

  @IsString()
  @IsOptional()
  fotoReferenciaUrl?: string;

  @IsInt()
  solicitanteId!: number;

  @IsInt()
  laboratorioId!: number;
}
