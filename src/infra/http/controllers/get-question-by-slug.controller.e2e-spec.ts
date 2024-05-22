import type { INestApplication } from "@nestjs/common"
import { JwtService } from "@nestjs/jwt"
import { Test } from "@nestjs/testing"
import request from "supertest"

import { AppModule } from "@/infra/app.module"
import { PrismaService } from "@/infra/database/prisma/prisma.service"

let app: INestApplication
let prisma: PrismaService
let jwt: JwtService

describe("Get Question By Slug (E2E)", () => {
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleRef.createNestApplication()
    prisma = moduleRef.get(PrismaService)
    jwt = moduleRef.get(JwtService)

    await app.init()
  })

  test("[GET] /questions/:slug", async () => {
    const user = await prisma.user.create({
      data: {
        name: "John Doe",
        email: "johndoe@example.com",
        password: "123456",
      },
    })

    const token = jwt.sign({ sub: user.id })

    await prisma.question.create({
      data: {
        title: "Question-1",
        content: "Question content",
        slug: "question-1",
        authorId: user.id,
      },
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
