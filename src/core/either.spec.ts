import { type Either, left, right } from "./either"

function doSomething(x: boolean): Either<string, number> {
  if (x) return right(10)

  return left("error")
}

describe("Either", () => {
  it("should be able to return success result", () => {
    const result = doSomething(true)

    expect(result.isRight()).toBe(true)
    expect(result.isLeft()).toBe(false)
  })

  it("should be able to return error result", () => {
    const result = doSomething(false)

    expect(result.isRight()).toBe(false)
    expect(result.isLeft()).toBe(true)
  })
})
