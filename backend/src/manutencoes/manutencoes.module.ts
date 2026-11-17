import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { ManutencoesController } from './manutencoes.controller';
import { ManutencoesService } from './manutencoes.service';

@Module({
  imports: [PrismaModule],
  controllers: [ManutencoesController],
  providers: [ManutencoesService],
})
export class ManutencoesModule {}
