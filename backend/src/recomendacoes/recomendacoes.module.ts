import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { RecomendacoesController } from './recomendacoes.controller';
import { RecomendacoesService } from './recomendacoes.service';

@Module({
  imports: [PrismaModule],
  controllers: [RecomendacoesController],
  providers: [RecomendacoesService],
})
export class RecomendacoesModule {}
