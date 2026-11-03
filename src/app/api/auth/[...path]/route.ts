import type { NextRequest } from "next/server"

import { getNeonAuth } from "@/providers/auth/server"

type AuthMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE"
type AuthRouteContext = { params: Promise<{ path: string[] }> }

function forwardAuth(method: AuthMethod) {
  return async (request: NextRequest, context: AuthRouteContext) => {
    const handler = getNeonAuth().handler()[method]
    return handler(request, context)
  }
}

export const GET = forwardAuth("GET")
export const POST = forwardAuth("POST")
export const PUT = forwardAuth("PUT")
export const PATCH = forwardAuth("PATCH")
export const DELETE = forwardAuth("DELETE")
