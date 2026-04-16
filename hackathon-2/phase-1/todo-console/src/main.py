#!/usr/bin/env python3
"""
Panaversity Hackathon II — Phase I
Terminal Todo App — Rich-powered REPL.

Run:
    uv run python src/main.py
"""
from __future__ import annotations

import sys
from typing import Optional

from rich import box
from rich.columns import Columns
from rich.console import Console
from rich.panel import Panel
from rich.prompt import Confirm, Prompt
from rich.table import Table
from rich.text import Text
from rich.theme import Theme

from todo import Task, TaskNotFoundError, TodoManager

# ─── Setup ───────────────────────────────────────────────────────────────────

_THEME = Theme(
    {
        "info": "bold cyan",
        "success": "bold green",
        "warn": "bold yellow",
        "error": "bold red",
        "muted": "dim white",
        "hi": "bold red",
        "med": "bold yellow",
        "lo": "bold green",
    }
)

console = Console(theme=_THEME)
manager = TodoManager()

_PRIORITY_STYLE: dict[str, str] = {
    "high": "hi",
    "medium": "med",
    "low": "lo",
}
_PRIORITY_ICON: dict[str, str] = {
    "high": "🔴",
    "medium": "🟡",
    "low": "🟢",
}


# ─── Rendering ───────────────────────────────────────────────────────────────


def _render_table(tasks: list[Task], title: str = "Tasks") -> None:
    if not tasks:
        console.print(
            Panel(
                "[muted]No tasks found.[/muted]",
                title=f"[info]{title}[/info]",
                border_style="dim",
                padding=(0, 2),
            )
        )
        return

    tbl = Table(
        title=f"[bold cyan]{title}[/bold cyan]",
        box=box.ROUNDED,
        border_style="bright_blue",
        header_style="bold cyan",
        show_lines=True,
        expand=True,
        padding=(0, 1),
    )
    tbl.add_column("ID", style="muted", width=10, no_wrap=True)
    tbl.add_column("", width=3, justify="center")          # status icon
    tbl.add_column("Priority", width=12, justify="center")
    tbl.add_column("Title", min_width=22)
    tbl.add_column("Tags", min_width=14)
    tbl.add_column("Due", width=12)
    tbl.add_column("Updated", width=16, style="muted")

    for task in tasks:
        status_icon = "✅" if task.completed else "⬜"
        pstyle = _PRIORITY_STYLE.get(task.priority, "med")
        picon = _PRIORITY_ICON.get(task.priority, "🟡")
        priority_cell = Text(f"{picon} {task.priority.upper()}", style=pstyle)

        title_text = Text(task.title)
        if task.completed:
            title_text.stylize("strike dim")

        if task.tags:
            tags_cell = Text(", ".join(f"#{t}" for t in task.tags), style="cyan")
        else:
            tags_cell = Text("—", style="muted")

        due_cell = task.due_date or Text("—", style="muted")

        tbl.add_row(
            task.id,
            status_icon,
            priority_cell,
            title_text,
            tags_cell,
            due_cell,
            task.updated_at,
        )

    console.print(tbl)
    s = manager.stats()
    console.print(
        f"  [muted]Total [bold]{s['total']}[/bold]  ·  "
        f"[success]✅ {s['completed']} done[/success]  ·  "
        f"[warn]⬜ {s['pending']} pending[/warn][/muted]\n"
    )


# ─── Commands ─────────────────────────────────────────────────────────────────


def _cmd_add() -> None:
    console.print(Panel("[bold]New Task[/bold]", border_style="green", padding=(0, 2)))

    title = Prompt.ask("[info]Title[/info]")
    if not title.strip():
        console.print("[error]Title cannot be empty.[/error]\n")
        return

    description = Prompt.ask("[info]Description[/info]", default="")
    priority = Prompt.ask(
        "[info]Priority[/info]",
        choices=["low", "medium", "high"],
        default="medium",
    )
    tags_raw = Prompt.ask(
        "[info]Tags[/info] [muted](comma-separated, or blank)[/muted]",
        default="",
    )
    tags = [t.strip() for t in tags_raw.split(",") if t.strip()]
    due = Prompt.ask(
        "[info]Due date[/info] [muted](YYYY-MM-DD, or blank)[/muted]",
        default="",
    )

    task = manager.add(
        title=title,
        description=description,
        priority=priority,
        tags=tags,
        due_date=due.strip() or None,
    )
    console.print(
        f"\n[success]✅ Task created[/success] · [bold]{task.title}[/bold] [muted](ID: {task.id})[/muted]\n"
    )


