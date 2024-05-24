import { execSync } from "node:child_process"
import { randomUUID } from "node:crypto"

import { PrismaClient } from "@prisma/client"
import { config } from "dotenv"

config({ path: ".env", override: true })
config({ path: ".env.test", override: true })

const prisma = new PrismaClient()

function generateDbUrl(databaseName: string) {
  if (!process.env.DATABASE_URL) {
    throw new Error("Please provide a DATABASE_URL environment variable")
  }

  const url = new URL(process.env.DATABASE_URL)

  url.pathname = `/${databaseName}`

  return url.toString()
}

const schema = randomUUID()

const dbName = `nest_clean_${schema.replace(/-/g, "_")}`

beforeAll(async () => {
  const dbUrl = generateDbUrl(dbName)

  process.env.DATABASE_URL = dbUrl

  execSync("pnpm prisma migrate deploy")
})

afterAll(async () => {
  await prisma.$executeRawUnsafe(`DROP DATABASE IF EXISTS ${dbName};`)

  await prisma.$disconnect()
})
