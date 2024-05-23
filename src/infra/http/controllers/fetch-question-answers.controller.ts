import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Query,
} from "@nestjs/common"
import { z } from "zod"

import { FetchQuestionAnswersUseCase } from "@/domain/forum/application/use-cases/fetch-question-answers"
import { ZodValidationPipe } from "@/infra/http/pipes/zod-validation.pipe"

import { AnswerPresenter } from "../presentes/answer-presenter"

const querySchema = z
  .string()
  .optional()
  .default("1")
  .transform(Number)
  .pipe(z.number().min(1))

const queryValidation = new ZodValidationPipe(querySchema)

type QuerySchema = z.infer<typeof querySchema>

@Controller("/questions/:questionId/answers")
export class FetchQuestionAnswersController {
  constructor(private fetchQuestionAnswers: FetchQuestionAnswersUseCase) {}

  @Get()
  async handle(
    @Query("page", queryValidation) page: QuerySchema,
    @Param("questionId") questionId: string,
  ) {
    const result = await this.fetchQuestionAnswers.execute({
      page,
      questionId,
    })

    if (result.isLeft()) {
      throw new BadRequestException()
    }

    return { answers: result.value.answers.map(AnswerPresenter.toHTTP) }
  }
}
