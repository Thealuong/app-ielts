import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    // Enable CORS for React Native app
    app.enableCors({
        origin: '*', // In production, specify your frontend URL
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
        credentials: true,
    });

    // Enable validation
    app.useGlobalPipes(new ValidationPipe({
        whitelist: true,
        transform: true,
    }));

    const port = process.env.PORT || 3000;
    await app.listen(port);
    console.log(`🚀 IELTS Vocabulary API running on: http://localhost:${port}`);
}
bootstrap();
