import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AiService } from './ai.service';
import { AiController } from './ai.controller';
import { AiGeneratedContent } from './entities/ai-generated-content.entity';

@Module({
    imports: [
        ConfigModule,
        TypeOrmModule.forFeature([AiGeneratedContent]),
    ],
    controllers: [AiController],
    providers: [AiService],
    exports: [AiService],
})
export class AiModule { }
