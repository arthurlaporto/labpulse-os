import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCampusDto {
  @IsString()
  @IsNotEmpty()
  nome!: string;

  @IsString()
  @IsOptional()
  localizacao?: string;

  @IsInt()
  universidadeId!: number;
}
