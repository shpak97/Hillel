import 'dotenv/config';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';
import { ensureAllImageUploadDirs } from './uploads/image-upload';

async function bootstrap() {
  ensureAllImageUploadDirs();

  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const frontendOrigin = (
    process.env.FRONTEND_PUBLIC_URL ?? 'http://localhost:3100'
  ).replace(/\/$/, '');

  app.enableCors({
    origin: frontendOrigin,
    credentials: true,
  });

  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/uploads',
    setHeaders: (res) => {
      res.setHeader('Access-Control-Allow-Origin', frontendOrigin);
      res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    },
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );
  await app.listen(process.env.PORT ?? 3101);
}
void bootstrap();
