import { Module } from "@nestjs/common"

import { QuestionsRepository } from "@/domain/forum/application/repositories/questions-repository"

import { PrismaService } from "./prisma/prisma.service"
import { PrismaQuestionsRepository } from "./prisma/repositories/prisma-questions-repository"

@Module({
  providers: [
    PrismaService,
    // PrismaAnswerAttachmentsRepository,
    // PrismaAnswerCommentsRepository,
    // PrismaAnswersRepository,
    // PrismaQuestionAttachmentsRepository,
    // PrismaQuestionCommentsRepository,
    {
      provide: QuestionsRepository,
      useClass: PrismaQuestionsRepository,
    },
  ],
  exports: [
    PrismaService,
    // PrismaAnswerAttachmentsRepository,
    // PrismaAnswerCommentsRepository,
    // PrismaAnswersRepository,
    // PrismaQuestionAttachmentsRepository,
    // PrismaQuestionCommentsRepository,
    QuestionsRepository,
  ],
})
export class DatabaseModule {}
