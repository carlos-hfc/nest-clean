import { Injectable } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { PassportStrategy } from "@nestjs/passport"
import { ExtractJwt, Strategy } from "passport-jwt"
import { z } from "zod"

import type { Env } from "@/infra/env"

const userPayload = z.object({
  sub: z.string().uuid(),
})

export type UserPayload = z.infer<typeof userPayload>

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService<Env, true>) {
    const publicKey = config.get("JWT_PUBLIC_KEY", { infer: true })

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: Buffer.from(publicKey, "base64"),
      algorithms: ["RS256"],
    })
  }

  async validate(payload: UserPayload) {
    return userPayload.parse(payload)
  }
}
