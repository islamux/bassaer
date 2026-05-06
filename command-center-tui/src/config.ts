import fs from 'fs'
import path from 'path'

export function findProjectRoot(): string | null {
  let dir = process.cwd()
  while (dir !== '/') {
    if (fs.existsSync(path.join(dir, 'project-tracker.json'))) {
      return dir
    }
    dir = path.dirname(dir)
  }
  return null
}

export function getTrackerPath(): string {
  const root = findProjectRoot()
  if (!root) {
    process.stderr.write('Error: project-tracker.json not found in any parent directory\n')
    process.exit(1)
  }
  return path.join(root, 'project-tracker.json')
}
