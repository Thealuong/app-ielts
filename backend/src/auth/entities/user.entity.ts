import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { UserVocabularyProgress } from '../../progress/entities/user-vocabulary-progress.entity';
import { LearningSession } from '../../progress/entities/learning-session.entity';

@Entity('users')
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    email: string;

    @Column()
    password: string;

    @Column()
    name: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @Column({ name: 'last_login', type: 'timestamp', nullable: true })
    lastLogin: Date;

    @OneToMany(() => UserVocabularyProgress, progress => progress.user)
    vocabularyProgress: UserVocabularyProgress[];

    @OneToMany(() => LearningSession, session => session.user)
    learningSessions: LearningSession[];
}
