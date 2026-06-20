module github.com/bluelearnerhub/code-runner

go 1.22

require go.mongodb.org/mongo-driver v1.16.1

// Run `go mod tidy` once to resolve the indirect dependencies and generate
// go.sum (requires network access). The mongo-go-driver is the only direct
// dependency; everything else is the Go standard library.
