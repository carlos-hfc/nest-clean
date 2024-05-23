import { INestApplication } from "@nestjs/common"
import { JwtService } from "@nestjs/jwt"
import { Test } from "@nestjs/testing"
import request from "supertest"
import { QuestionFactory } from "test/factories/make-question"
import { QuestionCommentFactory } from "test/factories/make-question-comment"
import { StudentFactory } from "test/factories/make-student"

import { AppModule } from "@/infra/app.module"
import { DatabaseModule } from "@/infra/database/database.module"
import { PrismaService } from "@/infra/database/prisma/prisma.service"

let app: INestApplication
let studentFactory: StudentFactory
let questionCommentFactory: QuestionCommentFactory
let questionFactory: QuestionFactory
let prisma: PrismaService
let jwt: JwtService

describe("Delete Answer (E2E)", () => {
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [StudentFactory, QuestionFactory, QuestionCommentFactory],
    }).compile()

    app = moduleRef.createNestApplication()

    studentFactory = moduleRef.get(StudentFactory)
    questionFactory = moduleRef.get(QuestionFactory)
    questionCommentFactory = moduleRef.get(QuestionCommentFactory)
    prisma = moduleRef.get(PrismaService)
    jwt = moduleRef.get(JwtService)

    await app.init()
  })

  test("[DELETE] /questions/comments/:id", async () => {
    const user = await studentFactory.makePrismaStudent()

    const token = jwt.sign({ sub: user.id.toString() })

    const question = await questionFactory.makePrismaQuestion({
      authorId: user.id,
    })

    const questionComment =
      await questionCommentFactory.makePrismaQuestionComment({
        authorId: user.id,
        questionId: question.id,
      })

    const response = await request(app.getHttpServer())
      .delete(`/questions/comments/${questionComment.id.toString()}`)
      .set("Authorization", `Bearer ${token}`)
      .send()

    expect(response.statusCode).toEqual(204)

    const questionCommentOnDb = await prisma.comment.findUnique({
      where: {
        id: questionComment.id.toString(),
      },
    })

    expect(questionCommentOnDb).toBeNull()
  })
})
