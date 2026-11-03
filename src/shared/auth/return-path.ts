/** Only same-origin absolute paths are eligible after authentication. */
export function safeReturnPath(value: unknown, fallback = "/dashboard"): string {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//")) return fallback;
  try {
    const decoded = decodeURIComponent(value);
    if (/[\\\u0000-\u001f\u007f]/.test(decoded) || decoded.startsWith("//")) return fallback;
    const url = new URL(value, "https://popsage.invalid");
    if (url.origin !== "https://popsage.invalid") return fallback;
    // Avoid returning into authentication endpoints and redirect loops.
    if (/^\/(?:login|auth|api\/auth)(?:\/|$)/.test(url.pathname)) return fallback;
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return fallback;
  }
}
