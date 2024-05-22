import type { INestApplication } from "@nestjs/common"
import { JwtService } from "@nestjs/jwt"
import { Test } from "@nestjs/testing"
import request from "supertest"
import { QuestionFactory } from "test/factories/make-question"
import { StudentFactory } from "test/factories/make-student"

import { Slug } from "@/domain/forum/enterprise/entities/value-objects/slug"
import { AppModule } from "@/infra/app.module"
import { DatabaseModule } from "@/infra/database/database.module"

let app: INestApplication
let studentFactory: StudentFactory
let questionFactory: QuestionFactory
let jwt: JwtService

describe("Get Question By Slug (E2E)", () => {
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [StudentFactory, QuestionFactory],
    }).compile()

    app = moduleRef.createNestApplication()

    studentFactory = moduleRef.get(StudentFactory)
    questionFactory = moduleRef.get(QuestionFactory)
    jwt = moduleRef.get(JwtService)

    await app.init()
  })

  test("[GET] /questions/:slug", async () => {
    const user = await studentFactory.makePrismaStudent()

    const token = jwt.sign({ sub: user.id.toString() })

    await questionFactory.makePrismaQuestion({
      title: "Question-1",
      content: "Question content",
      slug: Slug.create("question-1"),
      authorId: user.id,
    })

    const response = await request(app.getHttpServer())
      .get(`/questions/question-1`)
      .set("Authorization", `Bearer ${token}`)
      .send()

    expect(response.statusCode).toEqual(200)
    expect(response.body.question).toEqual(
      expect.objectContaining({ title: "Question-1" }),
    )
  })
})
