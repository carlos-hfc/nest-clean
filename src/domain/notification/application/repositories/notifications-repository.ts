import type { Notification } from "../../enterprise/entities/notification"

export interface NotificationsRepository {
  // countManyByRecipientId(recipientId: string): Promise<number>
  findById(id: string): Promise<Notification | null>
  // findManyByRecipientId(recipientId: string): Promise<Notification[]>
  create(notification: Notification): Promise<void>
  save(notification: Notification): Promise<void>
}
