import { Module } from "@nestjs/common"

import { QuestionsRepository } from "@/domain/forum/application/repositories/questions-repository"
import { StudentsRepository } from "@/domain/forum/application/repositories/students-repository"

import { PrismaService } from "./prisma/prisma.service"
import { PrismaQuestionsRepository } from "./prisma/repositories/prisma-questions-repository"
import { PrismaStudentsRepository } from "./prisma/repositories/prisma-students-repository"

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
    {
      provide: StudentsRepository,
      useClass: PrismaStudentsRepository,
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
    StudentsRepository,
  ],
})
export class DatabaseModule {}
