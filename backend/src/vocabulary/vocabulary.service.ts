import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, IsNull, LessThan } from 'typeorm';
import { Vocabulary } from './entities/vocabulary.entity';
import { UserVocabularyProgress, MasteryLevel } from '../progress/entities/user-vocabulary-progress.entity';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class VocabularyService {
    constructor(
        @InjectRepository(Vocabulary)
        private vocabularyRepository: Repository<Vocabulary>,
        @InjectRepository(UserVocabularyProgress)
        private progressRepository: Repository<UserVocabularyProgress>,
        private configService: ConfigService,
    ) { }

    async getDailyNewWords(userId: number) {
        const dailyLimit = this.configService.get<number>('DAILY_NEW_WORDS', 50);

        // Get words that user hasn't seen yet
        const allWords = await this.vocabularyRepository
            .createQueryBuilder('v')
            .leftJoin('v.userProgress', 'p', 'p.user_id = :userId', { userId })
            .where('p.id IS NULL')
            .take(dailyLimit)
            .getMany();

        return allWords;
    }

    async getWordsForReview(userId: number) {
        const now = new Date();

        // Get words that are due for review
        const progress = await this.progressRepository.find({
            where: {
                userId,
                nextReviewAt: LessThan(now),
                masteryLevel: Not(MasteryLevel.MASTERED),
            },
            relations: ['vocabulary'],
            take: 50,
        });

        return progress.map(p => p.vocabulary);
    }

    async getVocabularyById(id: number) {
        return this.vocabularyRepository.findOne({ where: { id } });
    }

    async searchVocabulary(query: string) {
        return this.vocabularyRepository
            .createQueryBuilder('v')
            .where('v.word LIKE :query', { query: `%${query}%` })
            .orWhere('v.definition LIKE :query', { query: `%${query}%` })
            .take(20)
            .getMany();
    }

    async importVocabulary(words: any[]) {
        // Bulk import vocabulary from array
        const vocabularies = words.map(word =>
            this.vocabularyRepository.create({
                word: word.word,
                partOfSpeech: word.partOfSpeech || word.pos,
                ipaUk: word.ipaUk || word.pronunciation?.uk,
                ipaUs: word.ipaUs || word.pronunciation?.us,
                definition: word.definition,
                exampleSentences: word.examples || [],
                collocations: word.collocations || [],
                synonyms: word.synonyms,
                antonyms: word.antonyms,
                topic: word.topic,
                cefrLevel: word.cefrLevel,
                ieltsBand: word.ieltsBand,
            })
        );

        await this.vocabularyRepository.save(vocabularies);
        return { imported: vocabularies.length };
    }

    async getTotalCount() {
        return this.vocabularyRepository.count();
    }

    async getWordsForDay(dayNumber: number) {
        // Day 1 = words 1-50, Day 2 = words 51-100, etc.
        // Total: 60 days × 50 words = 3000 words
        const startIndex = (dayNumber - 1) * 50;
        const words = await this.vocabularyRepository.find({
            skip: startIndex,
            take: 50,
            order: { id: 'ASC' },
        });

        return words;
    }

    async getUserProgress(userId: number) {
        const total = await this.getTotalCount();
        const learned = await this.progressRepository.count({
            where: { userId },
        });
        const mastered = await this.progressRepository.count({
            where: { userId, masteryLevel: MasteryLevel.MASTERED },
        });

        return { total, learned, mastered };
    }
}
