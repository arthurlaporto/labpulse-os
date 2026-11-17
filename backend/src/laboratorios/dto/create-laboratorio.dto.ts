import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateLaboratorioDto {
  @IsString()
  @IsNotEmpty()
  nome!: string;

  @IsString()
  @IsNotEmpty()
  localizacao!: string;

  @IsInt()
  campusId!: number;

  @IsInt()
  @IsOptional()
  coordenadorId?: number | null;
}
