# 🔨 whackAmole

**Squash bugs and hammer down tasks with agent-grade precision.**

In the fast-paced world of agent-assisted coding, tasks can pop up like moles. `whackAmole` is a lightweight, CLI-first task manager designed to help you and your AI agents track, manage, and complete these tasks with speed and reliability.

## ✨ Features

- **CLI-First**: A fast and intuitive command-line interface (`whack`) for human developers.
- **Agent-Ready**: Built-in **MCP (Model Context Protocol)** server allowing AI agents to manage tasks autonomously.
- **Robust Architecture**: Built with a "Fat Store" pattern, hardened domain types, and embedded SQLite migrations.
- **Portable**: Zero-config SQLite persistence—your tasks stay with your project.

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

For convenience, you can set a default project key for your current working directory. This avoids having to pass `--project` to every command. This is stored in a local `.whackamole.yaml` file.

```bash
# Set default project for the current directory
whack config set-local project whack
```

### 3. Start Whacking Tasks

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

## 🤖 Agent Integration (MCP)

`whackAmole` speaks **MCP**, making it the perfect companion for AI agents. You can start the MCP server directly from the CLI:

```bash
whack mcp
```

### Available MCP Tools

When connected via MCP, agents have access to the following tools:

- `list_tasks`: List all tasks for a specific project key.
- `add_task`: Create a new task within a project.
- `update_task`: Update an existing task's name, description, type, or status.
- `remove_task`: Delete a task by its ID.
- `show_project`: Get detailed information about a project.
- `show_task`: Get detailed information about a specific task.

## 🌐 Web UI

For a more visual experience, `whackAmole` includes an embedded web interface.

```bash
whack ui
```

By default, the UI will be available at `http://localhost:8080`. You can specify a different port using the `--port` flag:

```bash
whack ui --port 9000
```

The Web UI allows you to:
- Browse projects and tasks.
- Create and edit tasks with a rich Markdown editor.

## 💻 Development

The project includes a `Makefile` for common development tasks:

- `./whack-dev`: A wrapper for local development and testing.
- `make build`: Build the `whack` binary.
- `make test`: Run all tests with coverage.
- `make fix`: Format code and run the linter.
- `make clean`: Remove the built binary.

## 📄 License

MIT
