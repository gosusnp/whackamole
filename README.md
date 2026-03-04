# whackAmole

whackAmole is a small task manager designed to assist agent coding sessions. It provides a CLI tool, `whack`, to help manage and track tasks effectively.

## Features

- **Task Management**: Easily create, update, and track tasks.
- **Agent Assistance**: Tailored for agent-driven development workflows.
- **CLI-First**: Lightweight and fast command-line interface.

## Installation

```bash
go install github.com/gosusnp/whackamole@latest
```

## Usage

The primary binary is `whack`.

```bash
whack --help
```

## Development

The project includes a `Makefile` for common development tasks:

- `./whack-dev`: A wrapper for local development and testing.
- `make build`: Build the `whack` binary.
- `make check`: Run linting and tests.
- `make clean`: Remove the built binary.
- `make fix`: Format the code and run the linter.
- `make fmt`: Format all `.go` files with `gofmt`.
- `make lint`: Run `go vet` and `golangci-lint`.
- `make pre-commit`: Run all checks and formatting before committing.
- `make test`: Run all tests with coverage using `gotestsum`.
- `make license-fix`: Add MIT license headers to all files.

## License

MIT
