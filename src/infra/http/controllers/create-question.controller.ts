import { Body, Controller, Post, UseGuards } from "@nestjs/common"
import { z } from "zod"

import { CreateQuestionUseCase } from "@/domain/forum/application/use-cases/create-question"
import { CurrentUser } from "@/infra/auth/current-user-decorator"
import { UserPayload } from "@/infra/auth/jwt.strategy"
import { JwtAuthGuard } from "@/infra/auth/jwt-auth.guard"
import { ZodValidationPipe } from "@/infra/http/pipes/zod-validation.pipe"

const bodySchema = z.object({
  title: z.string(),
  content: z.string(),
})

const bodyValidation = new ZodValidationPipe(bodySchema)

type CreateQuestionBodySchema = z.infer<typeof bodySchema>

@Controller("/questions")
@UseGuards(JwtAuthGuard)
export class CreateQuestionController {
  constructor(private createQuestion: CreateQuestionUseCase) {}

  @Post()
  async handle(
    @Body(bodyValidation) body: CreateQuestionBodySchema,
    @CurrentUser() user: UserPayload,
  ) {
    const { content, title } = body
    const userId = user.sub

    await this.createQuestion.execute({
      title,
      content,
      authorId: userId,
      attachmentsIds: [],
    })
  }
}
