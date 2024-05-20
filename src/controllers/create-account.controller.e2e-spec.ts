import type { INestApplication } from "@nestjs/common"
import { Test } from "@nestjs/testing"
import request from "supertest"

import { AppModule } from "@/app.module"
import { PrismaService } from "@/prisma/prisma.service"

let app: INestApplication
let prisma: PrismaService

describe("Create Account (E2E)", () => {
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleRef.createNestApplication()
    prisma = moduleRef.get(PrismaService)

    await app.init()
  })

  test("[POST] /accounts", async () => {
    const response = await request(app.getHttpServer()).post("/accounts").send({
      name: "John Doe",
      email: "johndoe@example.com",
      password: "123456",
    })

    expect(response.statusCode).toEqual(201)

    const user = await prisma.user.findUnique({
      where: {
        email: "johndoe@example.com",
      },
    })

    expect(user).toBeTruthy()
  })
})
