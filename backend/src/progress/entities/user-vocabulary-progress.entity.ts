import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { User } from '../../auth/entities/user.entity';
import { Vocabulary } from '../../vocabulary/entities/vocabulary.entity';

export enum MasteryLevel {
    NEW = 'new',
    LEARNING = 'learning',
    REVIEW = 'review',
    MASTERED = 'mastered',
}

@Entity('user_vocabulary_progress')
export class UserVocabularyProgress {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'user_id' })
    userId: number;

    @Column({ name: 'vocabulary_id' })
    vocabularyId: number;

    @Column({
        type: 'enum',
        enum: MasteryLevel,
        default: MasteryLevel.NEW,
        name: 'mastery_level',
    })
    masteryLevel: MasteryLevel;

    @CreateDateColumn({ name: 'first_seen_at' })
    firstSeenAt: Date;

    @Column({ name: 'last_reviewed_at', type: 'timestamp', nullable: true })
    lastReviewedAt: Date;

    @Column({ name: 'next_review_at', type: 'timestamp', nullable: true })
    nextReviewAt: Date;

    @Column({ name: 'review_count', default: 0 })
    reviewCount: number;

    @Column({ name: 'correct_count', default: 0 })
    correctCount: number;

    @Column({ name: 'incorrect_count', default: 0 })
    incorrectCount: number;

    @Column({ name: 'ease_factor', type: 'float', default: 2.5 })
    easeFactor: number; // For spaced repetition algorithm

    @Column({ default: 0 })
    interval: number; // Days until next review

    @ManyToOne(() => User, user => user.vocabularyProgress)
    @JoinColumn({ name: 'user_id' })
    user: User;

    @ManyToOne(() => Vocabulary, vocabulary => vocabulary.userProgress)
    @JoinColumn({ name: 'vocabulary_id' })
    vocabulary: Vocabulary;
}
