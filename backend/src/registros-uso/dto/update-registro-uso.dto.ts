import { PartialType } from '@nestjs/mapped-types';
import { CreateRegistroUsoDto } from './create-registro-uso.dto';

export class UpdateRegistroUsoDto extends PartialType(CreateRegistroUsoDto) {}
