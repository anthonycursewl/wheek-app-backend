import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { setupHelmet } from '@/src/middleware/helmet.middleware';
import { setupRateLimit } from '@/src/middleware/rate-limit.middleware';
import { setupCompression } from '@/src/middleware/compression.middleware';
import { setupCors } from '@/src/middleware/cors.middleware';
import { LoggingInterceptor } from '@/src/interceptors/logging.interceptor';
import { DefaultExceptionsFilter } from '@/src/default-exceptions-errors';
import { AuthExceptionsFilter } from './contexts/users/infraestructure/filters/auth-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );
  app.setGlobalPrefix('api');

  await setupHelmet(app);
  await setupRateLimit(app);
  await setupCompression(app);
  await setupCors(app);
  app.useGlobalFilters(new AuthExceptionsFilter());
  app.useGlobalInterceptors(new LoggingInterceptor());
  app.useGlobalFilters(new DefaultExceptionsFilter());
  const config = new DocumentBuilder()
    .setTitle('Wheek API')
    .setDescription('API para la gestión de usuarios y ordenes')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT || 4001, '0.0.0.0');
}

bootstrap();
