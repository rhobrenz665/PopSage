import { unstable_doesMiddlewareMatch } from "next/experimental/testing/server"
import { describe, expect, it, vi } from "vitest"

vi.mock("@/providers/auth/server", () => ({
  getNeonAuth: vi.fn(),
  isNeonAuthConfigured: vi.fn(),
}))

describe("auth proxy matcher", () => {
  it("processes Neon OAuth verifier callbacks on invitation routes", async () => {
    const { config } = await import("./proxy")

    expect(
      unstable_doesMiddlewareMatch({
        config,
        nextConfig: {},
        url: "/invite/example.neon-token?neon_auth_session_verifier=verifier",
      }),
    ).toBe(true)
  })
})
