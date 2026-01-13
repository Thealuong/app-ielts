import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { AiService } from './ai.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('ai')
// @UseGuards(JwtAuthGuard) // Disabled for single user
export class AiController {
    constructor(private aiService: AiService) { }

    @Post('examples')
    async generateExamples(
        @Body() body: { word: string; definition: string; partOfSpeech: string },
    ) {
        return await this.aiService.generateExamples(
            body.word,
            body.definition,
            body.partOfSpeech,
        );
    }

    @Post('quiz')
    async generateQuiz(@Body() body: { word: string; definition: string }) {
        const quiz = await this.aiService.generateQuiz(body.word, body.definition);
        return { quiz };
    }

    @Post('practice')
    async generatePractice(@Body() body: { word: string; definition: string; partOfSpeech: string }) {
        return await this.aiService.generatePracticeSet(body.word, body.definition, body.partOfSpeech);
    }
    @Post('explain')
    async explain(@Body() body: { word: string; sentence: string }) {
        const feedback = await this.aiService.generateExplanation(
            body.word,
            body.sentence,
        );
        return { feedback };
    }
}
