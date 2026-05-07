# Command Center — Manual Setup Guide

> Use this guide to set up the Command Center in a **new project** manually. No scripts, no automation — just copy-paste and build.

---

## Prerequisites

- Node.js 18+
- pnpm
- Bash shell
- Access to a project that already has `command-center-mcp/` and `command-center-tui/` built

---

## Step 1: Copy the Directories

From a terminal, copy the two Command Center directories into your new project:

```bash
# Replace with your actual paths
SOURCE=/path/to/source-project-with-cc
TARGET=/path/to/new-project

cp -r "$SOURCE/command-center-mcp" "$TARGET/"
cp -r "$SOURCE/command-center-tui" "$TARGET/"
```

## Step 2: Create `project-tracker.json`

Create `$TARGET/project-tracker.json` at the root of your new project:

```json
{
  "schemaVersion": 1,
  "project": {
    "name": "My New Project",
    "start_date": "2026-05-05",
    "target_date": "2026-12-31",
    "current_week": 1,
    "schedule_status": "on_track",
    "overall_progress": 0
  },
  "milestones": [],
  "agents": [],
  "agent_log": [],
  "schedule": {
    "phases": []
  }
}
```

Customize `name`, `start_date`, and `target_date` to your project.

## Step 3: Create `.mcp.json`

Create `$TARGET/.mcp.json` at the root of your new project. You need the **absolute path** to the project:

```bash
# First, get the absolute path
cd "$TARGET"
pwd   # Copy this output
```

Then create `.mcp.json`, replacing the path:

```json
{
  "command-center": {
    "command": "node",
    "args": ["/absolute/path/to/new-project/command-center-mcp/dist/index.js"]
  }
}
```

> **Note:** `.mcp.json` is only used by AI agents via the MCP protocol. The CLI `cc` does not read this file — it auto-detects the project from `cwd`.

## Step 4: Add Auto-Detecting Shell Functions

Add these functions to your shell config (`~/.bash_aliases`, `~/.bashrc`, `~/.zshrc`, etc.):

```bash
# Command Center CLI — auto-detects project from cwd
cc() {
  local dir=$(pwd)
  while [ "$dir" != "/" ]; do
    if [ -f "$dir/command-center-mcp/dist/cli.js" ]; then
      node "$dir/command-center-mcp/dist/cli.js" "$@"
      return
    fi
    dir=$(dirname "$dir")
  done
  echo "Error: Command Center not found in any parent directory" >&2
  return 1
}

# Command Center TUI — auto-detects project from cwd
ccui() {
  local dir=$(pwd)
  while [ "$dir" != "/" ]; do
    if [ -f "$dir/command-center-tui/dist/index.js" ]; then
      node "$dir/command-center-tui/dist/index.js"
      return
    fi
    dir=$(dirname "$dir")
  done
  echo "Error: Command Center TUI not found in any parent directory" >&2
  return 1
}
```

Then reload your shell config:

```bash
source ~/.bash_aliases   # or ~/.bashrc / ~/.zshrc
```

> **Important:** You only need to do this **once per machine**. If you already added these functions from a previous project, skip this step. They work with any project automatically.

## Step 5: Build Both Packages

```bash
cd /path/to/new-project

# Build MCP Server
cd command-center-mcp && pnpm install && pnpm build && cd ..

# Build TUI Dashboard
cd command-center-tui && pnpm install && pnpm build && cd ..
```

## Step 6: Verify and Register

```bash
# Test CLI (works from anywhere in the project tree)
cd /path/to/new-project
cc get-project-status

# Register your AI agents
cc register-agent opencode "OpenCode" orchestrator --permissions read,write
cc register-agent gemini-cli "Gemini CLI" orchestrator --permissions read,write

# Create your first milestone
cc create-milestone foundation "Foundation Phase" --domain core

# Launch the TUI dashboard
ccui
```

---

## TUI Dashboard Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `1` | Swim Lane view |
| `2` | Task Board view |
| `3` | Agent Hub view |
| `4` | Calendar view |
| `r` | Refresh from disk |
| `t` | Toggle dark/light theme |
| `[` / `]` | Navigate milestones |
| `q` | Quit |

---

## Quick Reference — CLI Commands

```bash
cc get-project-status              # Overall status
cc list-tasks                      # All tasks
cc list-tasks --status todo        # Filter by status
cc get-task-context foundation_001  # Full task details
cc start-task foundation_001       # Begin working
cc complete-task foundation_001 "summary"  # Submit for review
cc approve-task foundation_001     # Approve (use --feedback for notes)
cc reject-task foundation_001 "needs more work"
cc create-milestone m2 "Milestone"
cc add-milestone-task m2 "Task label"
cc update-task foundation_001 --priority P1
cc log-action foundation_001 custom "description"
```

---

## How Auto-Detection Works

The `cc` and `ccui` shell functions walk **up** the directory tree from your current working directory, looking for:

- `cc`: nearest `command-center-mcp/dist/cli.js`
- `ccui`: nearest `command-center-tui/dist/index.js`

This means:
- Works from **any subdirectory** (`src/`, `components/`, deep nested folders, etc.)
- Works with **multiple projects** on the same machine — no conflicts
- No environment variables, no hardcoded paths
- No `PROJECT_ROOT` export needed
