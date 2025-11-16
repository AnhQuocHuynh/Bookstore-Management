import { JwtAuthGuard, RoleGuard } from '@/common/guards';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory, Reflector } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      forbidUnknownValues: true,
    }),
  );
  app.useGlobalGuards(
    new JwtAuthGuard(new Reflector()),
    new RoleGuard(new Reflector()),
  );
  app.use(cookieParser());
  app.setGlobalPrefix('/api/v1');

  const configService = app.get(ConfigService);

  const config = new DocumentBuilder()
    .setTitle('API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const port = configService.get<number>('port', 3001);
  await app.listen(port, () => {
    console.log(`API documentation is running at http://localhost:${port}/api`);
  });
}
bootstrap();
