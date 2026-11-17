import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { EquipamentosController } from './equipamentos.controller';
import { EquipamentosService } from './equipamentos.service';

@Module({
  imports: [PrismaModule],
  controllers: [EquipamentosController],
  providers: [EquipamentosService],
})
export class EquipamentosModule {}
