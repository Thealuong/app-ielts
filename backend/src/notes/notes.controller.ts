import { Controller, Get, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { NotesService } from './notes.service';

@Controller('notes')
export class NotesController {
    constructor(private notesService: NotesService) { }

    @Get('today')
    async getTodayNote() {
        return this.notesService.getTodayNote(1); // Hardcoded for single user
    }

    @Get('date/:date')
    async getNoteByDate(@Param('date') date: string) {
        return this.notesService.getNoteByDate(1, date); // Hardcoded for single user
    }

    @Get('list')
    async getNoteDates() {
        return this.notesService.getNoteDates(1); // Hardcoded for single user
    }

    @Put('date/:date')
    async updateNote(
        @Param('date') date: string,
        @Body() body: { content: string; title?: string },
    ) {
        return this.notesService.updateNote(1, date, body.content, body.title);
    }

    @Delete('date/:date')
    async deleteNote(@Param('date') date: string) {
        return this.notesService.deleteNote(1, date);
    }
}
