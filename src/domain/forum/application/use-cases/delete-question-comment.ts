import { type Either, left, right } from "@/core/either"
import { NotAllowed } from "@/core/errors/not-allowed"
import { ResourceNotFound } from "@/core/errors/resource-not-found"

import type { QuestionCommentsRepository } from "../repositories/question-comments-repository"

interface DeleteQuestionCommentUseCaseRequest {
  questionCommentId: string
  authorId: string
}

type DeleteQuestionCommentUseCaseResponse = Either<
  ResourceNotFound | NotAllowed,
  object
>

export class DeleteQuestionCommentUseCase {
  constructor(private questioncommentsRepository: QuestionCommentsRepository) {}

  async execute({
    questionCommentId,
    authorId,
  }: DeleteQuestionCommentUseCaseRequest): Promise<DeleteQuestionCommentUseCaseResponse> {
    const questionComment =
      await this.questioncommentsRepository.findById(questionCommentId)

    if (!questionComment) {
      return left(new ResourceNotFound())
    }

    if (authorId !== questionComment.authorId.toString()) {
      return left(new NotAllowed())
    }

    await this.questioncommentsRepository.delete(questionComment)

    return right({})
  }
}
