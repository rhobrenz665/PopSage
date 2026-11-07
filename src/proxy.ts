import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"

import {
  getNeonAuth,
  isNeonAuthConfigured,
} from "@/providers/auth/server"

export default async function proxy(request: NextRequest) {
  if (!isNeonAuthConfigured()) {
    const signInUrl = new URL("/sign-in", request.url)
    signInUrl.searchParams.set("reason", "auth-not-configured")
    return NextResponse.redirect(signInUrl)
  }

  return getNeonAuth().middleware({
    loginUrl: "/sign-in",
    publicRoutes: [
      "/",
      "/check-email",
      "/forgot-password",
      "/invite",
      "/login",
      "/no-access",
      "/reset-password",
      "/sign-in",
      "/sign-up",
    ],
  })(request)
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|map|woff|woff2)$).*)",
  ],
}
