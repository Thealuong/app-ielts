import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProgressService } from './progress.service';
import { ProgressController } from './progress.controller';
import { UserVocabularyProgress } from './entities/user-vocabulary-progress.entity';
import { LearningSession } from './entities/learning-session.entity';
import { VocabularyModule } from '../vocabulary/vocabulary.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([UserVocabularyProgress, LearningSession]),
        VocabularyModule,
    ],
    controllers: [ProgressController],
    providers: [ProgressService],
    exports: [ProgressService],
})
export class ProgressModule { }
