import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { FiltroDeExcecoes } from './common/filtro-excecoes';
import { traduzirErros } from './common/traduzir-erros';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: (erros) => new BadRequestException(traduzirErros(erros)),
    }),
  );
  app.useGlobalFilters(new FiltroDeExcecoes());
  app.enableCors({
    origin: (process.env.FRONTEND_URL ?? 'http://localhost:5173').split(','),
  });
  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
}
void bootstrap();
