import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { User } from '../../auth/entities/user.entity';

@Entity('learning_sessions')
export class LearningSession {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'user_id' })
    userId: number;

    @CreateDateColumn({ name: 'session_date' })
    sessionDate: Date;

    @Column({ name: 'new_words_count', default: 0 })
    newWordsCount: number;

    @Column({ name: 'reviewed_words_count', default: 0 })
    reviewedWordsCount: number;

    @Column({ name: 'accuracy_rate', type: 'float', default: 0 })
    accuracyRate: number;

    @Column({ name: 'duration_minutes', default: 0 })
    durationMinutes: number;

    @ManyToOne(() => User, user => user.learningSessions)
    @JoinColumn({ name: 'user_id' })
    user: User;
}
