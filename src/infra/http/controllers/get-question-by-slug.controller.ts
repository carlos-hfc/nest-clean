import { BadRequestException, Controller, Get, Param } from "@nestjs/common"
import { z } from "zod"

import { GetQuestionBySlugUseCase } from "@/domain/forum/application/use-cases/get-question-by-slug"
import { ZodValidationPipe } from "@/infra/http/pipes/zod-validation.pipe"

import { QuestionDetailsPresenter } from "../presentes/question-details-presenter"

const paramSchema = z.string()

const paramValidation = new ZodValidationPipe(paramSchema)

type ParamSchema = z.infer<typeof paramSchema>

@Controller("/questions/:slug")
export class GetQuestionBySlugController {
  constructor(private getQuestionBySlug: GetQuestionBySlugUseCase) {}

  @Get()
  async handle(@Param("slug", paramValidation) slug: ParamSchema) {
    const result = await this.getQuestionBySlug.execute({
      slug,
    })

    if (result.isLeft()) {
      throw new BadRequestException()
    }

    return { question: QuestionDetailsPresenter.toHTTP(result.value.question) }
  }
}
