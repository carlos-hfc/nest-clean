import { INestApplication } from "@nestjs/common"
import { JwtService } from "@nestjs/jwt"
import { Test } from "@nestjs/testing"
import request from "supertest"
import { AnswerFactory } from "test/factories/make-answer"
import { AnswerAttachmentFactory } from "test/factories/make-answer-attachment"
import { AttachmentFactory } from "test/factories/make-attachment"
import { QuestionFactory } from "test/factories/make-question"
import { StudentFactory } from "test/factories/make-student"

import { AppModule } from "@/infra/app.module"
import { DatabaseModule } from "@/infra/database/database.module"
import { PrismaService } from "@/infra/database/prisma/prisma.service"

let app: INestApplication
let studentFactory: StudentFactory
let questionFactory: QuestionFactory
let answerFactory: AnswerFactory
let attachmentFactory: AttachmentFactory
let answerAttachmentFactory: AnswerAttachmentFactory
let prisma: PrismaService
let jwt: JwtService

describe("Edit Answer (E2E)", () => {
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [
        StudentFactory,
        QuestionFactory,
        AnswerFactory,
        AttachmentFactory,
        AnswerAttachmentFactory,
      ],
    }).compile()

    app = moduleRef.createNestApplication()

    studentFactory = moduleRef.get(StudentFactory)
    questionFactory = moduleRef.get(QuestionFactory)
    answerFactory = moduleRef.get(AnswerFactory)
    answerAttachmentFactory = moduleRef.get(AnswerAttachmentFactory)
    attachmentFactory = moduleRef.get(AttachmentFactory)
    prisma = moduleRef.get(PrismaService)
    jwt = moduleRef.get(JwtService)

    await app.init()
  })

  test("[PUT] /answers/:id", async () => {
    const user = await studentFactory.makePrismaStudent()

    const token = jwt.sign({ sub: user.id.toString() })

    const attachment1 = await attachmentFactory.makePrismaAttachment()
    const attachment2 = await attachmentFactory.makePrismaAttachment()

    const question = await questionFactory.makePrismaQuestion({
      authorId: user.id,
    })

    const answer = await answerFactory.makePrismaAnswer({
      authorId: user.id,
      questionId: question.id,
    })

    await answerAttachmentFactory.makePrismaAnswerAttachment({
      attachmentId: attachment1.id,
      answerId: answer.id,
    })
    await answerAttachmentFactory.makePrismaAnswerAttachment({
      attachmentId: attachment2.id,
      answerId: answer.id,
    })

    const attachment3 = await attachmentFactory.makePrismaAttachment()

    const response = await request(app.getHttpServer())
      .put(`/answers/${answer.id.toString()}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        content: "New answer",
        attachments: [attachment1.id.toString(), attachment3.id.toString()],
      })

    expect(response.statusCode).toEqual(204)

    const answerOnDb = await prisma.answer.findFirst({
      where: {
        content: "New answer",
      },
    })

    expect(answerOnDb).toBeTruthy()

    const attachmentOnDb = await prisma.attachment.findMany({
      where: {
        answerId: answerOnDb?.id,
      },
    })

    expect(attachmentOnDb).toBeTruthy()
    expect(attachmentOnDb).toHaveLength(2)
    expect(attachmentOnDb).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: attachment1.id.toString() }),
        expect.objectContaining({ id: attachment3.id.toString() }),
      ]),
    )
  })
})
