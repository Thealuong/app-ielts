import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { UserVocabularyProgress, MasteryLevel } from './entities/user-vocabulary-progress.entity';
import { LearningSession } from './entities/learning-session.entity';

@Injectable()
export class ProgressService {
    constructor(
        @InjectRepository(UserVocabularyProgress)
        private progressRepository: Repository<UserVocabularyProgress>,
        @InjectRepository(LearningSession)
        private sessionRepository: Repository<LearningSession>,
    ) { }

    async recordProgress(
        userId: number,
        vocabularyId: number,
        quality: number, // 0-5: how well user knew the word
    ) {
        // Find or create progress record
        let progress = await this.progressRepository.findOne({
            where: { userId, vocabularyId },
        });

        if (!progress) {
            progress = this.progressRepository.create({
                userId,
                vocabularyId,
                masteryLevel: MasteryLevel.NEW,
                firstSeenAt: new Date(),
                lastReviewedAt: new Date(),
                reviewCount: 0,
                correctCount: 0,
                incorrectCount: 0,
                easeFactor: 2.5,
                interval: 1,
            });
        }

        // Initialize counters if undefined (should not happen but safety check)
        if (progress.reviewCount === undefined || progress.reviewCount === null) progress.reviewCount = 0;
        if (progress.correctCount === undefined || progress.correctCount === null) progress.correctCount = 0;
        if (progress.incorrectCount === undefined || progress.incorrectCount === null) progress.incorrectCount = 0;
        if (progress.easeFactor === undefined || progress.easeFactor === null) progress.easeFactor = 2.5;
        if (progress.interval === undefined || progress.interval === null) progress.interval = 1;

        // Update counters
        progress.reviewCount += 1;
        if (quality >= 3) {
            progress.correctCount += 1;
        } else {
            progress.incorrectCount += 1;
        }

        // Apply SuperMemo SM-2 algorithm
        const { interval, easeFactor, masteryLevel } = this.calculateNextReview(
            progress.interval,
            progress.easeFactor,
            quality,
            progress.masteryLevel,
        );

        progress.interval = interval;
        progress.easeFactor = easeFactor;
        progress.masteryLevel = masteryLevel;
        progress.lastReviewedAt = new Date();

        // Calculate next review date
        const nextReviewAt = new Date();
        nextReviewAt.setDate(nextReviewAt.getDate() + interval);
        progress.nextReviewAt = nextReviewAt;

        await this.progressRepository.save(progress);

        return progress;
    }

    private calculateNextReview(
        currentInterval: number,
        currentEaseFactor: number,
        quality: number,
        currentMastery: MasteryLevel,
    ) {
        let interval = currentInterval;
        let easeFactor = currentEaseFactor;
        let masteryLevel = currentMastery;

        // SuperMemo SM-2 algorithm
        if (quality >= 3) {
            // Correct response
            if (interval === 0) {
                interval = 1;
            } else if (interval === 1) {
                interval = 6;
            } else {
                interval = Math.round(interval * easeFactor);
            }

            easeFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
        } else {
            // Incorrect response - restart
            interval = 1;
            easeFactor = Math.max(1.3, easeFactor - 0.2);
        }

        // Ensure easeFactor doesn't go below 1.3
        easeFactor = Math.max(1.3, easeFactor);

        // Update mastery level based on interval and accuracy
        if (interval >= 30 && quality >= 4) {
            masteryLevel = MasteryLevel.MASTERED;
        } else if (interval >= 7) {
            masteryLevel = MasteryLevel.REVIEW;
        } else if (interval >= 1) {
            masteryLevel = MasteryLevel.LEARNING;
        }

        return { interval, easeFactor, masteryLevel };
    }

    async getDashboard(userId: number) {
        // Get overall statistics
        const totalProgress = await this.progressRepository.count({ where: { userId } });
        const mastered = await this.progressRepository.count({
            where: { userId, masteryLevel: MasteryLevel.MASTERED },
        });
        const learning = await this.progressRepository.count({
            where: { userId, masteryLevel: MasteryLevel.LEARNING },
        });
        const review = await this.progressRepository.count({
            where: { userId, masteryLevel: MasteryLevel.REVIEW },
        });

        // Get today's due count
        const now = new Date();
        const dueToday = await this.progressRepository.count({
            where: {
                userId,
                nextReviewAt: Between(new Date(now.setHours(0, 0, 0, 0)), new Date(now.setHours(23, 59, 59, 999))),
            },
        });

        // Get recent sessions
        const recentSessions = await this.sessionRepository.find({
            where: { userId },
            order: { sessionDate: 'DESC' },
            take: 7,
        });

        // Calculate streak
        const streak = await this.calculateStreak(userId);

        return {
            stats: {
                total: totalProgress,
                mastered,
                learning,
                review,
                dueToday,
                streak,
            },
            recentSessions,
        };
    }

    async recordSession(
        userId: number,
        newWordsCount: number,
        reviewedWordsCount: number,
        accuracyRate: number,
        durationMinutes: number,
    ) {
        const session = this.sessionRepository.create({
            userId,
            newWordsCount,
            reviewedWordsCount,
            accuracyRate,
            durationMinutes,
        });

        await this.sessionRepository.save(session);
        return session;
    }

    private async calculateStreak(userId: number): Promise<number> {
        const sessions = await this.sessionRepository.find({
            where: { userId },
            order: { sessionDate: 'DESC' },
        });

        if (sessions.length === 0) return 0;

        let streak = 0;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        for (let i = 0; i < sessions.length; i++) {
            const sessionDate = new Date(sessions[i].sessionDate);
            sessionDate.setHours(0, 0, 0, 0);

            const expectedDate = new Date(today);
            expectedDate.setDate(expectedDate.getDate() - i);

            if (sessionDate.getTime() === expectedDate.getTime()) {
                streak++;
            } else {
                break;
            }
        }

        return streak;
    }

    async getCalendarStatus(userId: number) {
        // Get completion status for all 60 days
        const totalDays = 60;
        const wordsPerDay = 50;
        const calendarStatus = [];

        for (let day = 1; day <= totalDays; day++) {
            const startWordId = (day - 1) * wordsPerDay + 1;
            const endWordId = startWordId + wordsPerDay - 1;

            // Count how many words from this day have been studied
            const completedWords = await this.progressRepository.count({
                where: {
                    userId,
                    vocabularyId: Between(startWordId, endWordId),
                },
            });

            calendarStatus.push({
                day,
                completedWords,
                totalWords: wordsPerDay,
                isCompleted: completedWords >= wordsPerDay,
            });
        }

        return calendarStatus;
    }
}
