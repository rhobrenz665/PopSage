import { describe, expect, it } from "vitest"

import { safeReturnPath } from "./return-path"

describe("safeReturnPath", () => {
  it("keeps same-origin application paths", () => {
    expect(safeReturnPath("/dashboard?workspace=one#team")).toBe(
      "/dashboard?workspace=one#team",
    )
  })

  it.each([
    "https://attacker.example",
    "//attacker.example/path",
    "/%2f%2fattacker.example",
    "/api/auth/callback",
    "/auth/loop",
  ])("rejects unsafe return target %s", (target) => {
    expect(safeReturnPath(target)).toBe("/dashboard")
  })
})
