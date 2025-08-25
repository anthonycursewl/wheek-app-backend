// Core
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';

// Documention
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { setupHelmet } from '@/src/middleware/helmet.middleware';

// Middleware
import { setupRateLimit } from '@/src/middleware/rate-limit.middleware';
import { setupCompression } from '@/src/middleware/compression.middleware';
import { setupCors } from '@/src/middleware/cors.middleware';

// Interceptors
import { LoggingInterceptor } from '@/src/interceptors/logging.interceptor';

// Filters
import { DefaultExceptionsFilter } from '@/src/default-exceptions-errors';
import { AuthExceptionsFilter } from '@/src/contexts/users/infraestructure/filters/auth-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ logger: true }),
    { bufferLogs: true }
  );
  
  // Set global prefix
  app.setGlobalPrefix('api');
  app.useGlobalFilters(
    new AuthExceptionsFilter(),
    new DefaultExceptionsFilter()
  );

  // Setup middleware
  await setupHelmet(app);
  await setupRateLimit(app);
  await setupCompression(app);
  await setupCors(app);
  
  
  app.useGlobalInterceptors(new LoggingInterceptor());

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
  
}

bootstrap();
