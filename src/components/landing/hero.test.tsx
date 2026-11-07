import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"

import { HeroLanding } from "./hero"

describe("HeroLanding", () => {
  it("routes the product-preview Sign in control to the sign-in page", () => {
    const html = renderToStaticMarkup(<HeroLanding />)

    expect(html).toContain('href="/sign-in"')
    expect(html).toContain("Sign in")
  })
})
