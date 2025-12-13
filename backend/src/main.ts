// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());

<<<<<<< HEAD
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    process.env.FRONTEND_URL, // ✅ this will be your Vercel URL
  ].filter(Boolean);

  app.enableCors({
    origin: (origin, cb) => {
=======
  // ✅ CORS (safe for dev + Vercel + Render)
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    process.env.FRONTEND_URL, // e.g. https://emp-org-perf3.vercel.app
  ].filter(Boolean) as string[];

  app.enableCors({
    origin: (origin, cb) => {
      // allow requests with no origin (Postman/curl/server-to-server)
>>>>>>> 27192f4 (added the correct main.ts)
      if (!origin) return cb(null, true);

      const isAllowed =
        allowedOrigins.includes(origin) ||
<<<<<<< HEAD
        origin.endsWith('.vercel.app');
=======
        origin.endsWith('.vercel.app'); // allow Vercel preview domains
>>>>>>> 27192f4 (added the correct main.ts)

      return cb(isAllowed ? null : new Error('Not allowed by CORS'), isAllowed);
    },
    credentials: true,
  });

  // --- SWAGGER SETUP ---
  const config = new DocumentBuilder()
    .setTitle('HR System API')
    .setDescription('HR System endpoints')
    .setVersion('1.0')
    .addCookieAuth('token', { type: 'apiKey', in: 'cookie' })
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document, {
    swaggerOptions: { withCredentials: true },
  });

  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0'); // ✅ good for Render
}
bootstrap();