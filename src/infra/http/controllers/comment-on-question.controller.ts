import {
  BadRequestException,
  Body,
  Controller,
  Param,
  Post,
} from "@nestjs/common"
import { z } from "zod"

import { CommentOnQuestionUseCase } from "@/domain/forum/application/use-cases/comment-on-question"
import { CurrentUser } from "@/infra/auth/current-user-decorator"
import { UserPayload } from "@/infra/auth/jwt.strategy"
import { ZodValidationPipe } from "@/infra/http/pipes/zod-validation.pipe"

const bodySchema = z.object({
  content: z.string(),
})

const bodyValidation = new ZodValidationPipe(bodySchema)

type CommentOnQuestionBodySchema = z.infer<typeof bodySchema>

@Controller("/questions/:questionId/comments")
export class CommentOnQuestionController {
  constructor(private commentOnQuestion: CommentOnQuestionUseCase) {}

  @Post()
  async handle(
    @Body(bodyValidation) body: CommentOnQuestionBodySchema,
    @CurrentUser() user: UserPayload,
    @Param("questionId") questionId: string,
  ) {
    const { content } = body
    const userId = user.sub

    const result = await this.commentOnQuestion.execute({
      content,
      authorId: userId,
      questionId,
    })

    if (result.isLeft()) {
      throw new BadRequestException()
    }
  }
}
