import { Body, Controller, Post, UseGuards } from "@nestjs/common"
import { z } from "zod"

import { CurrentUser } from "@/infra/auth/current-user-decorator"
import type { UserPayload } from "@/infra/auth/jwt.strategy"
import { JwtAuthGuard } from "@/infra/auth/jwt-auth.guard"
import { ZodValidationPipe } from "@/infra/http/pipes/zod-validation.pipe"

import { PrismaService } from "../../database/prisma/prisma.service"

const bodySchema = z.object({
  title: z.string(),
  content: z.string(),
})

const bodyValidation = new ZodValidationPipe(bodySchema)

type CreateQuestionBodySchema = z.infer<typeof bodySchema>

@Controller("/questions")
@UseGuards(JwtAuthGuard)
export class CreateQuestionController {
  constructor(private prisma: PrismaService) {}

  @Post()
  async handle(
    @Body(bodyValidation) body: CreateQuestionBodySchema,
    @CurrentUser() user: UserPayload,
  ) {
    const { content, title } = body
    const userId = user.sub
    const slug = this.convertToSlug(title)

    await this.prisma.question.create({
      data: {
        title,
        content,
        authorId: userId,
        slug,
      },
    })
  }

  private convertToSlug(text: string) {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
  }
}
