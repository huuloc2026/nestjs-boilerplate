import { Logger } from 'nestjs-pino';
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';

import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpExceptionFilter } from './common/filters/http-exception.filter'; // You might consolidate with AllExceptionsFilter
import * as secureSession from '@fastify/secure-session'; // Import secure-session
import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
    { bufferLogs: true } // Buffer logs until logger is initialized
  );

  const configService = app.get(ConfigService);
  const port = configService.get<number>('app.port');
  const env = configService.get<string>('app.env');

  // Use the Pino logger instance
  app.useLogger(app.get(Logger));

  // Global Validation Pipe with DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true, // Automatically transform payloads to DTO instances
      whitelist: true, // Remove properties that are not defined in the DTO
      forbidNonWhitelisted: true, // Throw an error if non-whitelisted properties are present
      disableErrorMessages: env === 'production', // Disable detailed errors in production
    }),
  );

  // Global Exception Handling (AllExceptionsFilter from common/filters)
  // This is already provided in app.module.ts by APP_FILTER

  // Swagger/OpenAPI Documentation
  const swaggerConfig = new DocumentBuilder()
    .setTitle('NestJS Boilerplate API')
    .setDescription('Comprehensive API documentation for the NestJS project.')
    .setVersion('1.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT', description: 'Enter JWT token' },
      'access-token', // This is the key used in @ApiBearerAuth()
    )
    .addTag('Auth', 'Authentication related endpoints')
    .addTag('Users', 'User management endpoints')
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document);

  // Fastify Secure Session (for social auth redirects and session management)
  // Ensure you have a strong, randomly generated secret key.
  // In a real application, this should be loaded from environment variables or a secure secret manager.
  await app.register(secureSession, {
    secret: configService.get<string>('FASTIFY_SESSION_SECRET') || 'aVeryLongAndRandomSecretKeyForFastifySessions',
    salt: configService.get<string>('FASTIFY_SESSION_SALT') || 'someRandomSalt',
    cookie: {
      path: '/',
      secure: env === 'production', // Set to true in production
      httpOnly: true,
      sameSite: 'lax',
    },
  });


  // Enable CORS if needed (adjust origins as per your frontend deployment)
  app.enableCors({
    origin: '*', // For development, restrict in production
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  await app.listen(port, '0.0.0.0'); // Listen on all network interfaces
  console.log(`Application is running on: ${await app.getUrl()}/docs`); // Log Swagger URL
}
bootstrap();