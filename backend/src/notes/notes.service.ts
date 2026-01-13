import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Note } from './entities/note.entity';

@Injectable()
export class NotesService {
    constructor(
        @InjectRepository(Note)
        private notesRepository: Repository<Note>,
    ) { }

    async getTodayNote(userId: number) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let note = await this.notesRepository.findOne({
            where: { userId, date: today },
        });

        if (!note) {
            // Auto-create today's note
            note = this.notesRepository.create({
                userId,
                date: today,
                content: '',
                title: `Notes for ${today.toLocaleDateString()}`,
            });
            note = await this.notesRepository.save(note);
        }

        return note;
    }

    async getNoteByDate(userId: number, date: string) {
        const noteDate = new Date(date);
        noteDate.setHours(0, 0, 0, 0);

        let note = await this.notesRepository.findOne({
            where: { userId, date: noteDate },
        });

        if (!note) {
            // Auto-create note for this date
            note = this.notesRepository.create({
                userId,
                date: noteDate,
                content: '',
                title: `Notes for ${noteDate.toLocaleDateString()}`,
            });
            note = await this.notesRepository.save(note);
        }

        return note;
    }

    async updateNote(userId: number, date: string, content: string, title?: string) {
        const noteDate = new Date(date);
        noteDate.setHours(0, 0, 0, 0);

        let note = await this.notesRepository.findOne({
            where: { userId, date: noteDate },
        });

        if (!note) {
            note = this.notesRepository.create({
                userId,
                date: noteDate,
                content,
                title: title || `Notes for ${noteDate.toLocaleDateString()}`,
            });
        } else {
            note.content = content;
            if (title) note.title = title;
        }

        return this.notesRepository.save(note);
    }

    async getNoteDates(userId: number) {
        const notes = await this.notesRepository.find({
            where: { userId },
            select: ['date', 'title'],
            order: { date: 'DESC' },
        });

        return notes.map(note => ({
            date: note.date,
            title: note.title,
        }));
    }

    async deleteNote(userId: number, date: string) {
        const noteDate = new Date(date);
        noteDate.setHours(0, 0, 0, 0);

        await this.notesRepository.delete({
            userId,
            date: noteDate,
        });

        return { message: 'Note deleted successfully' };
    }
}
