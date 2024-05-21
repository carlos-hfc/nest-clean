import { Body, Controller, Post, UsePipes } from "@nestjs/common"
import { z } from "zod"

import { RegisterStudentUseCase } from "@/domain/forum/application/use-cases/register-student"
import { ZodValidationPipe } from "@/infra/http/pipes/zod-validation.pipe"

const bodySchema = z.object({
  name: z.string(),
  email: z.string().email(),
  password: z.string(),
})

type CreateAccountBodySchema = z.infer<typeof bodySchema>

@Controller("/accounts")
export class CreateAccountController {
  constructor(private registerStudent: RegisterStudentUseCase) {}

  @Post()
  @UsePipes(new ZodValidationPipe(bodySchema))
  async handle(@Body() body: CreateAccountBodySchema) {
    const { email, name, password } = body

    const result = await this.registerStudent.execute({
      name,
      email,
      password,
    })

    if (result.isLeft()) {
      throw new Error()
    }
  }
}
