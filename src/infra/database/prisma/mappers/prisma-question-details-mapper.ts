import {
  Attachment as PrismaAttachment,
  Question as PrismaQuestion,
  User as PrismaUser,
} from "@prisma/client"

import { UniqueEntityID } from "@/core/entities/unique-entity-id"
import { QuestionDetails } from "@/domain/forum/enterprise/entities/value-objects/question-details"
import { Slug } from "@/domain/forum/enterprise/entities/value-objects/slug"

import { PrismaAttachmentMapper } from "./prisma-attachment-mapper"

type PrismaQuestionDetails = PrismaQuestion & {
  author: PrismaUser
  attachments: PrismaAttachment[]
}

export class PrismaQuestionDetailsMapper {
  static toDomain(raw: PrismaQuestionDetails): QuestionDetails {
    return QuestionDetails.create({
      questionId: new UniqueEntityID(raw.id),
      bestAnswerId: raw.bestAnswerId
        ? new UniqueEntityID(raw.bestAnswerId)
        : null,
      authorId: new UniqueEntityID(raw.author.id),
      authorName: raw.author.name,
      title: raw.title,
      slug: Slug.create(raw.slug),
      content: raw.content,
      attachments: raw.attachments.map(PrismaAttachmentMapper.toDomain),
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    })
  }
}
