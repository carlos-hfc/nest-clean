import type { INestApplication } from "@nestjs/common"
import { JwtService } from "@nestjs/jwt"
import { Test } from "@nestjs/testing"
import request from "supertest"
import { QuestionFactory } from "test/factories/make-question"
import { QuestionCommentFactory } from "test/factories/make-question-comment"
import { StudentFactory } from "test/factories/make-student"

import { AppModule } from "@/infra/app.module"
import { DatabaseModule } from "@/infra/database/database.module"

let app: INestApplication
let studentFactory: StudentFactory
let questionFactory: QuestionFactory
let questionCommentFactory: QuestionCommentFactory
let jwt: JwtService

describe("Fetch Question Comments (E2E)", () => {
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [StudentFactory, QuestionFactory, QuestionCommentFactory],
    }).compile()

    app = moduleRef.createNestApplication()

    studentFactory = moduleRef.get(StudentFactory)
    questionFactory = moduleRef.get(QuestionFactory)
    questionCommentFactory = moduleRef.get(QuestionCommentFactory)
    jwt = moduleRef.get(JwtService)

    await app.init()
  })

  test("[GET] /questions/:questionId/comments", async () => {
    const user = await studentFactory.makePrismaStudent({ name: "John Doe" })

    const token = jwt.sign({ sub: user.id.toString() })

    const question = await questionFactory.makePrismaQuestion({
      authorId: user.id,
    })

    await Promise.all([
      questionCommentFactory.makePrismaQuestionComment({
        authorId: user.id,
        questionId: question.id,
        content: "QuestionComment 1",
      }),
      questionCommentFactory.makePrismaQuestionComment({
        authorId: user.id,
        questionId: question.id,
        content: "QuestionComment 2",
      }),
    ])

    const response = await request(app.getHttpServer())
      .get(`/questions/${question.id.toString()}/comments`)
      .set("Authorization", `Bearer ${token}`)
      .send()

    expect(response.statusCode).toEqual(200)
    expect(response.body.comments).toHaveLength(2)
    expect(response.body.comments).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          authorName: "John Doe",
          content: "QuestionComment 1",
        }),
        expect.objectContaining({
          authorName: "John Doe",
          content: "QuestionComment 2",
        }),
      ]),
    )
  })
})
