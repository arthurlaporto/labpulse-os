import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateUniversidadeDto {
  @IsString()
  @IsNotEmpty()
  nome!: string;

  @IsString()
  @IsNotEmpty()
  sigla!: string;

  @IsBoolean()
  @IsOptional()
  ehUff?: boolean;
}
