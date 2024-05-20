import { Injectable } from "@nestjs/common"

import { DomainEvents } from "@/core/events/domain-events"
import type { PaginationParams } from "@/core/repositories/pagination-params"
import type { QuestionAttachmentsRepository } from "@/domain/forum/application/repositories/question-attachments-repository"
import type { QuestionsRepository } from "@/domain/forum/application/repositories/questions-repository"
import type { Question } from "@/domain/forum/enterprise/entities/question"

import { PrismaQuestionMapper } from "../mappers/prisma-question-mapper"
import type { PrismaService } from "../prisma.service"

@Injectable()
export class PrismaQuestionsRepository implements QuestionsRepository {
  public items: Question[] = []

  constructor(
    private prisma: PrismaService,
    private questionAttachmentsRepository: QuestionAttachmentsRepository,
  ) {}

  async findById(id: string): Promise<Question | null> {
    const question = await this.prisma.question.findUnique({
      where: {
        id,
      },
    })

    if (!question) return null

    return PrismaQuestionMapper.toDomain(question)
  }

  async findBySlug(slug: string): Promise<Question | null> {
    return this.items.find(item => item.slug.value === slug) ?? null
  }

  async findManyRecent({ page }: PaginationParams): Promise<Question[]> {
    const questions = this.items
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice((page - 1) * 20, page * 20)

    return questions
  }

  async save(question: Question): Promise<void> {
    const itemIndex = this.items.findIndex(item => item.id === question.id)

    this.items[itemIndex] = question

    DomainEvents.dispatchEventsForAggregate(question.id)
  }

  async create(question: Question): Promise<void> {
    this.items.push(question)

    DomainEvents.dispatchEventsForAggregate(question.id)
  }

  async delete(question: Question): Promise<void> {
    const itemIndex = this.items.findIndex(item => item.id === question.id)

    this.items.splice(itemIndex, 1)

    this.questionAttachmentsRepository.deleteManyByQuestionId(
      question.id.toString(),
    )
  }
}
