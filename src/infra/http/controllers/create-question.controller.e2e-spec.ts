import type { INestApplication } from "@nestjs/common"
import { JwtService } from "@nestjs/jwt"
import { Test } from "@nestjs/testing"
import request from "supertest"
import { AttachmentFactory } from "test/factories/make-attachment"
import { StudentFactory } from "test/factories/make-student"

import { AppModule } from "@/infra/app.module"
import { DatabaseModule } from "@/infra/database/database.module"
import { PrismaService } from "@/infra/database/prisma/prisma.service"

let app: INestApplication
let studentFactory: StudentFactory
let attachmentFactory: AttachmentFactory
let prisma: PrismaService
let jwt: JwtService

describe("Create Question (E2E)", () => {
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [StudentFactory, AttachmentFactory],
    }).compile()

    app = moduleRef.createNestApplication()

    studentFactory = moduleRef.get(StudentFactory)
    attachmentFactory = moduleRef.get(AttachmentFactory)
    prisma = moduleRef.get(PrismaService)
    jwt = moduleRef.get(JwtService)

    await app.init()
  })

  test("[POST] /questions", async () => {
    const user = await studentFactory.makePrismaStudent()

    const token = jwt.sign({ sub: user.id.toString() })

    const attachment1 = await attachmentFactory.makePrismaAttachment()
    const attachment2 = await attachmentFactory.makePrismaAttachment()

    const response = await request(app.getHttpServer())
      .post("/questions")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "New question",
        content: "Question content",
        attachments: [attachment1.id.toString(), attachment2.id.toString()],
      })

    expect(response.statusCode).toEqual(201)

    const questionOnDb = await prisma.question.findFirst({
      where: {
        title: "New question",
      },
    })

    expect(questionOnDb).toBeTruthy()

    const attachmentsOnDb = await prisma.attachment.findMany({
      where: {
        questionId: questionOnDb?.id,
      },
    })

    expect(attachmentsOnDb).toBeTruthy()
    expect(attachmentsOnDb).toHaveLength(2)
  })
})
