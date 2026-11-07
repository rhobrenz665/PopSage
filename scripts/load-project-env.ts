import { loadEnvConfig } from "@next/env"

export function loadProjectEnvironment(projectDir = process.cwd()) {
  loadEnvConfig(projectDir)
}
