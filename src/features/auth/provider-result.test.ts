import { AuthError } from "@neon/auth/next"
import { describe, expect, it } from "vitest"

import { providerResult } from "./provider-result"

describe("providerResult", () => {
  it("turns a resolved provider error into the feature-specific message", async () => {
    await expect(
      providerResult(async () => ({ error: new Error("provider error") }), "Sign-in failed."),
    ).resolves.toMatchObject({ error: "Sign-in failed." })
  })

  it("turns a thrown Auth error into the feature-specific message", async () => {
    const error = new AuthError(
      "Invalid email or password",
      401,
      "invalid_credentials",
    )

    await expect(
      providerResult(async () => Promise.reject(error), "The email or password is incorrect."),
    ).resolves.toMatchObject({ error: "The email or password is incorrect." })
  })

  it("leaves unexpected failures for the form's connection-error fallback", async () => {
    const error = new TypeError("fetch failed")

    await expect(
      providerResult(async () => Promise.reject(error), "Sign-in failed."),
    ).rejects.toBe(error)
  })
})
