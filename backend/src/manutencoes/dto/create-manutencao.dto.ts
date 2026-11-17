import { IsEnum, IsInt, IsNotEmpty, IsString } from 'class-validator';
import { TipoManutencao } from '../../generated/prisma/client';

export class CreateManutencaoDto {
  @IsEnum(TipoManutencao)
  tipo!: TipoManutencao;

  @IsString()
  @IsNotEmpty()
  descricao!: string;

  @IsInt()
  equipamentoId!: number;

  @IsInt()
  solicitanteId!: number;
}
