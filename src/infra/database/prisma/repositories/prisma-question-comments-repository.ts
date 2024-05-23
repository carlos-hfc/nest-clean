import { Injectable } from "@nestjs/common"

import { PaginationParams } from "@/core/repositories/pagination-params"
import { QuestionCommentsRepository } from "@/domain/forum/application/repositories/question-comments-repository"
import { QuestionComment } from "@/domain/forum/enterprise/entities/question-comment"

import { PrismaQuestionCommentMapper } from "../mappers/prisma-question-comment-mapper"
import { PrismaService } from "../prisma.service"

@Injectable()
export class PrismaQuestionCommentsRepository
  implements QuestionCommentsRepository
{
  public items: QuestionComment[] = []

  constructor(private prisma: PrismaService) {}

  async findById(id: string): Promise<QuestionComment | null> {
    const questionComment = await this.prisma.comment.findUnique({
      where: {
        id,
      },
    })

    if (!questionComment) return null

    return PrismaQuestionCommentMapper.toDomain(questionComment)
  }

  async findManyByQuestionId(
    questionId: string,
    { page }: PaginationParams,
  ): Promise<QuestionComment[]> {
    const perPage = 20

    const questionComments = await this.prisma.comment.findMany({
      where: {
        questionId,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: perPage,
      skip: (page - 1) * perPage,
    })

    return questionComments.map(PrismaQuestionCommentMapper.toDomain)
  }

  async create(questionComment: QuestionComment): Promise<void> {
    const data = PrismaQuestionCommentMapper.toPrisma(questionComment)

    await this.prisma.comment.create({
      data,
    })
  }

  async delete(questionComment: QuestionComment): Promise<void> {
    await this.prisma.comment.delete({
      where: {
        id: questionComment.id.toString(),
      },
    })
  }
}
