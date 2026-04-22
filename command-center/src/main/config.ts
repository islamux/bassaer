import path from 'path'
import fs from 'fs'

function resolveProjectRoot(): string {
  if (process.env.PROJECT_ROOT) return process.env.PROJECT_ROOT

  const envPath = path.join(__dirname, '../../.env')
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf-8')
    const match = content.match(/^PROJECT_ROOT=(.+)$/m)
    if (match) return match[1].trim()
  }

  return process.cwd()
}

export const PROJECT_ROOT = resolveProjectRoot()
export const TRACKER_PATH = path.join(PROJECT_ROOT, 'project-tracker.json')
