import {
  Injectable,
  type OnModuleDestroy,
  type OnModuleInit,
} from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { PrismaClient } from "@prisma/client"

import type { Env } from "@/infra/env/env"

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor(private config: ConfigService<Env, true>) {
    super({
      log: config.get("NODE_ENV") === "dev" ? ["query"] : [],
    })
  }

  onModuleInit() {
    return this.$connect()
  }

  onModuleDestroy() {
    return this.$disconnect()
  }
}
