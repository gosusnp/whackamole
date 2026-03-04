# Agent Guide

This file provides context and instructions for AI agents working on the `whackamole` project.

## Core Documentation
- @README.md: Installation, usage, and `Makefile` commands.
- @docs/architecture.md: High-level design, data flow, and "Fat Store" pattern.

## Architectural Mandates
- **Fat Store Pattern**: All data validation and business logic must reside in `internal/db/`. Do not perform validation in the CLI layer.
- **Hardened Types**: Use domain-specific types (e.g., `types.ProjectID`) instead of raw primitives (e.g., `int64`) for identifiers and other domain values to enhance type safety.
- **Embedded Migrations**: Database schema changes must be added to `internal/db/migrations/` and will be automatically applied on `db.Open`.
- **Database**: Use SQLite via `modernc.org/sqlite` (CGO-free).
- **CLI**: Use Cobra for command-line interface. Use `cmd.OutOrStdout()` for all output to ensure testability.

## Development Workflow
- **Local Testing**: Use `./whack-dev` to run the CLI without installing.
- **Testing**: 
    - Use `testify/suite` for store tests (see `internal/db/projects_test.go`).
    - Test CLI commands by capturing output and using temporary databases (see `internal/cli/project_test.go`).
- **Formatting**: Run `make fix` before submitting changes.

## Project Structure
- `internal/types/`: Shared model definitions (Plain Old Data).
- `internal/db/`: Persistence logic, stores, and migrations.
- `internal/cli/`: Command definitions and CLI-specific logic.
