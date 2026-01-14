import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { UserVocabularyProgress } from '../../progress/entities/user-vocabulary-progress.entity';

@Entity('vocabularies')
export class Vocabulary {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    word: string;

    @Column({ name: 'part_of_speech' })
    partOfSpeech: string;

    @Column({ name: 'ipa_uk', nullable: true })
    ipaUk: string;

    @Column({ name: 'ipa_us', nullable: true })
    ipaUs: string;

    @Column('text')
    definition: string;

    @Column({ type: 'json', name: 'example_sentences', nullable: true })
    exampleSentences: string[];

    @Column({ type: 'json', nullable: true })
    collocations: string[];

    @Column({ type: 'text', nullable: true })
    synonyms: string;

    @Column({ type: 'text', nullable: true })
    antonyms: string;

    @Column({ type: 'json', nullable: true, name: 'content_data' })
    contentData: any; // Stores the new high-density structure (meaning, nuance, collocations, examples, mistakes)

    @Column({ nullable: true })
    topic: string;

    @Column({ name: 'cefr_level', nullable: true })
    cefrLevel: string;

    @Column({ name: 'ielts_band', nullable: true })
    ieltsBand: string;

    @OneToMany(() => UserVocabularyProgress, progress => progress.vocabulary)
    userProgress: UserVocabularyProgress[];
}
