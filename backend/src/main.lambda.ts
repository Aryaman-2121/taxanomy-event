/**
 * Copyright (c) 2025 Eventful India Marketing Services, India
 * All rights reserved.
 * 
 * Service: taxonomy
 * Port: 3201
 * AWS Lambda Entry Point
 * Template: Eventzr Code Repository Template v1.0
 */

import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { ValidationPipe, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Context, APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { createServer, proxy, Response } from 'aws-serverless-express';
import { eventContext } from 'aws-serverless-express/middleware';
import { Server } from 'http';
import express from 'express';
import helmet from 'helmet';

import { AppModule } from './app.module';

let cachedServer: Server;

async function createNestServer(expressApp: express.Application) {
  const app = await NestFactory.create(AppModule, new ExpressAdapter(expressApp), {
    logger: new Logger('TaxonomyLambda'),
  });

  // Security middleware
  app.use(helmet());

  // Add AWS Lambda context middleware
  app.use(eventContext());

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

  // OpenAPI documentation
  const config = new DocumentBuilder()
    .setTitle('Taxonomy Service API')
    .setDescription('Entity-specific taxonomies and categorization system for events, venues, and content across the platform')
    .setVersion('1.0.0')
    .addServer('https://api.eventzr.com/v1/taxonomy', 'Production')
    .addServer('https://api.staging.eventzr.com/v1/taxonomy', 'Staging')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('taxonomy', 'Taxonomy management operations')
    .addTag('category', 'Category management operations')
    .addTag('classification', 'Entity classification operations')
    .addTag('namespace', 'Namespace management operations')
    .addTag('tag', 'Tag management operations')
    .addTag('health', 'Health check endpoints')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  await app.init();
  return app.getHttpAdapter().getInstance();
}

async function bootstrap(): Promise<Server> {
  const expressApp = express();
  const nestApp = await createNestServer(expressApp);
  return createServer(nestApp);
}

export const handler = async (
  event: APIGatewayProxyEvent,
  context: Context,
): Promise<APIGatewayProxyResult> => {
  if (!cachedServer) {
    const server = await bootstrap();
    cachedServer = server;
  }

  return proxy(cachedServer, event, context, 'PROMISE').promise as Promise<APIGatewayProxyResult>;
};

// For local development
if (require.main === module) {
  const port = process.env.PORT || 3201;
  bootstrap().then((server) => {
    server.listen(port, () => {
      console.log(`🚀 Taxonomy service running on port ${port}`);
      console.log(`📚 API Documentation: http://localhost:${port}/docs`);
    });
  });
}



