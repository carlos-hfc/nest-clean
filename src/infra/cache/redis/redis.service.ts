import { Injectable, OnModuleDestroy } from "@nestjs/common"
import { Redis } from "ioredis"

import { EnvService } from "@/infra/env/env.service"

@Injectable()
export class RedisService extends Redis implements OnModuleDestroy {
  constructor(env: EnvService) {
    super({
      host: env.get("REDIS_HOST"),
      port: Number(env.get("REDIS_PORT")),
      db: Number(env.get("REDIS_DB")),
    })
  }

  onModuleDestroy() {
    return this.disconnect()
  }
}
