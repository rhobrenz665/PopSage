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

  return getNeonAuth().middleware({ loginUrl: "/sign-in" })(request)
}

export const config = {
  matcher: ["/dashboard/:path*"],
}
