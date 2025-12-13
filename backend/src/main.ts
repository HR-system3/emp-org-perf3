// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Parse cookies
  app.use(cookieParser());

  // CORS – allow frontend on 3000 or 3001 to call API with cookies
  app.enableCors({
    origin: ['http://localhost:3000',
             'http://localhost:3001',
             "https://YOUR-VERCEL-URL.vercel.app"
            ],
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
    swaggerOptions: {
      withCredentials: true,
    },
  });

  await app.listen(3000);
}
bootstrap();
