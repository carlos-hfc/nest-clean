import type { INestApplication } from "@nestjs/common"
import { JwtService } from "@nestjs/jwt"
import { Test } from "@nestjs/testing"
import request from "supertest"
import { StudentFactory } from "test/factories/make-student"

import { AppModule } from "@/infra/app.module"
import { DatabaseModule } from "@/infra/database/database.module"

let app: INestApplication
let studentFactory: StudentFactory
let jwt: JwtService

describe("Get Question By Slug (E2E)", () => {
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [StudentFactory],
    }).compile()

    app = moduleRef.createNestApplication()

    studentFactory = moduleRef.get(StudentFactory)
    jwt = moduleRef.get(JwtService)

    await app.init()
  })

  test("[POST] /attachments", async () => {
    const user = await studentFactory.makePrismaStudent()

    const token = jwt.sign({ sub: user.id.toString() })

    const response = await request(app.getHttpServer())
      .post(`/attachments`)
      .set("Authorization", `Bearer ${token}`)
      .attach("file", "./test/e2e/sample-upload.png")

    expect(response.statusCode).toEqual(201)
    expect(response.body).toEqual({
      attachmentId: expect.any(String),
    })
  })
})
