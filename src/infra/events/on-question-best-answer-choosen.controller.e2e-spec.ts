import { INestApplication } from "@nestjs/common"
import { JwtService } from "@nestjs/jwt"
import { Test } from "@nestjs/testing"
import request from "supertest"
import { AnswerFactory } from "test/factories/make-answer"
import { QuestionFactory } from "test/factories/make-question"
import { StudentFactory } from "test/factories/make-student"
import { waitFor } from "test/utils/wait-for"

import { DomainEvents } from "@/core/events/domain-events"
import { AppModule } from "@/infra/app.module"
import { DatabaseModule } from "@/infra/database/database.module"
import { PrismaService } from "@/infra/database/prisma/prisma.service"

let app: INestApplication
let studentFactory: StudentFactory
let questionFactory: QuestionFactory
let answerFactory: AnswerFactory
let prisma: PrismaService
let jwt: JwtService

describe("On Question Best Answer Chosen (E2E)", () => {
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [StudentFactory, QuestionFactory, AnswerFactory],
    }).compile()

    app = moduleRef.createNestApplication()

    studentFactory = moduleRef.get(StudentFactory)
    questionFactory = moduleRef.get(QuestionFactory)
    answerFactory = moduleRef.get(AnswerFactory)
    prisma = moduleRef.get(PrismaService)
    jwt = moduleRef.get(JwtService)

    DomainEvents.shouldRun = true

    await app.init()
  })

  it("should send a notification when question best answer is chosen", async () => {
    const user = await studentFactory.makePrismaStudent()

    const token = jwt.sign({ sub: user.id.toString() })

    const question = await questionFactory.makePrismaQuestion({
      authorId: user.id,
    })

    const answer = await answerFactory.makePrismaAnswer({
      authorId: user.id,
      questionId: question.id,
    })

    await request(app.getHttpServer())
      .patch(`/answers/${answer.id.toString()}/choose-as-best`)
      .set("Authorization", `Bearer ${token}`)
      .send()

    await waitFor(async () => {
      const notificationOnDb = await prisma.notification.findFirst({
        where: {
          recipientId: user.id.toString(),
        },
      })

      expect(notificationOnDb).toBeTruthy()
    })
  })
})
