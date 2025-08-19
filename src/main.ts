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
import { PrismaService } from '@shared/persistance/prisma.service';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ logger: true }),
    { bufferLogs: true }
  );
  
  // Set global prefix
  app.setGlobalPrefix('api');

  // Setup middleware
  await setupHelmet(app);
  await setupRateLimit(app);
  await setupCompression(app);
  await setupCors(app);
  
  // Global filters and interceptors
  app.useGlobalFilters(
    new AuthExceptionsFilter(),
    new DefaultExceptionsFilter()
  );
  
  app.useGlobalInterceptors(new LoggingInterceptor());
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true,
  }));

  // Prisma 5.0.0+ handles connection cleanup automatically
  // No need for explicit shutdown hooks with the library engine

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Wheek API')
    .setDescription('API para la gestión de usuarios y ordenes')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // Start the application
  const port = process.env.PORT || 4001;
  await app.listen(port, '0.0.0.0');
  
  console.log(`Application is running on: http://localhost:${port}/api`);
}

bootstrap();
