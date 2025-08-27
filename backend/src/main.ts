/**
 * Copyright (c) 2025 Eventful India Marketing Services, India
 * All rights reserved.
 * 
 * Service: taxonomy
 * Port: 3201
 * Application Entry Point
 * Template: Eventzr Code Repository Template v1.0
 */

import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: new Logger('TaxonomyService'),
  });

  // Security middleware
  app.use(helmet());

  // Global validation
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      disableErrorMessages: process.env.NODE_ENV === 'production',
    }),
  );

  // Enable CORS for cross-origin requests
  app.enableCors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['https://app.eventzr.com'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Tenant-ID', 'X-Correlation-ID'],
  });

  // Swagger API documentation
  const config = new DocumentBuilder()
    .setTitle('Eventzr Taxonomy Service')
    .setDescription('Entity-specific taxonomies and categorization system for events, venues, and content across the platform')
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('Taxonomy', 'Taxonomy management operations')
    .addTag('Category', 'Category management operations')
    .addTag('Classification', 'Classification operations')
    .addTag('Health', 'Health check endpoints')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  // Health check endpoint
  app.getHttpAdapter().get('/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'taxonomy',
      port: process.env.PORT || 3201,
      version: '1.0.0',
      timestamp: new Date().toISOString(),
    });
  });

  const port = process.env.PORT || 3201;
  await app.listen(port);

  const logger = new Logger('Bootstrap');
  logger.log(`🚀 Taxonomy service running on port ${port}`);
  logger.log(`📚 API Documentation: http://localhost:${port}/docs`);
  logger.log(`💚 Health Check: http://localhost:${port}/health`);
}

bootstrap().catch((error) => {
  console.error('Failed to start the application:', error);
  process.exit(1);
});
