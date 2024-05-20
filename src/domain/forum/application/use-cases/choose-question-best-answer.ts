import { type Either, left, right } from "@/core/either"
import { NotAllowed } from "@/core/errors/not-allowed"
import { ResourceNotFound } from "@/core/errors/resource-not-found"

import { Question } from "../../enterprise/entities/question"
import type { AnswersRepository } from "../repositories/answers-repository"
import type { QuestionsRepository } from "../repositories/questions-repository"

interface ChooseQuestionBestAnswerUseCaseRequest {
  authorId: string
  answerId: string
}

type ChooseQuestionBestAnswerUseCaseResponse = Either<
  ResourceNotFound | NotAllowed,
  {
    question: Question
  }
>

export class ChooseQuestionBestAnswerUseCase {
  constructor(
    private questionsRepository: QuestionsRepository,
    private answersRepository: AnswersRepository,
  ) {}

  async execute({
    authorId,
    answerId,
  }: ChooseQuestionBestAnswerUseCaseRequest): Promise<ChooseQuestionBestAnswerUseCaseResponse> {
    const answer = await this.answersRepository.findById(answerId)

    if (!answer) {
      return left(new ResourceNotFound())
    }

    const question = await this.questionsRepository.findById(
      answer.questionId.toString(),
    )

    if (!question) {
      return left(new ResourceNotFound())
    }

    if (authorId !== question.authorId.toString()) {
      return left(new NotAllowed())
    }

    question.bestAnswerId = answer.id

    await this.questionsRepository.save(question)

    return right({ question })
  }
}
