import { beforeEach, describe, expect, it, vi } from "vitest"

import { generateInvitationToken } from "./tokens"

const { transaction } = vi.hoisted(() => ({ transaction: vi.fn() }))

vi.mock("server-only", () => ({}))
vi.mock("@/server/db/client", () => ({
  setDatabaseContext: vi.fn(),
  withDatabaseTransaction: transaction,
}))
vi.mock("@/server/workspaces/service", () => ({
  requireWorkspaceOwner: vi.fn(),
}))

describe("acceptInvitation", () => {
  beforeEach(() => {
    transaction.mockReset()
  })

  it("rejects an unverified identity before touching the database", async () => {
    const { acceptInvitation } = await import("./service")
    const credential = generateInvitationToken()

    await expect(acceptInvitation({
      selector: credential.selector,
      token: credential.token,
      identity: {
        id: "user-1",
        email: "person@example.com",
        emailVerified: false,
      },
    })).rejects.toEqual(expect.objectContaining({
      code: "unverified",
    }))
    expect(transaction).not.toHaveBeenCalled()
  })

  it("accepts a pending teammate invitation for the exact verified email", async () => {
    const { acceptInvitation } = await import("./service")
    const credential = generateInvitationToken()
    const invitation = {
      selector: credential.selector,
      kind: "teammate",
      email: "person@example.com",
      token_hash: credential.tokenHash,
      workspace_id: "05ff2fb5-584f-4e17-a765-dc41b10f4959",
      status: "pending",
      expires_at: new Date(Date.now() + 60_000),
      accepted_by_user_id: null,
      accepted_workspace_id: null,
    }
    const query = vi.fn()
      .mockResolvedValueOnce({ rows: [invitation] })
      .mockResolvedValueOnce({ rows: [invitation] })
      .mockResolvedValue({ rows: [], rowCount: 1 })
    transaction.mockImplementation(async (_context, run) => run({ query }))

    await expect(acceptInvitation({
      selector: credential.selector,
      token: credential.token,
      identity: { id: "user-1", email: "PERSON@example.com", emailVerified: true },
    })).resolves.toEqual({
      status: "accepted",
      workspaceId: invitation.workspace_id,
      role: "teammate",
    })
    expect(query).toHaveBeenCalledTimes(4)
  })

  it("returns the accepted workspace when the same identity safely replays a link", async () => {
    const { acceptInvitation } = await import("./service")
    const credential = generateInvitationToken()
    const workspaceId = "05ff2fb5-584f-4e17-a765-dc41b10f4959"
    const query = vi.fn()
      .mockResolvedValueOnce({ rows: [{
        selector: credential.selector,
        kind: "teammate",
        email: "person@example.com",
        token_hash: credential.tokenHash,
        workspace_id: workspaceId,
        status: "accepted",
        expires_at: new Date(Date.now() - 60_000),
        accepted_by_user_id: "user-1",
        accepted_workspace_id: workspaceId,
      }] })
      .mockResolvedValueOnce({ rows: [{ exists: 1 }], rowCount: 1 })
    transaction.mockImplementation(async (_context, run) => run({ query }))

    await expect(acceptInvitation({
      selector: credential.selector,
      token: credential.token,
      identity: { id: "user-1", email: "person@example.com", emailVerified: true },
    })).resolves.toEqual({ status: "replayed", workspaceId, role: "teammate" })
    expect(query).toHaveBeenCalledTimes(2)
  })

  it("rejects a verified identity with the wrong invitation email", async () => {
    const { acceptInvitation } = await import("./service")
    const credential = generateInvitationToken()
    const query = vi.fn().mockResolvedValueOnce({ rows: [{
      selector: credential.selector,
      kind: "teammate",
      email: "invited@example.com",
      token_hash: credential.tokenHash,
      workspace_id: "05ff2fb5-584f-4e17-a765-dc41b10f4959",
      status: "pending",
      expires_at: new Date(Date.now() + 60_000),
      accepted_by_user_id: null,
      accepted_workspace_id: null,
    }] })
    transaction.mockImplementation(async (_context, run) => run({ query }))

    await expect(acceptInvitation({
      selector: credential.selector,
      token: credential.token,
      identity: { id: "user-1", email: "other@example.com", emailVerified: true },
    })).rejects.toEqual(expect.objectContaining({ code: "wrong_email" }))
    expect(query).toHaveBeenCalledTimes(1)
  })

})

describe("createInvitation", () => {
  beforeEach(() => {
    transaction.mockReset()
  })

  it("replaces an earlier pending invitation before inserting the new link", async () => {
    const { createInvitation } = await import("./service")
    const query = vi.fn()
      .mockResolvedValueOnce({ rows: [{ selector: "53f31d12-1f98-463f-8d5f-d489f599d5f7" }] })
      .mockResolvedValue({ rows: [], rowCount: 1 })
    transaction.mockImplementation(async (_context, run) => run({ query }))

    const result = await createInvitation({
      userId: "owner-1",
      workspaceId: "05ff2fb5-584f-4e17-a765-dc41b10f4959",
      email: "Person@Example.com",
    })

    expect(result.token).toHaveLength(43)
    expect(query).toHaveBeenCalledTimes(3)
    expect(query.mock.calls[1][1]).toEqual([
      "53f31d12-1f98-463f-8d5f-d489f599d5f7",
      result.selector,
    ])
    expect(query.mock.calls[2][1][1]).toBe("person@example.com")
  })
})
