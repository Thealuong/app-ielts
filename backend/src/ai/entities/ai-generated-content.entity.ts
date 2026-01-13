import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('ai_generated_content')
export class AiGeneratedContent {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'vocabulary_id' })
    vocabularyId: number;

    @Column({ name: 'content_type' }) // 'example', 'quiz', 'explanation'
    contentType: string;

    @Column({ type: 'text' })
    content: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @Column({ name: 'expires_at', type: 'timestamp', nullable: true })
    expiresAt: Date;
}
