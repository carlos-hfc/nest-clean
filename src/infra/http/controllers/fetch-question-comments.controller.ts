import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Query,
} from "@nestjs/common"
import { z } from "zod"

import { FetchQuestionCommentsUseCase } from "@/domain/forum/application/use-cases/fetch-question-comments"
import { ZodValidationPipe } from "@/infra/http/pipes/zod-validation.pipe"

import { CommentWithAuthorPresenter } from "../presentes/comment-with-author-presenter"

const querySchema = z
  .string()
  .optional()
  .default("1")
  .transform(Number)
  .pipe(z.number().min(1))

const queryValidation = new ZodValidationPipe(querySchema)

type QuerySchema = z.infer<typeof querySchema>

@Controller("/questions/:questionId/comments")
export class FetchQuestionCommentsController {
  constructor(private fetchQuestionComments: FetchQuestionCommentsUseCase) {}

  @Get()
  async handle(
    @Query("page", queryValidation) page: QuerySchema,
    @Param("questionId") questionId: string,
  ) {
    const result = await this.fetchQuestionComments.execute({
      page,
      questionId,
    })

    if (result.isLeft()) {
      throw new BadRequestException()
    }

    return {
      comments: result.value.comments.map(CommentWithAuthorPresenter.toHTTP),
    }
  }
}
