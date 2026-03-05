build:
	go build -o whack ./cmd/whack

check: lint test

clean:
	rm -f whack

fix: fmt license-fix

fmt:
	gofmt -w .

install:
	go install ./cmd/whack

lint:
	go vet ./...
	go tool golangci-lint run ./...

pre-commit: fix check

test:
	go tool gotestsum --format pkgname-and-test-fails -- -cover ./...

license-fix:
	go tool addlicense -l mit -c "Jimmy Ma" -s=only .
