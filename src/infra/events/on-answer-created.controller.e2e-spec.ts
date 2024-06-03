import { INestApplication } from "@nestjs/common"
import { JwtService } from "@nestjs/jwt"
import { Test } from "@nestjs/testing"
import request from "supertest"
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
let prisma: PrismaService
let jwt: JwtService

describe("On Answer Created (E2E)", () => {
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [StudentFactory, QuestionFactory],
    }).compile()

    app = moduleRef.createNestApplication()

    studentFactory = moduleRef.get(StudentFactory)
    questionFactory = moduleRef.get(QuestionFactory)
    prisma = moduleRef.get(PrismaService)
    jwt = moduleRef.get(JwtService)

    DomainEvents.shouldRun = true

    await app.init()
  })

  it("should send a notification when answer is created", async () => {
    const user = await studentFactory.makePrismaStudent()

    const token = jwt.sign({ sub: user.id.toString() })

    const question = await questionFactory.makePrismaQuestion({
      authorId: user.id,
    })

    await request(app.getHttpServer())
      .post(`/questions/${question.id.toString()}/answers`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        content: "New answer",
        attachments: [],
      })

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