def _cmd_list(arg: Optional[str] = None) -> None:
    fmap: dict[str | None, Optional[bool]] = {
        None: None,
        "all": None,
        "done": True,
        "completed": True,
        "pending": False,
        "todo": False,
    }
    filter_status = fmap.get(arg)
    label_map = {None: "All Tasks", True: "Completed", False: "Pending"}
    label = label_map.get(filter_status, "Tasks")
    tasks = manager.list_all(filter_status=filter_status)
    _render_table(tasks, title=label)


def _cmd_complete(task_id: Optional[str] = None) -> None:
    if not task_id:
        task_id = Prompt.ask("[info]Task ID[/info]")
    try:
        task = manager.complete(task_id.strip())
        console.print(f"[success]✅ Done:[/success] [bold]{task.title}[/bold]\n")
    except TaskNotFoundError:
        console.print(f"[error]Not found: {task_id}[/error]\n")


def _cmd_uncomplete(task_id: Optional[str] = None) -> None:
    if not task_id:
        task_id = Prompt.ask("[info]Task ID[/info]")
    try:
        task = manager.uncomplete(task_id.strip())
        console.print(f"[warn]⬜ Reopened:[/warn] [bold]{task.title}[/bold]\n")
    except TaskNotFoundError:
        console.print(f"[error]Not found: {task_id}[/error]\n")


def _cmd_update(task_id: Optional[str] = None) -> None:
    if not task_id:
        task_id = Prompt.ask("[info]Task ID[/info]")
    try:
        task = manager.get(task_id.strip())
    except TaskNotFoundError:
        console.print(f"[error]Not found: {task_id}[/error]\n")
        return

    console.print(
        Panel(
            f"[bold]Editing:[/bold] {task.title}",
            border_style="yellow",
            padding=(0, 2),
        )
    )
    console.print("[muted]Press Enter to keep current value.[/muted]\n")

    title = Prompt.ask(f"[info]Title[/info] [muted][{task.title}][/muted]", default=task.title)
    description = Prompt.ask(
        f"[info]Description[/info] [muted][{task.description or 'none'}][/muted]",
        default=task.description,
    )
    priority = Prompt.ask(
        f"[info]Priority[/info] [muted][{task.priority}][/muted]",
        choices=["low", "medium", "high"],
        default=task.priority,
    )
    tags_default = ",".join(task.tags)
    tags_raw = Prompt.ask(
        f"[info]Tags[/info] [muted][{tags_default or 'none'}][/muted]",
        default=tags_default,
    )
    tags = [t.strip() for t in tags_raw.split(",") if t.strip()]
    due = Prompt.ask(
        f"[info]Due date[/info] [muted][{task.due_date or 'none'}][/muted]",
        default=task.due_date or "",
    )

    manager.update(
        task_id.strip(),
        title=title.strip(),
        description=description.strip(),
        priority=priority,
        tags=tags,
        due_date=due.strip() or None,
    )
    console.print(f"\n[success]✏️  Updated:[/success] [bold]{title.strip()}[/bold]\n")


def _cmd_delete(task_id: Optional[str] = None) -> None:
    if not task_id:
        task_id = Prompt.ask("[info]Task ID[/info]")
    try:
        task = manager.get(task_id.strip())
    except TaskNotFoundError:
        console.print(f"[error]Not found: {task_id}[/error]\n")
        return

    if Confirm.ask(f"[warn]Delete '[bold]{task.title}[/bold]'?[/warn]"):
        manager.delete(task_id.strip())
        console.print(f"[error]🗑️  Deleted:[/error] [bold]{task.title}[/bold]\n")
    else:
        console.print("[muted]Cancelled.[/muted]\n")


