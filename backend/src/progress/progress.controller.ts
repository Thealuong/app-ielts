import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { ProgressService } from './progress.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('progress')
// @UseGuards(JwtAuthGuard) // Disabled for single user
export class ProgressController {
    constructor(private progressService: ProgressService) { }

    @Get('dashboard')
    async getDashboard() {
        return this.progressService.getDashboard(1); // Hardcoded for single user
    }

    @Get('calendar')
    async getCalendar() {
        return this.progressService.getCalendarStatus(1); // Hardcoded for single user
    }

    @Post('record')
    async recordProgress(
        @Body() body: { vocabularyId: number; quality: number },
    ) {
        console.log(`[Backend] Receive recordProgress request: vocabId=${body.vocabularyId}, quality=${body.quality}`);
        try {
            const result = await this.progressService.recordProgress(
                1, // Hardcoded for single user
                body.vocabularyId,
                body.quality,
            );
            console.log(`[Backend] recordProgress success:`, result.id);
            return result;
        } catch (e) {
            console.error(`[Backend] recordProgress ERROR:`, e);
            throw e;
        }
    }

    @Post('session')
    async recordSession(
        @Body()
        body: {
            newWordsCount: number;
            reviewedWordsCount: number;
            accuracyRate: number;
            durationMinutes: number;
        },
    ) {
        return this.progressService.recordSession(
            1, // Hardcoded for single user
            body.newWordsCount,
            body.reviewedWordsCount,
            body.accuracyRate,
            body.durationMinutes,
        );
    }
}
