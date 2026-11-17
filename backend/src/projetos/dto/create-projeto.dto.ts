import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class CreateProjetoDto {
  @IsString()
  @IsNotEmpty()
  titulo!: string;

  @IsString()
  @IsNotEmpty()
  codigoProjeto!: string;

  @IsInt()
  professorResponsavelId!: number;
}
