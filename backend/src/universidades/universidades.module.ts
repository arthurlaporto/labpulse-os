import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { UniversidadesController } from './universidades.controller';
import { UniversidadesService } from './universidades.service';

@Module({
  imports: [PrismaModule],
  controllers: [UniversidadesController],
  providers: [UniversidadesService],
})
export class UniversidadesModule {}
