import {
  BadRequestException,
  Body,
  Controller,
  Param,
  Post,
} from "@nestjs/common"
import { z } from "zod"

import { AnswerQuestionUseCase } from "@/domain/forum/application/use-cases/answer-question"
import { CurrentUser } from "@/infra/auth/current-user-decorator"
import { UserPayload } from "@/infra/auth/jwt.strategy"
import { ZodValidationPipe } from "@/infra/http/pipes/zod-validation.pipe"

const bodySchema = z.object({
  content: z.string(),
  attachments: z.array(z.string().uuid()),
})

const bodyValidation = new ZodValidationPipe(bodySchema)

type AnswerQuestionBodySchema = z.infer<typeof bodySchema>

@Controller("/questions/:questionId/answers")
export class AnswerQuestionController {
  constructor(private answerQuestion: AnswerQuestionUseCase) {}

  @Post()
  async handle(
    @Body(bodyValidation) body: AnswerQuestionBodySchema,
    @CurrentUser() user: UserPayload,
    @Param("questionId") questionId: string,
  ) {
    const { content, attachments } = body
    const userId = user.sub

    const result = await this.answerQuestion.execute({
      content,
      authorId: userId,
      attachmentsIds: attachments,
      questionId,
    })

    if (result.isLeft()) {
      throw new BadRequestException()
    }
  }
}
