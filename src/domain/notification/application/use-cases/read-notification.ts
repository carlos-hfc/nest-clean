import { type Either, left, right } from "@/core/either"
import { NotAllowed } from "@/core/errors/not-allowed"
import { ResourceNotFound } from "@/core/errors/resource-not-found"

import type { Notification } from "../../enterprise/entities/notification"
import { NotificationsRepository } from "../repositories/notifications-repository"

interface ReadNotificationUseCaseRequest {
  recipientId: string
  notificationId: string
}

type ReadNotificationUseCaseResponse = Either<
  ResourceNotFound | NotAllowed,
  { notification: Notification }
>

export class ReadNotificationUseCase {
  constructor(private notificationsRepository: NotificationsRepository) {}

  async execute({
    notificationId,
    recipientId,
  }: ReadNotificationUseCaseRequest): Promise<ReadNotificationUseCaseResponse> {
    const notification =
      await this.notificationsRepository.findById(notificationId)

    if (!notification) {
      return left(new ResourceNotFound())
    }

    if (recipientId !== notification.recipientId.toString()) {
      return left(new NotAllowed())
    }

    notification.read()

    await this.notificationsRepository.save(notification)

    return right({ notification })
  }
}
