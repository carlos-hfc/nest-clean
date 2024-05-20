import type { INestApplication } from "@nestjs/common"
import { JwtService } from "@nestjs/jwt"
import { Test } from "@nestjs/testing"
import request from "supertest"

import { AppModule } from "@/infra/app.module"
import { PrismaService } from "@/infra/database/prisma/prisma.service"

let app: INestApplication
let prisma: PrismaService
let jwt: JwtService

describe("Fetch Recent Questions (E2E)", () => {
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleRef.createNestApplication()
    prisma = moduleRef.get(PrismaService)
    jwt = moduleRef.get(JwtService)

    await app.init()
  })

  test("[GET] /questions", async () => {
    const user = await prisma.user.create({
      data: {
        name: "John Doe",
        email: "johndoe@example.com",
        password: "123456",
      },
    })

    const token = jwt.sign({ sub: user.id })

    await prisma.question.createMany({
      data: [
        {
          title: "Question-1",
          content: "Question content",
          slug: "question-1",
          authorId: user.id,
        },
        {
          title: "Question-2",
          content: "Question content",
          slug: "question-2",
          authorId: user.id,
        },
        {
          title: "Question-3",
          content: "Question content",
          slug: "question-3",
          authorId: user.id,
        },
      ],
    })

    const response = await request(app.getHttpServer())
      .get("/questions")
      .set("Authorization", `Bearer ${token}`)
      .send()

    expect(response.statusCode).toEqual(200)
    expect(response.body.questions).toHaveLength(3)
  })
})
