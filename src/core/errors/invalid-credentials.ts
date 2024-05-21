import type { UseCaseError } from "./use-case-error"

export class InvalidCredentials extends Error implements UseCaseError {
  constructor() {
    super("Invalid credentials.")
  }
}
