import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as path from 'path';
import * as fs from 'fs';
import helmet from 'helmet';

import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformResponseInterceptor } from './common/interceptors/transform-response.interceptor';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Configuration (must come before CORS so we can read FRONTEND_URL)
  const configService = app.get(ConfigService);

  const port = configService.get<number>('app.port')!;
  const apiPrefix = configService.get<string>('app.apiPrefix')!;
  const appName = configService.get<string>('app.name')!;
  const nodeEnv = configService.get<string>('NODE_ENV') ?? 'development';
  const frontendUrl =
    configService.get<string>('FRONTEND_URL') ?? 'http://localhost:3001';

  // ─── Security Headers (Helmet) ────────────────────────────────────────────
  app.use(
    helmet({
      // Allow swagger UI to load its own scripts/styles in development
      contentSecurityPolicy: nodeEnv === 'production' ? undefined : false,
      crossOriginEmbedderPolicy: nodeEnv === 'production',
    }),
  );

  // ─── CORS ─────────────────────────────────────────────────────────────────
  const normalizedFrontendUrl = frontendUrl.replace(/\/+$/, '');
  const allowedOrigins: string[] = [
    normalizedFrontendUrl,
    'https://tusk-flow.vercel.app',
    'http://localhost:3001',
    'http://localhost:3000',
  ].filter(Boolean);

  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, Postman)
      if (!origin) return callback(null, true);
      const cleanOrigin = origin.replace(/\/+$/, '');
      if (
        allowedOrigins.includes(cleanOrigin) ||
        cleanOrigin.endsWith('.vercel.app')
      ) {
        return callback(null, true);
      }
      callback(new Error(`CORS: Origin '${origin}' not allowed`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });

  // ─── Global Prefix ────────────────────────────────────────────────────────
  app.setGlobalPrefix(apiPrefix, {
    exclude: ['health', 'health/live', 'health/ready'],
  });

  // ─── Static File Serving (local uploads — dev only) ──────────────────────
  const uploadPath = fs.existsSync(path.resolve(process.cwd(), 'backend', 'uploads'))
    ? path.resolve(process.cwd(), 'backend', 'uploads')
    : path.resolve(process.cwd(), 'uploads');

  app.useStaticAssets(uploadPath, { prefix: '/uploads/' });
  app.useStaticAssets(uploadPath, { prefix: `/${apiPrefix}/uploads/` });

  // ─── Global Validation ────────────────────────────────────────────────────
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // ─── Global Exception Filter ──────────────────────────────────────────────
  app.useGlobalFilters(new HttpExceptionFilter());

  // ─── Global Response Interceptor ──────────────────────────────────────────
  app.useGlobalInterceptors(new TransformResponseInterceptor());

  // ─── Swagger (disabled in production) ─────────────────────────────────────
  if (nodeEnv !== 'production') {
    const swaggerConfig = new DocumentBuilder()
      .setTitle(`${appName} API`)
      .setDescription('Project Management SaaS API — Development Docs')
      .setVersion('1.0')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'Authorization',
          description: 'Enter your JWT access token',
          in: 'header',
        },
        'access-token',
      )
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup(`${apiPrefix}/docs`, app, document);
    console.log(`📚 Swagger: http://localhost:${port}/${apiPrefix}/docs`);
  }

  // ─── Start Server ─────────────────────────────────────────────────────────
  await app.listen(port);
  console.log(`🚀 ${appName} [${nodeEnv}] running on http://localhost:${port}`);
  console.log(`🔒 CORS allowed origins: ${allowedOrigins.join(', ')}`);
}

void bootstrap();
