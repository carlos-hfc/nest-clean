import type { UseCaseError } from "./use-case-error"

export class InvalidAttachmentType extends Error implements UseCaseError {
  constructor(type: string) {
    super(`File type "${type}" is not valid.`)
  }
}
