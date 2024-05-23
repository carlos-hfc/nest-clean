import {
  BadRequestException,
  Body,
  Controller,
  Param,
  Post,
} from "@nestjs/common"
import { z } from "zod"

import { CommentOnAnswerUseCase } from "@/domain/forum/application/use-cases/comment-on-answer"
import { CurrentUser } from "@/infra/auth/current-user-decorator"
import { UserPayload } from "@/infra/auth/jwt.strategy"
import { ZodValidationPipe } from "@/infra/http/pipes/zod-validation.pipe"

const bodySchema = z.object({
  content: z.string(),
})

const bodyValidation = new ZodValidationPipe(bodySchema)

type CommentOnAnswerBodySchema = z.infer<typeof bodySchema>

@Controller("/answers/:answerId/comments")
export class CommentOnAnswerController {
  constructor(private commentOnAnswer: CommentOnAnswerUseCase) {}

  @Post()
  async handle(
    @Body(bodyValidation) body: CommentOnAnswerBodySchema,
    @CurrentUser() user: UserPayload,
    @Param("answerId") answerId: string,
  ) {
    const { content } = body
    const userId = user.sub

    const result = await this.commentOnAnswer.execute({
      content,
      authorId: userId,
      answerId,
    })

    if (result.isLeft()) {
      throw new BadRequestException()
    }
  }
}
