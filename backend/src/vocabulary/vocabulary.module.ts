import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VocabularyService } from './vocabulary.service';
import { VocabularyController } from './vocabulary.controller';
import { Vocabulary } from './entities/vocabulary.entity';
import { UserVocabularyProgress } from '../progress/entities/user-vocabulary-progress.entity';

import { AiModule } from '../ai/ai.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Vocabulary, UserVocabularyProgress]),
        AiModule,
    ],
    controllers: [VocabularyController],
    providers: [VocabularyService],
    exports: [VocabularyService],
})
export class VocabularyModule { }
