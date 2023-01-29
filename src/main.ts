import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: [process.env.FRONTEND_URL],
    credentials: true,
  });
  const port = process.env.PORT;
  await app.listen(port, () => {
    console.log(new Date().toLocaleString());
    console.log(`App running on port ${port}...😊 `);
  });
}
bootstrap();
