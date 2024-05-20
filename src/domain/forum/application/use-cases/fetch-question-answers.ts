import { type Either, right } from "@/core/either"

import type { Answer } from "../../enterprise/entities/answer"
import type { AnswersRepository } from "../repositories/answers-repository"

interface FetchQuestionAnswersUseCaseRequest {
  questionId: string
  page: number
}

type FetchQuestionAnswersUseCaseResponse = Either<
  null,
  {
    answers: Answer[]
  }
>

export class FetchQuestionAnswersUseCase {
  constructor(private answerssRepository: AnswersRepository) {}

  async execute({
    questionId,
    page,
  }: FetchQuestionAnswersUseCaseRequest): Promise<FetchQuestionAnswersUseCaseResponse> {
    const answers = await this.answerssRepository.findManyByQuestionId(
      questionId,
      { page },
    )

    return right({ answers })
  }
}
