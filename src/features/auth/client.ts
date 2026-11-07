"use client"

import { neonAuthClient } from "@/providers/auth/client"

import { providerResult } from "./provider-result"

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
    const { error } = await providerResult(
      () => neonAuthClient.signIn.email({
        email: input.email,
        password: input.password,
        callbackURL: callback(input.invitationToken),
      }),
      "The email or password is incorrect.",
    )
    return { error, redirectTo: callback(input.invitationToken) }
  },
  async signUp(input) {
    const check = await eligible(input.invitationToken)
    if (check.error) return check
    const { error } = await providerResult(
      () => neonAuthClient.signUp.email({
        name: input.name,
        email: input.email,
        password: input.password,
        callbackURL: callback(input.invitationToken),
      }),
      "We couldn’t create that account. Check your details and invitation.",
    )
    return { error, redirectTo: "/check-email?kind=verify" }
  },
  async google(input) {
    if (input.invitationToken) {
      const check = await eligible(input.invitationToken)
      if (check.error) return check
    }
    const { result, error } = await providerResult(
      () => neonAuthClient.signIn.social({
        provider: "google",
        callbackURL: callback(input.invitationToken),
        newUserCallbackURL: input.invitationToken ? callback(input.invitationToken) : "/no-access",
        errorCallbackURL: "/sign-in?error=oauth",
      }),
      "Google sign-in could not be started.",
    )
    return { error, redirectTo: result?.data?.url }
  },
  async magicLink(input) {
    if (input.invitationToken) {
      const check = await eligible(input.invitationToken)
      if (check.error) return check
    }
    const { error } = await providerResult(
      () => neonAuthClient.signIn.magicLink({
        email: input.email,
        callbackURL: callback(input.invitationToken),
        newUserCallbackURL: input.invitationToken ? callback(input.invitationToken) : "/no-access",
        errorCallbackURL: "/sign-in?error=magic-link",
      }),
      "We couldn’t send a sign-in link to that address.",
    )
    return { error }
  },
  async forgotPassword(input) {
    const { error } = await providerResult(
      () => neonAuthClient.requestPasswordReset({
        email: input.email,
        redirectTo: "/reset-password",
      }),
      "We couldn’t start password recovery. Please try again.",
    )
    return { error }
  },
  async resetPassword(input) {
    const { error } = await providerResult(
      () => neonAuthClient.resetPassword({
        newPassword: input.password,
        token: input.token,
      }),
      "This reset link is invalid or expired.",
    )
    return { error }
  },
  async resendVerification(input) {
    const { error } = await providerResult(
      () => neonAuthClient.sendVerificationEmail({
        email: input.email,
        callbackURL: "/dashboard",
      }),
      "We couldn’t resend the verification email.",
    )
    return { error }
  },
  acceptInvitation: (input) => appRequest("/api/invitations/accept", input),
  async signOut() {
    const { error } = await providerResult(
      () => neonAuthClient.signOut(),
      "We couldn’t sign you out. Please try again.",
    )
    return { error }
  },
}
