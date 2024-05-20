import { type Either, left, right } from "@/core/either"
import { NotAllowed } from "@/core/errors/not-allowed"
import { ResourceNotFound } from "@/core/errors/resource-not-found"

import type { AnswerCommentsRepository } from "../repositories/answer-comments-repository"

interface DeleteAnswerCommentUseCaseRequest {
  answerCommentId: string
  authorId: string
}

type DeleteAnswerCommentUseCaseResponse = Either<
  ResourceNotFound | NotAllowed,
  object
>

export class DeleteAnswerCommentUseCase {
  constructor(private answercommentsRepository: AnswerCommentsRepository) {}

  async execute({
    answerCommentId,
    authorId,
  }: DeleteAnswerCommentUseCaseRequest): Promise<DeleteAnswerCommentUseCaseResponse> {
    const answerComment =
      await this.answercommentsRepository.findById(answerCommentId)

    if (!answerComment) {
      return left(new ResourceNotFound())
    }

    if (authorId !== answerComment.authorId.toString()) {
      return left(new NotAllowed())
    }

    await this.answercommentsRepository.delete(answerComment)

    return right({})
  }
}
