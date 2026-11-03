"use client"

import { neonAuthClient } from "@/providers/auth/client"

/** The UI only depends on this adapter. Provider-specific behavior stays outside forms. */
export type AuthResult = { error?: string; redirectTo?: string }
export interface AuthClient {
  signIn(input: { email: string; password: string; invitationToken?: string }): Promise<AuthResult>
  signUp(input: { name: string; email: string; password: string; invitationToken: string }): Promise<AuthResult>
  google(input: { invitationToken?: string }): Promise<AuthResult>
  magicLink(input: { email: string; invitationToken?: string }): Promise<AuthResult>
  forgotPassword(input: { email: string }): Promise<AuthResult>
  resetPassword(input: { password: string; token: string }): Promise<AuthResult>
  resendVerification(input: { email: string }): Promise<AuthResult>
  acceptInvitation(input: { token: string; workspaceName?: string }): Promise<AuthResult>
  signOut(): Promise<AuthResult>
}

function providerError(error: unknown, fallback: string): string | undefined {
  return error ? fallback : undefined
}

async function appRequest(path: string, input: unknown): Promise<AuthResult> {
  const response = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  })
  if (!response.ok) {
    const body = await response.json().catch(() => ({})) as { error?: string; redirectTo?: string }
    return { error: body.error ?? "We couldn’t complete that request. Please try again.", redirectTo: body.redirectTo }
  }
  return response.json()
}

async function eligible(invitationToken?: string) {
  if (!invitationToken) return { error: "A valid invitation is required." }
  return appRequest("/api/invitations/validate", { invitationToken })
}

function callback(invitationToken?: string) {
  return invitationToken
    ? `/invite/${encodeURIComponent(invitationToken)}`
    : "/dashboard"
}

export const authClient: AuthClient = {
  async signIn(input) {
    const result = await neonAuthClient.signIn.email({
      email: input.email,
      password: input.password,
      callbackURL: callback(input.invitationToken),
    })
    return { error: providerError(result.error, "The email or password is incorrect."), redirectTo: callback(input.invitationToken) }
  },
  async signUp(input) {
    const check = await eligible(input.invitationToken)
    if (check.error) return check
    const result = await neonAuthClient.signUp.email({
      name: input.name,
      email: input.email,
      password: input.password,
      callbackURL: callback(input.invitationToken),
    })
    return { error: providerError(result.error, "We couldn’t create that account. Check your details and invitation."), redirectTo: "/check-email?kind=verify" }
  },
  async google(input) {
    if (input.invitationToken) {
      const check = await eligible(input.invitationToken)
      if (check.error) return check
    }
    const result = await neonAuthClient.signIn.social({
      provider: "google",
      callbackURL: callback(input.invitationToken),
      newUserCallbackURL: input.invitationToken ? callback(input.invitationToken) : "/no-access",
      errorCallbackURL: "/sign-in?error=oauth",
    })
    return { error: providerError(result.error, "Google sign-in could not be started."), redirectTo: result.data?.url }
  },
  async magicLink(input) {
    if (input.invitationToken) {
      const check = await eligible(input.invitationToken)
      if (check.error) return check
    }
    const result = await neonAuthClient.signIn.magicLink({
      email: input.email,
      callbackURL: callback(input.invitationToken),
      newUserCallbackURL: input.invitationToken ? callback(input.invitationToken) : "/no-access",
      errorCallbackURL: "/sign-in?error=magic-link",
    })
    return { error: providerError(result.error, "We couldn’t send a sign-in link to that address.") }
  },
  async forgotPassword(input) {
    const result = await neonAuthClient.requestPasswordReset({
      email: input.email,
      redirectTo: "/reset-password",
    })
    return { error: providerError(result.error, "We couldn’t start password recovery. Please try again.") }
  },
  async resetPassword(input) {
    const result = await neonAuthClient.resetPassword({
      newPassword: input.password,
      token: input.token,
    })
    return { error: providerError(result.error, "This reset link is invalid or expired.") }
  },
  async resendVerification(input) {
    const result = await neonAuthClient.sendVerificationEmail({
      email: input.email,
      callbackURL: "/dashboard",
    })
    return { error: providerError(result.error, "We couldn’t resend the verification email.") }
  },
  acceptInvitation: (input) => appRequest("/api/invitations/accept", input),
  async signOut() {
    const result = await neonAuthClient.signOut()
    return { error: providerError(result.error, "We couldn’t sign you out. Please try again.") }
  },
}
