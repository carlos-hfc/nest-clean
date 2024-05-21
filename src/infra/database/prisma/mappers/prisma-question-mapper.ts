import type { Question as PrismaQuestion } from "@prisma/client"

import { UniqueEntityID } from "@/core/entities/unique-entity-id"
import { Question } from "@/domain/forum/enterprise/entities/question"
import { Slug } from "@/domain/forum/enterprise/entities/value-objects/slug"

export class PrismaQuestionMapper {
  static toDomain(raw: PrismaQuestion) {
    return Question.create(
      {
        authorId: new UniqueEntityID(raw.authorId),
        title: raw.title,
        content: raw.content,
        bestAnswerId: raw.bestAnswerId
          ? new UniqueEntityID(raw.bestAnswerId)
          : null,
        slug: Slug.create(raw.slug),
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
      },
      new UniqueEntityID(raw.id),
    )
  }
}
