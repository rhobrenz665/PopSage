import { isAuthError } from "@neon/auth/next"

type ProviderResponse = { error?: unknown }

export async function providerResult<T extends ProviderResponse>(
  request: () => Promise<T>,
  fallback: string,
) {
  try {
    const result = await request()
    return {
      result,
      error: result.error ? fallback : undefined,
    }
  } catch (error) {
    if (isAuthError(error)) return { error: fallback }
    throw error
  }
}
