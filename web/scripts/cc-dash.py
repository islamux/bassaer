#!/usr/bin/env python3
import json
import os
import sys
from datetime import datetime

# Path to the virtual environment's python
VENV_PYTHON = os.path.join(os.getcwd(), '.cc-venv/bin/python3')

# Check if we are running in the venv, if not, re-run with venv python
if sys.executable != VENV_PYTHON and os.path.exists(VENV_PYTHON):
    os.execv(VENV_PYTHON, [VENV_PYTHON] + sys.argv)

try:
    from rich.console import Console
    from rich.table import Table
    from rich.progress import Progress, BarColumn, TextColumn
    from rich.panel import Panel
    from rich.layout import Layout
    from rich.live import Live
    from rich.text import Text
    from rich import box
except ImportError:
    print("Error: 'rich' library not found. Please run 'python3 -m venv .cc-venv && .cc-venv/bin/pip install rich'")
    sys.exit(1)

TRACKER_PATH = 'project-tracker.json'

def load_tracker():
    if not os.path.exists(TRACKER_PATH):
        return None
    with open(TRACKER_PATH, 'r', encoding='utf-8') as f:
        return json.load(f)

def get_status_color(status):
    colors = {
        'todo': 'white',
        'in_progress': 'yellow',
        'review': 'magenta',
        'done': 'green',
        'blocked': 'red'
    }
    return colors.get(status, 'white')

def get_components(data):
    # Header Info
    proj = data['project']
    overall_progress = proj['overall_progress'] * 100
    
    header_text = Text.assemble(
        (f" {proj['name']} ", "bold white on blue"),
        "  ",
        (f" Week {proj['current_week']} ", "bold yellow"),
        "  ",
        (f" Status: {proj['schedule_status'].upper()} ", "bold green" if proj['schedule_status'] == 'on_track' else "bold red")
    )
    
    # Progress Bar
    progress = Progress(
        TextColumn("[bold blue]{task.description}"),
        BarColumn(bar_width=None),
        TextColumn("[progress.percentage]{task.percentage:>3.0f}%"),
    )
    progress.add_task("Overall Progress", total=100, completed=overall_progress)
    
    # Active Tasks Table
    task_table = Table(title="Active & Upcoming Tasks", expand=True, box=box.ROUNDED)
    task_table.add_column("ID", style="dim", width=25)
    task_table.add_column("Task Label", ratio=1)
    task_table.add_column("Priority", width=10, justify="center")
    task_table.add_column("Domain", width=12, justify="center")
    task_table.add_column("Status", width=15, justify="center")

    active_count = 0
    for m in data['milestones']:
        if m['week'] <= proj['current_week'] + 1: 
            for t in m['subtasks']:
                if t['status'] != 'done' and active_count < 15:
                    status_style = get_status_color(t['status'])
                    task_table.add_row(
                        t['id'],
                        t['label'],
                        f"[bold]{t['priority']}[/bold]",
                        m['domain'],
                        f"[{status_style}]{t['status'].replace('_', ' ').upper()}[/]"
                    )
                    active_count += 1

    # Agent Log Panel
    log_table = Table(show_header=True, expand=True, box=box.ROUNDED, title="Recent Activity")
    log_table.add_column("Agent", width=15)
    log_table.add_column("Action", ratio=1)
    log_table.add_column("Time", width=20, style="dim")

    recent_logs = data['agent_log'][-5:]
    for log in reversed(recent_logs):
        log_table.add_row(
            f"[bold]{log['agent_id']}[/bold]",
            log['description'],
            log['timestamp'][:19].replace('T', ' ')
        )
    
    if not recent_logs:
        log_table.add_row("", "[dim]No recent activity[/dim]", "")

    return Panel(header_text, box=box.ROUNDED), Panel(progress, title="Project Completion", box=box.ROUNDED), task_table, log_table

