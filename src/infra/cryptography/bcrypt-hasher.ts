import { compare, hash } from "bcryptjs"

import { HashComparer } from "@/domain/forum/application/cryptography/hash-comparer"
import { HashGenerator } from "@/domain/forum/application/cryptography/hash-generator"

export class BcryptHasher implements HashGenerator, HashComparer {
  private HASH_SALT_LENGTH = 8

  async compare(plain: string, hash: string): Promise<boolean> {
    return await compare(plain, hash)
  }

  async hash(plain: string): Promise<string> {
    return await hash(plain, this.HASH_SALT_LENGTH)
  }
}
