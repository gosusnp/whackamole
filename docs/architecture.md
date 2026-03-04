# Architecture

This document describes the architecture of `whackamole`.

## Overview

`whackamole` is a CLI-based task manager designed for agent-assisted coding. It uses a structured approach to separate concerns between the CLI interface, data models, and persistence layers.

## Project Structure

- `cmd/whack/`: Entry point of the application.
- `internal/cli/`: Cobra commands and CLI-specific logic.
- `internal/db/`: Database persistence layer, including migrations and stores.
- `internal/types/`: Plain Old Data (POD) objects used across the application.
- `internal/db/migrations/`: Embedded SQL migration files.

## Data Flow

1. **CLI Layer (`internal/cli`)**: Parses user input using Cobra, handles flags (like `--db`), and interacts with the Store layer. It is responsible for formatting output (e.g., using `tabwriter`).
2. **Store Layer (`internal/db`)**: Manages all database interactions. Following the **Fat Store** approach, this layer is responsible for:
    - Executing SQL queries.
    - Mapping database rows to `internal/types`.
    - **Data Validation**: Ensuring business rules (e.g., "project name cannot be empty") are enforced before any database modification.
3. **Model Layer (`internal/types`)**: Defines the structure of entities (like `Project`) used throughout the system.

## Persistence

- **SQLite**: Used for local, file-based persistence.
- **Migrations**: Managed via `golang-migrate`. Migrations are embedded into the binary using Go's `embed` package, ensuring the database schema is automatically kept up to date on execution.
- **Triggers**: Database-level triggers are used for automatic field updates, such as the `updated_at` timestamp on the `projects` table.

## Design Principles

- **Fat Stores**: We centralize validation and logic within the store methods. This ensures that any interface (CLI, API, or Tests) using the store benefits from the same consistency checks.
- **Hardened Types**: We prefer using custom, domain-specific types (e.g., `ProjectID` instead of `int64`) for identifiers and other key domain values. This prevents accidental mixing of values (like using a user ID where a project ID is expected) and makes the codebase more robust and self-documenting.
- **Embedded Assets**: By embedding migrations, we ensure the binary is self-contained and easy to distribute.
- **Testability**: 
    - Stores are tested using a dedicated test suite (`testify/suite`) with temporary database files.
    - CLI commands are tested by capturing `Stdout` and injecting temporary database paths.
