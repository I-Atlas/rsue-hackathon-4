import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  const config = app.get<ConfigService>(ConfigService);
  app.setGlobalPrefix('api');

  // Swagger
  const configSwagger = new DocumentBuilder()
    .setTitle('Versions API')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, configSwagger);
  SwaggerModule.setup('docs/api', app, document);
  await app.listen(config.get('PORT'));
}

bootstrap();