def update_task(task_id, status, agent_id='orchestrator', description=None):
    data = load_tracker()
    if not data:
        return False
    
    found = False
    for m in data['milestones']:
        for t in m['subtasks']:
            if t['id'] == task_id:
                t['status'] = status
                t['done'] = (status == 'done')
                if t['done']:
                    t['completed_at'] = datetime.now().isoformat()
                    t['completed_by'] = agent_id
                
                # Log action
                if not description:
                    description = f"Updated task {task_id} to {status}"
                
                log_entry = {
                    "id": f"log_{int(datetime.now().timestamp())}",
                    "agent_id": agent_id,
                    "action": "task_updated",
                    "target_type": "subtask",
                    "target_id": task_id,
                    "description": description,
                    "timestamp": datetime.now().isoformat(),
                    "tags": ["cli", "manual"]
                }
                data['agent_log'].append(log_entry)
                
                # Update progress
                total_tasks = sum(len(m['subtasks']) for m in data['milestones'])
                done_tasks = sum(sum(1 for t in m['subtasks'] if t['done']) for m in data['milestones'])
                data['project']['overall_progress'] = done_tasks / total_tasks if total_tasks > 0 else 0
                
                found = True
                break
        if found: break
    
    if found:
        with open(TRACKER_PATH, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        return True
    return False

def log_action(agent_id, action, description, target_id=None, target_type=None, tags=None):
    data = load_tracker()
    if not data:
        return False
    
    log_entry = {
        "id": f"log_{int(datetime.now().timestamp())}",
        "agent_id": agent_id,
        "action": action,
        "target_type": target_type,
        "target_id": target_id,
        "description": description,
        "timestamp": datetime.now().isoformat(),
        "tags": tags or ["manual"]
    }
    data['agent_log'].append(log_entry)
    
    with open(TRACKER_PATH, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    return True

def main():
    if len(sys.argv) > 1:
        if sys.argv[1] == 'update':
            if len(sys.argv) < 4:
                print("Usage: ./scripts/cc-dash.py update <task_id> <status> [agent_id] [description]")
                sys.exit(1)
            
            task_id = sys.argv[2]
            status = sys.argv[3]
            agent_id = sys.argv[4] if len(sys.argv) > 4 else 'orchestrator'
            description = sys.argv[5] if len(sys.argv) > 5 else None
            
            if update_task(task_id, status, agent_id, description):
                print(f"Successfully updated {task_id} to {status}")
            else:
                print(f"Task {task_id} not found")
            sys.exit(0)
            
        elif sys.argv[1] == 'log':
            if len(sys.argv) < 4:
                print("Usage: ./scripts/cc-dash.py log <agent_id> <description> [action] [target_id] [target_type]")
                sys.exit(1)
            
            agent_id = sys.argv[2]
            description = sys.argv[3]
            action = sys.argv[4] if len(sys.argv) > 4 else 'manual_log'
            target_id = sys.argv[5] if len(sys.argv) > 5 else None
            target_type = sys.argv[6] if len(sys.argv) > 6 else None
            
            if log_action(agent_id, action, description, target_id=target_id, target_type=target_type):
                print(f"Successfully logged activity for {agent_id}")
            else:
                print(f"Failed to log activity")
            sys.exit(0)

    data = load_tracker()
    if not data:
        print("Error: project-tracker.json not found.")
        sys.exit(1)
        
    console = Console()
    
    if len(sys.argv) > 1 and sys.argv[1] == '--watch':
        # Interactive mode still uses Layout
        layout = Layout()
        def update_layout(layout, data):
            header, progress, tasks, logs = get_components(data)
            layout.split_column(
                Layout(header, size=3),
                Layout(progress, size=3),
                Layout(tasks, ratio=1),
                Layout(logs, size=10)
            )
            return layout

        with Live(update_layout(Layout(), data), refresh_per_second=1, screen=True) as live:
            while True:
                data = load_tracker()
                live.update(update_layout(Layout(), data))
                import time
                time.sleep(2)
    else:
        # Static mode prints sequentially
        header, progress, tasks, logs = get_components(data)
        console.print(header)
        console.print(progress)
        console.print(tasks)
        console.print(logs)

if __name__ == "__main__":
    main()
