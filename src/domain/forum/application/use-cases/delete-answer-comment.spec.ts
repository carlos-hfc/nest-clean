import { makeAnswerComment } from "test/factories/make-answer-comment"
import { InMemoryAnswerCommentsRepository } from "test/repositories/in-memory-answer-comments-repository"

import { UniqueEntityID } from "@/core/entities/unique-entity-id"
import { NotAllowed } from "@/core/errors/not-allowed"

import { DeleteAnswerCommentUseCase } from "./delete-answer-comment"

let inMemoryAnswerCommentsRepository: InMemoryAnswerCommentsRepository
let sut: DeleteAnswerCommentUseCase

describe("DeleteAnswerCommentUseCase", () => {
  beforeEach(() => {
    inMemoryAnswerCommentsRepository = new InMemoryAnswerCommentsRepository()
    sut = new DeleteAnswerCommentUseCase(inMemoryAnswerCommentsRepository)
  })

  it("should be able to delete a answer comment", async () => {
    const answerComment = makeAnswerComment()

    await inMemoryAnswerCommentsRepository.create(answerComment)

    await sut.execute({
      answerCommentId: answerComment.id.toString(),
      authorId: answerComment.authorId.toString(),
    })

    expect(inMemoryAnswerCommentsRepository.items).toHaveLength(0)
  })

  it("should not be able to delete a answer comment from another user", async () => {
    const answerComment = makeAnswerComment({
      authorId: new UniqueEntityID("author-1"),
    })

    await inMemoryAnswerCommentsRepository.create(answerComment)

    const result = await sut.execute({
      answerCommentId: answerComment.id.toString(),
      authorId: "author-2",
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(NotAllowed)
  })
})
