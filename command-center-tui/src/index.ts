#!/usr/bin/env node

import blessed from 'blessed'
import type { Widgets } from 'blessed'
import { Store } from './store.js'
import { createTabBar } from './components/tab-bar.js'
import { createStatusBar } from './components/status-bar.js'
import { createSwimLane } from './views/swim-lane.js'
import { createTaskBoard } from './views/task-board.js'
import { createAgentHub } from './views/agent-hub.js'
import { createCalendar } from './views/calendar.js'
import type { TrackerState } from './types.js'
import fs from 'fs'
import { getTrackerPath } from './config.js'

let activeTab = 0
let milestoneIdx = 0
let isDark = true
let currentView: Widgets.BoxElement | null = null

const screen = blessed.screen({
  smartCSR: true,
  title: 'Basaar Command Center',
  fullUnicode: true,
})

screen.key(['q', 'C-c'], () => {
  process.exit(0)
})

screen.key(['1', '2', '3', '4'], (_ch: any, key: any) => {
  const tab = parseInt(key.ch, 10) - 1
  if (tab !== activeTab) {
    activeTab = tab
    renderAll()
  }
})

screen.key(['[', ']'], (_ch: any, key: any) => {
  if (!store.state) return
  const all = [...store.state.milestones.active, ...store.state.milestones.backlog]
  if (all.length === 0) return
  if (key.ch === '[') {
    milestoneIdx = (milestoneIdx - 1 + all.length) % all.length
  } else {
    milestoneIdx = (milestoneIdx + 1) % all.length
  }
  renderAll()
})

screen.key(['r'], () => {
  store.loadFromDisk()
  renderAll()
})

screen.key(['t'], () => {
  isDark = !isDark
  const bg = isDark ? '#1a1a2e' : '#fafafa'
  const fg = isDark ? '#e0e0e0' : '#1a1a2e'
  ;(screen as any).style = { bg, fg }
  if (currentView) {
    ;(currentView as any).style = { bg, fg }
  }
  screen.render()
})

let tabBar: Widgets.BoxElement | null = null
let statusBar: Widgets.BoxElement | null = null

function renderAll() {
  if (currentView) {
    screen.remove(currentView)
    currentView.destroy()
    currentView = null
  }
  if (tabBar) {
    screen.remove(tabBar)
    tabBar.destroy()
  }
  if (statusBar) {
    screen.remove(statusBar)
    statusBar.destroy()
  }

  tabBar = createTabBar(screen, activeTab, () => {})
  statusBar = createStatusBar(screen, store.state)

  const s = store.state
  switch (activeTab) {
    case 0: currentView = createSwimLane(screen, s, milestoneIdx); break
    case 1: currentView = createTaskBoard(screen, s, milestoneIdx); break
    case 2: currentView = createAgentHub(screen, s); break
    case 3: currentView = createCalendar(screen, s); break
  }

  currentView?.focus()
  screen.render()
}

const store = new Store()

try {
  const trackerPath = getTrackerPath()
  fs.watchFile(trackerPath, { interval: 1000 }, () => {
    if (store.loadFromDisk()) {
      renderAll()
    }
  })
} catch { /* no watch */ }

renderAll()
screen.render()
