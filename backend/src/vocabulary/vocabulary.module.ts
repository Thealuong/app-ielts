import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VocabularyService } from './vocabulary.service';
import { VocabularyController } from './vocabulary.controller';
import { Vocabulary } from './entities/vocabulary.entity';
import { UserVocabularyProgress } from '../progress/entities/user-vocabulary-progress.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([Vocabulary, UserVocabularyProgress]),
    ],
    controllers: [VocabularyController],
    providers: [VocabularyService],
    exports: [VocabularyService],
})
export class VocabularyModule { }
