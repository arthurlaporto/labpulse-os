import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AccessModule } from '../auth/access.module'; // <-- 1. Importe o módulo
import { LaboratoriosController } from './laboratorios.controller';
import { LaboratoriosService } from './laboratorios.service';

@Module({
  imports: [
    PrismaModule,
    AccessModule,
  ],
  controllers: [LaboratoriosController],
  providers: [LaboratoriosService],
})
export class LaboratoriosModule {}
