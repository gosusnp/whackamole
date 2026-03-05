VERSION ?= $(shell git describe --tags --always --dirty 2>/dev/null || echo "dev")
LDFLAGS = -X "github.com/gosusnp/whackamole/internal.Version=$(VERSION)"

build:
	go build -ldflags '$(LDFLAGS)' -o whack ./cmd/whack

check: lint test

ci: fmt-check license-check lint test

clean:
	rm -f whack

fix: fmt license-fix

fmt:
	gofmt -w .

fmt-check:
	@if [ -n "$$(gofmt -l .)" ]; then \
		echo "Files need formatting (run 'make fmt'):"; \
		gofmt -l .; \
		exit 1; \
	fi

install:
	go install ./cmd/whack

license-check:
	go tool addlicense -check -l mit -c "Jimmy Ma" -s=only .

lint:
	go vet ./...
	go tool golangci-lint run ./...

pre-commit: fix check

test:
	go tool gotestsum --format pkgname-and-test-fails -- -cover ./...

license-fix:
	go tool addlicense -l mit -c "Jimmy Ma" -s=only .
