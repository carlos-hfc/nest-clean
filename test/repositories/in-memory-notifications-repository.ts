import type { NotificationsRepository } from "@/domain/notification/application/repositories/notifications-repository"
import type { Notification } from "@/domain/notification/enterprise/entities/notification"

export class InMemoryNotificationsRepository
  implements NotificationsRepository
{
  public items: Notification[] = []

  // async countManyByRecipientId(recipientId: string): Promise<number> {
  //   return this.notifications.filter(item => item.recipientId === recipientId).length;
  // }

  async findById(id: string): Promise<Notification | null> {
    return this.items.find(item => item.id.toString() === id) ?? null
  }

  // async findManyByRecipientId(recipientId: string): Promise<Notification[]> {
  //   return this.notifications.filter(item => item.recipientId === recipientId);
  // }

  async create(notification: Notification) {
    this.items.push(notification)
  }

  async save(notification: Notification): Promise<void> {
    const itemIndex = this.items.findIndex(item => item.id === notification.id)

    this.items[itemIndex] = notification
  }
}
