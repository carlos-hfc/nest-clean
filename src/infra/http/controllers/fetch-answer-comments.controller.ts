import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Query,
} from "@nestjs/common"
import { z } from "zod"

import { FetchAnswerCommentsUseCase } from "@/domain/forum/application/use-cases/fetch-answer-comments"
import { ZodValidationPipe } from "@/infra/http/pipes/zod-validation.pipe"

import { CommentPresenter } from "../presentes/comment-presenter"

const querySchema = z
  .string()
  .optional()
  .default("1")
  .transform(Number)
  .pipe(z.number().min(1))

const queryValidation = new ZodValidationPipe(querySchema)

type QuerySchema = z.infer<typeof querySchema>

@Controller("/answers/:answerId/comments")
export class FetchAnswerCommentsController {
  constructor(private fetchAnswerComments: FetchAnswerCommentsUseCase) {}

  @Get()
  async handle(
    @Query("page", queryValidation) page: QuerySchema,
    @Param("answerId") answerId: string,
  ) {
    const result = await this.fetchAnswerComments.execute({
      page,
      answerId,
    })

    if (result.isLeft()) {
      throw new BadRequestException()
    }

    return {
      answerComments: result.value.answerComments.map(CommentPresenter.toHTTP),
    }
  }
}
