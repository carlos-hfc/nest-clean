import { Body, Controller, Post, UsePipes } from "@nestjs/common"
import { z } from "zod"

import { AuthenticateStudentUseCase } from "@/domain/forum/application/use-cases/authenticate-student"
import { ZodValidationPipe } from "@/infra/http/pipes/zod-validation.pipe"

const bodySchema = z.object({
  email: z.string().email(),
  password: z.string(),
})

type AuthenticateBodySchema = z.infer<typeof bodySchema>

@Controller("/sessions")
export class AuthenticateController {
  constructor(private authenticateStudent: AuthenticateStudentUseCase) {}

  @Post()
  @UsePipes(new ZodValidationPipe(bodySchema))
  async handle(@Body() body: AuthenticateBodySchema) {
    const { email, password } = body

    const result = await this.authenticateStudent.execute({
      email,
      password,
    })

    if (result.isLeft()) {
      throw new Error("Invalid credentials.")
    }

    const { accessToken } = result.value

    return { accessToken }
  }
}
