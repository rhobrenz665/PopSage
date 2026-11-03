import { describe, expect, it } from "vitest"

import {
  canonicalizeEmail,
  generateInvitationToken,
  hashInvitationToken,
  invitationTokenMatches,
  parseInvitationCredentials,
  serializeInvitationCredentials,
} from "./tokens"

describe("invitation credentials", () => {
  it("round-trips a selector and secret without exposing the persisted hash", () => {
    const generated = generateInvitationToken()
    const serialized = serializeInvitationCredentials(generated)

    expect(parseInvitationCredentials(serialized)).toEqual({
      selector: generated.selector,
      token: generated.token,
    })
    expect(generated.tokenHash).toBe(hashInvitationToken(generated.token))
    expect(generated.tokenHash).not.toContain(generated.token)
    expect(invitationTokenMatches(generated.token, generated.tokenHash)).toBe(true)
  })

  it("rejects malformed and altered credentials", () => {
    const generated = generateInvitationToken()

    expect(() => parseInvitationCredentials("not-an-invitation")).toThrow()
    expect(invitationTokenMatches(`${generated.token.slice(0, -1)}x`, generated.tokenHash)).toBe(false)
  })
})

describe("canonicalizeEmail", () => {
  it("normalizes case and surrounding whitespace", () => {
    expect(canonicalizeEmail("  Person@Example.COM ")).toBe("person@example.com")
  })

  it("rejects invalid email-shaped input", () => {
    expect(() => canonicalizeEmail("not-an-email")).toThrow("invalid_email")
  })
})
