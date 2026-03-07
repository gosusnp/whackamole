# 🔨 whackAmole

**Squash bugs and hammer down tasks with a coordinated stream team of agents.**

`whackAmole` is a lightweight task manager built for the age of AI-assisted development. Agents create tasks, you review and adjust them, agents pick them back up—closing the loop between automated work and human judgment.

Have a reviewer agent break down a PR into actionable tasks, open the Web UI to trim and rewrite them, then let a fixer agent work through the list while you watch progress in real time. Use the browser, the terminal, or both—whichever fits your flow.

## ✨ Features

- **Web UI**: A full-featured browser interface for managing projects and tasks—create, edit, update status, and write rich Markdown descriptions.
- **CLI**: A fast and intuitive command-line interface (`whack`) for scripting, automation, and terminal-native workflows.
- **Agent-Ready**: Built-in **MCP (Model Context Protocol)** server allowing AI agents to manage tasks autonomously.
- **Lightweight**: Built using Go and Preact with fully embedded assets and SQLite storage. A single command for terminal, MCP and UI.

## 🚀 Installation

```bash
go install github.com/gosusnp/whackamole@latest
```

## 🛠️ Getting Started

### 1. Initialize a Project

Projects are identified by a unique key (e.g., `whack`).

```bash
whack project add "My Awesome App" --key whack
```

### 2. Set Your Default Project (Local)

You can set a default project key for your current working directory. This avoids having to pass `--project` to every command. This is stored in a local `.whackamole.yaml` file.

```bash
# Set default project for the current directory
whack config set-local project whack
```

### 3. Start Whacking Tasks

You can manage tasks from the **Web UI** or the **CLI**—both are first-class interfaces.

**Launch the Web UI:**

```bash
whack ui
```

Spins up a local UI at `http://localhost:8080`.

**Or use the CLI:**

```bash
# Add a new task
whack task add "Implement OAuth2" --type feat --desc "Add Google and GitHub providers"

# List your tasks
whack task list

# Update a task status
whack task update 1 --status inProgress

# Show task details
whack task show 1
```

## 🌐 Web UI

`whackAmole` includes a full embedded web interface.

```bash
whack ui
```

By default, the UI listens to `http://localhost:8080`. You can specify a different port using the `--port` flag:

```bash
whack ui --port 9000
```

The Web UI lets you:
- Browse projects and tasks at a glance.
- Create, edit, and delete tasks with a rich Markdown editor.
- Update task status and type inline.
- Work with multiple tasks in parallel.

## 🤖 Agent Integration (MCP)

`whackAmole` exposes a full **MCP (Model Context Protocol)** server, giving agents direct access to create, read, and update tasks. Start it with:

```bash
whack mcp
```

### Available MCP Tools

- `list_tasks`: List all tasks for a specific project key.
- `add_task`: Create a new task within a project.
- `update_task`: Update an existing task's name, description, type, or status.
- `remove_task`: Delete a task by its ID.
- `show_project`: Get detailed information about a project.
- `show_task`: Get detailed information about a specific task.

## 💻 Development

The project includes a `Makefile` for common development tasks:

- `./whack-dev`: A wrapper for local development and testing.
- `make build`: Build the `whack` binary.
- `make test`: Run all tests with coverage.
- `make fix`: Format code and run the linter.
- `make clean`: Remove the built binary.

## 📄 License

MIT
