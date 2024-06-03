import { Notification as PrismaNotification, Prisma } from "@prisma/client"

import { UniqueEntityID } from "@/core/entities/unique-entity-id"
import { Notification } from "@/domain/notification/enterprise/entities/notification"

export class PrismaNotificationMapper {
  static toDomain(raw: PrismaNotification): Notification {
    return Notification.create(
      {
        title: raw.title,
        content: raw.content,
        createdAt: raw.createdAt,
        readAt: raw.readAt,
        recipientId: new UniqueEntityID(raw.recipientId),
      },
      new UniqueEntityID(raw.id),
    )
  }

  static toPrisma(
    notification: Notification,
  ): Prisma.NotificationUncheckedCreateInput {
    return {
      id: notification.id.toString(),
      recipientId: notification.recipientId.toString(),
      title: notification.title,
      content: notification.content,
      createdAt: notification.createdAt,
      readAt: notification.readAt,
    }
  }
}
