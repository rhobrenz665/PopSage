import { spawnSync } from "node:child_process"
import { mkdtempSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { fileURLToPath } from "node:url"

import { afterEach, describe, expect, it } from "vitest"

import { loadProjectEnvironment } from "./load-project-env"

const temporaryDirectories: string[] = []

afterEach(() => {
  delete process.env.POPSAGE_ENV_LOADING_TEST
  for (const directory of temporaryDirectories.splice(0)) {
    rmSync(directory, { force: true, recursive: true })
  }
})

describe("create-owner-invitation CLI", () => {
  it("loads environment files outside the Next.js runtime", () => {
    const projectDir = mkdtempSync(join(tmpdir(), "popsage-env-"))
    temporaryDirectories.push(projectDir)
    writeFileSync(
      join(projectDir, ".env.test"),
      "POPSAGE_ENV_LOADING_TEST=loaded\n",
    )

    loadProjectEnvironment(projectDir)

    expect(process.env.POPSAGE_ENV_LOADING_TEST).toBe("loaded")
  })

  it("loads under the project's CommonJS package mode", () => {
    const scriptPath = fileURLToPath(
      new URL("./create-owner-invitation.ts", import.meta.url),
    )
    const result = spawnSync(
      process.execPath,
      ["--import", "tsx", scriptPath],
      { encoding: "utf8" },
    )

    expect(result.status).toBe(1)
    expect(result.stderr).toContain(
      "Usage: npm run invite:owner -- owner@example.com",
    )
    expect(result.stderr).not.toContain("Top-level await")
  })
})
