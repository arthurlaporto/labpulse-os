import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { RegistrosUsoController } from './registros-uso.controller';
import { RegistrosUsoService } from './registros-uso.service';

@Module({
  imports: [PrismaModule],
  controllers: [RegistrosUsoController],
  providers: [RegistrosUsoService],
})
export class RegistrosUsoModule {}
