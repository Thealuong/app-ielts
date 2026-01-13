import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, IsNull, LessThan } from 'typeorm';
import { Vocabulary } from './entities/vocabulary.entity';
import { UserVocabularyProgress, MasteryLevel } from '../progress/entities/user-vocabulary-progress.entity';
import { ConfigService } from '@nestjs/config';

import { AiService } from '../ai/ai.service';

@Injectable()
export class VocabularyService {
    constructor(
        @InjectRepository(Vocabulary)
        private vocabularyRepository: Repository<Vocabulary>,
        @InjectRepository(UserVocabularyProgress)
        private progressRepository: Repository<UserVocabularyProgress>,
        private configService: ConfigService,
        private aiService: AiService,
    ) { }

    async autoCategorizeWords(limit: number = 3000) {
        // Find words with no topic
        const words = await this.vocabularyRepository.find({
            where: [
                { topic: IsNull() },
                { topic: '' }
            ],
            take: limit,
        });

        if (words.length === 0) return { message: 'No words to categorize' };

        const topics = [
            'Education', 'Work', 'Family', 'Housing', 'Daily Life', 'Food', 'Hobbies', 'Travel',
            'Technology', 'Environment', 'Health', 'Transport', 'Crime', 'Government', 'Society',
            'Art', 'Business', 'Science', 'History', 'Architecture'
        ];

        const keywords: Record<string, string[]> = {
            'Education': ['study', 'student', 'school', 'university', 'learn', 'degree', 'book', 'exam', 'teacher', 'class'],
            'Work': ['job', 'company', 'office', 'employee', 'work', 'manager', 'career', 'boss', 'salary', 'business'],
            'Family': ['parent', 'child', 'marry', 'wife', 'husband', 'relative', 'father', 'mother', 'brother', 'sister', 'family'],
            'Technology': ['computer', 'internet', 'software', 'phone', 'digital', 'tech', 'online', 'data', 'web'],
            'Environment': ['nature', 'pollution', 'earth', 'global', 'warming', 'tree', 'animal', 'water', 'environment'],
            'Health': ['doctor', 'sick', 'hospital', 'medicine', 'health', 'disease', 'pain', 'body', 'diet'],
            'Travel': ['travel', 'trip', 'hotel', 'tourist', 'visit', 'journey', 'flight', 'country'],
            'Government': ['law', 'policy', 'tax', 'vote', 'politics', 'government', 'rule'],
            'Art': ['music', 'paint', 'song', 'art', 'desgin', 'color', 'draw'],
        };

        let updatedCount = 0;

        for (let i = 0; i < words.length; i++) {
            const word = words[i];
            let assignedTopic = 'General';

            // 1. Keyword Check
            const text = (word.word + ' ' + word.definition).toLowerCase();
            for (const [topic, keys] of Object.entries(keywords)) {
                if (keys.some(k => text.includes(k))) {
                    assignedTopic = topic;
                    break;
                }
            }

            // 2. Round Robin Fallback (to ensure balanced distribution for testing)
            if (assignedTopic === 'General') {
                assignedTopic = topics[i % topics.length];
            }

            await this.vocabularyRepository.update(word.id, { topic: assignedTopic });
            updatedCount++;
        }

        return {
            processed: words.length,
            updated: updatedCount,
            method: 'Heuristic + RoundRobin'
        };
    }

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

    async getTopics() {
        const topics = await this.vocabularyRepository
            .createQueryBuilder('v')
            .select('v.topic', 'topic')
            .addSelect('COUNT(v.id)', 'count')
            .where('v.topic IS NOT NULL')
            .andWhere("v.topic != ''")
            .groupBy('v.topic')
            .orderBy('count', 'DESC')
            .getRawMany();

        return topics;
    }

    async getWordsByTopic(topic: string, userId: number) {
        const words = await this.vocabularyRepository
            .createQueryBuilder('v')
            .leftJoinAndMapOne('v.userProgress', UserVocabularyProgress, 'p', 'p.vocabularyId = v.id AND p.userId = :userId', { userId })
            .where('v.topic = :topic', { topic })
            .getMany();

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
