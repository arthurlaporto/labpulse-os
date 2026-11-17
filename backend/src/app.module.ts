import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { UniversidadesModule } from './universidades/universidades.module';
import { CampiModule } from './campi/campi.module';
import { LaboratoriosModule } from './laboratorios/laboratorios.module';
import { EquipamentosModule } from './equipamentos/equipamentos.module';
import { ProjetosModule } from './projetos/projetos.module';
import { RegistrosUsoModule } from './registros-uso/registros-uso.module';
import { ManutencoesModule } from './manutencoes/manutencoes.module';
import { RecomendacoesModule } from './recomendacoes/recomendacoes.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsuariosModule,
    UniversidadesModule,
    CampiModule,
    LaboratoriosModule,
    EquipamentosModule,
    ProjetosModule,
    RegistrosUsoModule,
    ManutencoesModule,
    RecomendacoesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
