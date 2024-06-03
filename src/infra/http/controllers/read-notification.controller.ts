import {
  BadRequestException,
  Controller,
  HttpCode,
  Param,
  Patch,
} from "@nestjs/common"
import { z } from "zod"

import { ReadNotificationUseCase } from "@/domain/notification/application/use-cases/read-notification"
import { CurrentUser } from "@/infra/auth/current-user-decorator"
import { UserPayload } from "@/infra/auth/jwt.strategy"
import { ZodValidationPipe } from "@/infra/http/pipes/zod-validation.pipe"

const paramSchema = z.string()

const paramValidation = new ZodValidationPipe(paramSchema)

type ParamSchema = z.infer<typeof paramSchema>

@Controller("/notifications/:notificationId/read")
export class ReadNotificationController {
  constructor(private readNotification: ReadNotificationUseCase) {}

  @Patch()
  @HttpCode(204)
  async handle(
    @CurrentUser() user: UserPayload,
    @Param("notificationId", paramValidation) notificationId: ParamSchema,
  ) {
    const result = await this.readNotification.execute({
      notificationId,
      recipientId: user.sub,
    })

    if (result.isLeft()) {
      throw new BadRequestException()
    }
  }
}
