import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Cấu hình swagger
  const config = new DocumentBuilder()
    .setTitle('API Documentation')
    .setDescription('Tài liệu API cho dự án Office 365')
    .setVersion('1.0')
    .addTag('API')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // Kích hoạt CORS
  app.enableCors({
    origin: 'http://localhost:3001', // Địa chỉ frontend
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // Các phương thức HTTP được phép
    credentials: true,
  });

  await app.listen(3000); // Lắng nghe backend trên cổng 3000
}
bootstrap();
