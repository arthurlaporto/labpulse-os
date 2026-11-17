import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { CampiController } from './campi.controller';
import { CampiService } from './campi.service';

@Module({
  imports: [PrismaModule],
  controllers: [CampiController],
  providers: [CampiService],
})
export class CampiModule {}
