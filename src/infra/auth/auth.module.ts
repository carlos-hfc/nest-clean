import { Module } from "@nestjs/common"
import { APP_GUARD } from "@nestjs/core"
import { JwtModule } from "@nestjs/jwt"
import { PassportModule } from "@nestjs/passport"

import { EnvModule } from "../env/env.module"
import { EnvService } from "../env/env.service"
import { JwtStrategy } from "./jwt.strategy"
import { JwtAuthGuard } from "./jwt-auth.guard"

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      imports: [EnvModule],
      inject: [EnvService],
      global: true,
      useFactory(config: EnvService) {
        const privateKey = config.get("JWT_PRIVATE_KEY")
        const publicKey = config.get("JWT_PUBLIC_KEY")

        return {
          signOptions: { algorithm: "RS256" },
          privateKey: Buffer.from(privateKey, "base64"),
          publicKey: Buffer.from(publicKey, "base64"),
        }
      },
    }),
  ],
  providers: [
    JwtStrategy,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    EnvService,
  ],
})
export class AuthModule {}
