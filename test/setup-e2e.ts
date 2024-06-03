import { execSync } from "node:child_process"
import { randomUUID } from "node:crypto"

import { PrismaClient } from "@prisma/client"
import { config } from "dotenv"

import { DomainEvents } from "@/core/events/domain-events"

config({ path: ".env", override: true })
config({ path: ".env.test", override: true })

const prisma = new PrismaClient()

function generateDbUrl(schemaId: string) {
  if (!process.env.DATABASE_URL) {
    throw new Error("Please provide a DATABASE_URL environment variable")
  }

  const url = new URL(process.env.DATABASE_URL)

  url.searchParams.set("schema", schemaId)

  return url.toString()
}

const schema = randomUUID()

beforeAll(async () => {
  const dbUrl = generateDbUrl(schema)

  process.env.DATABASE_URL = dbUrl

  DomainEvents.shouldRun = false

  execSync("pnpm prisma migrate deploy")
})

afterAll(async () => {
  await prisma.$executeRawUnsafe(`DROP SCHEMA IF EXISTS "${schema}" CASCADE;`)

  await prisma.$disconnect()
})