def _cmd_search() -> None:
    query = Prompt.ask("[info]Search[/info]")
    if not query.strip():
        return
    tasks = manager.list_all(search=query.strip())
    _render_table(tasks, title=f'Search: "{query.strip()}"')


def _cmd_filter_priority() -> None:
    priority = Prompt.ask(
        "[info]Filter by priority[/info]",
        choices=["low", "medium", "high"],
    )
    tasks = manager.list_all(priority=priority)
    _render_table(tasks, title=f"Priority: {priority.upper()}")


def _cmd_help() -> None:
    tbl = Table(box=box.SIMPLE, show_header=False, border_style="dim", padding=(0, 1))
    tbl.add_column("Command", style="bold cyan", width=28)
    tbl.add_column("Description", style="white")

    rows = [
        ("add", "Add a new task (interactive)"),
        ("list  [all|done|pending]", "List tasks with optional filter"),
        ("complete  <id>", "Mark a task as done ✅"),
        ("uncomplete  <id>", "Reopen a completed task ⬜"),
        ("update  <id>", "Edit a task (interactive)"),
        ("delete  <id>", "Delete a task permanently"),
        ("search", "Full-text search across title & description"),
        ("priority", "Filter tasks by priority level"),
        ("help", "Show this help screen"),
        ("exit  /  quit  /  q", "Exit the application"),
    ]
    for cmd, desc in rows:
        tbl.add_row(cmd, desc)

    console.print(
        Panel(
            tbl,
            title="[bold]Commands[/bold]",
            border_style="cyan",
            padding=(0, 2),
        )
    )


def _print_banner() -> None:
    banner = (
        "[bold bright_blue]"
        "  ████████╗ ██████╗ ██████╗  ██████╗ \n"
        "     ██╔══╝██╔═══██╗██╔══██╗██╔═══██╗\n"
        "     ██║   ██║   ██║██║  ██║██║   ██║\n"
        "     ██║   ██║   ██║██║  ██║██║   ██║\n"
        "     ██║   ╚██████╔╝██████╔╝╚██████╔╝\n"
        "     ╚═╝    ╚═════╝ ╚═════╝  ╚═════╝ "
        "[/bold bright_blue]"
    )
    console.print(
        Panel(
            f"{banner}\n\n"
            "[muted]Panaversity Hackathon II — Phase I[/muted]\n"
            "[dim]Terminal Todo App  ·  Type [bold]help[/bold] for commands[/dim]",
            border_style="bright_blue",
            padding=(1, 4),
        )
    )


# ─── REPL ─────────────────────────────────────────────────────────────────────


def _repl() -> None:
    _print_banner()
    _cmd_list()

    while True:
        try:
            raw = Prompt.ask("\n[bold bright_blue]todo[/bold bright_blue]").strip()
        except (KeyboardInterrupt, EOFError):
            console.print("\n[muted]Goodbye 👋[/muted]")
            sys.exit(0)

        if not raw:
            continue

        parts = raw.split()
        cmd = parts[0].lower()
        args = parts[1:]

        try:
            match cmd:
                case "add":
                    _cmd_add()
                case "list" | "ls":
                    _cmd_list(args[0] if args else None)
                case "complete" | "done":
                    _cmd_complete(args[0] if args else None)
                case "uncomplete" | "reopen":
                    _cmd_uncomplete(args[0] if args else None)
                case "update" | "edit":
                    _cmd_update(args[0] if args else None)
                case "delete" | "del" | "rm":
                    _cmd_delete(args[0] if args else None)
                case "search" | "find":
                    _cmd_search()
                case "priority" | "filter":
                    _cmd_filter_priority()
                case "help" | "h" | "?":
                    _cmd_help()
                case "exit" | "quit" | "q":
                    console.print("[muted]Goodbye 👋[/muted]")
                    sys.exit(0)
                case _:
                    console.print(
                        f"[error]Unknown command:[/error] [bold]{cmd}[/bold]  "
                        f"[muted](type [bold]help[/bold] for available commands)[/muted]"
                    )
        except KeyboardInterrupt:
            console.print("\n[muted]Cancelled.[/muted]")


def main() -> None:
    _repl()


if __name__ == "__main__":
    main()
