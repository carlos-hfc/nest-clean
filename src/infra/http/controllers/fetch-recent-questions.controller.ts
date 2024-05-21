import {
  BadRequestException,
  Controller,
  Get,
  Query,
  UseGuards,
} from "@nestjs/common"
import { z } from "zod"

import { FetchRecentQuestionsUseCase } from "@/domain/forum/application/use-cases/fetch-recent-questions"
import { JwtAuthGuard } from "@/infra/auth/jwt-auth.guard"
import { ZodValidationPipe } from "@/infra/http/pipes/zod-validation.pipe"

import { QuestionPresenter } from "../presentes/question-presenter"

const querySchema = z
  .string()
  .optional()
  .default("1")
  .transform(Number)
  .pipe(z.number().min(1))

const queryValidation = new ZodValidationPipe(querySchema)

type QuerySchema = z.infer<typeof querySchema>

@Controller("/questions")
@UseGuards(JwtAuthGuard)
export class FetchRecentQuestionsController {
  constructor(private fetchRecentQuestions: FetchRecentQuestionsUseCase) {}

  @Get()
  async handle(@Query("page", queryValidation) page: QuerySchema) {
    const result = await this.fetchRecentQuestions.execute({ page })

    if (result.isLeft()) {
      throw new BadRequestException()
    }

    return { questions: result.value.questions.map(QuestionPresenter.toHTTP) }
  }
}
