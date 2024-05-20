import { makeNotification } from "test/factories/make-notification"
import { InMemoryNotificationsRepository } from "test/repositories/in-memory-notifications-repository"

import { UniqueEntityID } from "@/core/entities/unique-entity-id"
import { NotAllowed } from "@/core/errors/not-allowed"

import { ReadNotificationUseCase } from "./read-notification"

let inMemoryNotificationsRepository: InMemoryNotificationsRepository
let sut: ReadNotificationUseCase

describe("ReadNotificationUseCase", () => {
  beforeEach(() => {
    inMemoryNotificationsRepository = new InMemoryNotificationsRepository()
    sut = new ReadNotificationUseCase(inMemoryNotificationsRepository)
  })

  it("should be able to read a notification", async () => {
    const notification = makeNotification()

    await inMemoryNotificationsRepository.create(notification)

    const result = await sut.execute({
      notificationId: notification.id.toString(),
      recipientId: notification.recipientId.toString(),
    })

    expect(result.isRight()).toBe(true)
    expect(inMemoryNotificationsRepository.items[0].readAt).toEqual(
      expect.any(Date),
    )
  })

  it("should not be able to read a notification from another user", async () => {
    const notification = makeNotification(
      {
        recipientId: new UniqueEntityID("recipient-1"),
      },
      new UniqueEntityID("notification-1"),
    )

    await inMemoryNotificationsRepository.create(notification)

    const result = await sut.execute({
      notificationId: "notification-1",
      recipientId: "recipient-2",
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(NotAllowed)
  })
})
