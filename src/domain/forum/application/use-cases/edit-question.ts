import { type Either, left, right } from "@/core/either"
import { UniqueEntityID } from "@/core/entities/unique-entity-id"
import { NotAllowed } from "@/core/errors/not-allowed"
import { ResourceNotFound } from "@/core/errors/resource-not-found"

import type { Question } from "../../enterprise/entities/question"
import { QuestionAttachment } from "../../enterprise/entities/question-attachment"
import { QuestionAttachmentList } from "../../enterprise/entities/question-attachment-list"
import type { QuestionAttachmentsRepository } from "../repositories/question-attachments-repository"
import type { QuestionsRepository } from "../repositories/questions-repository"

interface EditQuestionUseCaseRequest {
  authorId: string
  questionId: string
  title: string
  content: string
  attachmentsIds: string[]
}

type EditQuestionUseCaseResponse = Either<
  ResourceNotFound | NotAllowed,
  {
    question: Question
  }
>

export class EditQuestionUseCase {
  constructor(
    private questionsRepository: QuestionsRepository,
    private questionAttachmentsRepository: QuestionAttachmentsRepository,
  ) {}

  async execute({
    questionId,
    authorId,
    title,
    content,
    attachmentsIds,
  }: EditQuestionUseCaseRequest): Promise<EditQuestionUseCaseResponse> {
    const question = await this.questionsRepository.findById(questionId)

    if (!question) {
      return left(new ResourceNotFound())
    }

    if (authorId !== question.authorId.toString()) {
      return left(new NotAllowed())
    }

    const currentQuestionAttachments =
      await this.questionAttachmentsRepository.findManyByQuestionId(questionId)

    const questionAttachmentList = new QuestionAttachmentList(
      currentQuestionAttachments,
    )

    const questionAttachments = attachmentsIds.map(attachmentId => {
      return QuestionAttachment.create({
        attachmentId: new UniqueEntityID(attachmentId),
        questionId: question.id,
      })
    })

    questionAttachmentList.update(questionAttachments)

    question.title = title
    question.content = content
    question.attachments = questionAttachmentList

    await this.questionsRepository.save(question)

    return right({ question })
  }
}
