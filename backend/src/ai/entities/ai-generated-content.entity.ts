import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('ai_generated_content')
export class AiGeneratedContent {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'vocabulary_id', nullable: true })
    vocabularyId: number; // Allow null for generic content

    @Column({ type: 'varchar', length: 255, nullable: true })
    cache_key: string; // Generic key (e.g. hash of input)

    @Column({ name: 'content_type' }) // 'example', 'quiz', 'explanation', 'translate'
    contentType: string;

    @Column({ type: 'text' })
    content: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @Column({ name: 'expires_at', type: 'timestamp', nullable: true })
    expiresAt: Date;
}
