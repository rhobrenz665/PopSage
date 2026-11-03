import "server-only"

import {
  createNeonAuth,
  type NeonAuth,
} from "@neon/auth/next/server"

let authInstance: NeonAuth | undefined

export type AuthenticatedUser = {
  id: string
  email: string
  emailVerified: boolean
  name: string | null
  authenticatedAt: Date | null
}

export function isNeonAuthConfigured() {
  return Boolean(
    process.env.NEON_AUTH_BASE_URL && process.env.NEON_AUTH_COOKIE_SECRET,
  )
}

export function getNeonAuth() {
  if (authInstance) return authInstance

  const baseUrl = process.env.NEON_AUTH_BASE_URL
  const secret = process.env.NEON_AUTH_COOKIE_SECRET

  if (!baseUrl || !secret) {
    throw new Error(
      "Managed Neon Auth is not configured. Set NEON_AUTH_BASE_URL and NEON_AUTH_COOKIE_SECRET.",
    )
  }

  if (secret.length < 32) {
    throw new Error("NEON_AUTH_COOKIE_SECRET must be at least 32 characters.")
  }

  authInstance = createNeonAuth({
    baseUrl,
    cookies: {
      secret,
      sessionDataTtl: 300,
    },
  })

  return authInstance
}

export async function getAuthenticatedUser(): Promise<AuthenticatedUser | null> {
  if (!isNeonAuthConfigured()) return null

  const { data, error } = await getNeonAuth().getSession()
  const user = data?.user

  if (error || !user?.id || !user.email) return null

  return {
    id: user.id,
    email: user.email,
    emailVerified: Boolean(user.emailVerified),
    name: user.name ?? null,
    authenticatedAt: data?.session?.createdAt ? new Date(data.session.createdAt) : null,
  }
}

export async function requireRecentAuthentication(maxAgeMs = 15 * 60 * 1000) {
  const identity = await getAuthenticatedUser()
  if (!identity?.authenticatedAt || Date.now() - identity.authenticatedAt.getTime() > maxAgeMs) {
    throw new Error("recent_authentication_required")
  }
  return identity
}
