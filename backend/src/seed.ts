import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './auth/entities/user.entity';
import * as bcrypt from 'bcrypt';

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(AppModule);

    const userRepository = app.get(getRepositoryToken(User));

    // Check if user with ID 1 exists
    const existingUser = await userRepository.findOne({ where: { id: 1 } });

    if (!existingUser) {
        console.log('Creating default user...');

        const hashedPassword = await bcrypt.hash('123456', 10);

        const user = userRepository.create({
            id: 1,
            email: 'user@ielts.com',
            password: hashedPassword,
            name: 'IELTS Learner',
        });

        await userRepository.save(user);
        console.log('✅ Default user created successfully!');
        console.log('   Email: user@ielts.com');
        console.log('   Password: 123456');
    } else {
        console.log('✅ Default user already exists!');
    }

    await app.close();
}

bootstrap();
