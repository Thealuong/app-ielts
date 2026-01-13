import { Controller, Get, Post, Body, Query, UseGuards, Request, Param } from '@nestjs/common';
import { VocabularyService } from './vocabulary.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('vocabulary')
// @UseGuards(JwtAuthGuard) // Disabled for single user
export class VocabularyController {
    constructor(private vocabularyService: VocabularyService) { }

    @Get('daily')
    async getDailyWords() {
        return this.vocabularyService.getDailyNewWords(1); // Hardcoded for single user
    }

    @Get('review')
    async getReviewWords() {
        return this.vocabularyService.getWordsForReview(1); // Hardcoded for single user
    }

    @Get('day/:dayNumber')
    async getWordsForDay(@Param('dayNumber') dayNumber: string) {
        return this.vocabularyService.getWordsForDay(parseInt(dayNumber));
    }

    @Get('search')
    async search(@Query('q') query: string) {
        return this.vocabularyService.searchVocabulary(query);
    }

    @Get('topics')
    async getTopics() {
        return this.vocabularyService.getTopics(1); // Hardcoded for single user
    }

    @Get('by-topic')
    async getVocabularyByTopic(@Query('name') name: string) {
        return this.vocabularyService.getWordsByTopic(name, 1); // Hardcoded user
    }

    @Get('progress')
    async getProgress() {
        return this.vocabularyService.getUserProgress(1); // Hardcoded for single user
    }

    @Get(':id')
    async getById(@Param('id') id: number) {
        return this.vocabularyService.getVocabularyById(id);
    }

    @Post('import')
    async import(@Body() body: { words: any[] }) {
        return this.vocabularyService.importVocabulary(body.words);
    }

    @Post('auto-categorize')
    async autoCategorize(@Body() body: { limit?: number }) {
        return this.vocabularyService.autoCategorizeWords(body?.limit || 50);
    }
}
