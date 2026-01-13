import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { VocabularyModule } from './vocabulary/vocabulary.module';
import { ProgressModule } from './progress/progress.module';
import { AiModule } from './ai/ai.module';
import { NotesModule } from './notes/notes.module';

// Import all entities
import { User } from './auth/entities/user.entity';
import { Vocabulary } from './vocabulary/entities/vocabulary.entity';
import { UserVocabularyProgress } from './progress/entities/user-vocabulary-progress.entity';
import { LearningSession } from './progress/entities/learning-session.entity';
import { AiGeneratedContent } from './ai/entities/ai-generated-content.entity';
import { Note } from './notes/entities/note.entity';

@Module({
    imports: [
        // Configuration
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: '.env',
        }),

        // Database
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: (configService: ConfigService) => ({
                type: 'mysql',
                host: configService.get('DB_HOST'),
                port: configService.get('DB_PORT'),
                username: configService.get('DB_USERNAME'),
                password: configService.get('DB_PASSWORD'),
                database: configService.get('DB_DATABASE'),
                entities: [
                    User,
                    Vocabulary,
                    UserVocabularyProgress,
                    LearningSession,
                    AiGeneratedContent,
                    Note,
                ],
                synchronize: true, // Set to false in production
                logging: configService.get('NODE_ENV') === 'development',
            }),
            inject: [ConfigService],
        }),

        // Feature modules
        AuthModule,
        VocabularyModule,
        ProgressModule,
        AiModule,
        NotesModule,
    ],
})
export class AppModule { }
