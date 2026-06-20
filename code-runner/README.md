# Bluelearnerhub Code Runner (Go)

Secure, MongoDB-backed code-execution microservice for the Bluelearnerhub
practice / online-IDE module. The Node backend calls this service to run student
code inside a locked-down Docker sandbox and to fetch submission results.

## Why Go
Go is a strong fit here: a single static binary, first-class concurrency for
many parallel runs, low memory footprint, and the official `mongo-go-driver`
for MongoDB. It pairs cleanly with the existing MongoDB platform data.

## What it does
- `POST /execute` — runs `{ language, source, stdin, userId }` in a sandbox and
  returns `{ id, status, stdout, stderr, exitCode, timeMs }`.
- `GET /submissions/{id}` — fetches a persisted submission.
- `GET /languages` — lists supported languages.
- `GET /health` — `{ status, executionReady, persistence, languages }`.

Supported languages: Python, JavaScript, TypeScript, C, C++, C#, Java, Go,
Rust, PHP, Ruby (see `internal/executor/languages.go`).

## Safety model (read before enabling)
Executing untrusted code is dangerous. This service is **disabled by default**
(`EXECUTION_ENABLED=false`) and will not run anything until an operator opts in
on a host that has Docker. Each run uses:

- `--network none` (no network egress)
- `--read-only` root filesystem + a size-capped `exec` tmpfs for build output
- `--memory` / `--cpus` / `--pids-limit` caps + no swap
- `--cap-drop ALL` + `--security-opt no-new-privileges`
- a wall-clock timeout (`RUN_TIMEOUT_SECONDS`)
- output truncation (`MAX_OUTPUT_KB`)

Run this on a **dedicated, isolated host**. Pre-pull the per-language images so
runs work with `--network none`. Consider adding `--user` and seccomp/AppArmor
profiles for further hardening.

When `EXECUTION_ENABLED=false` or Docker is absent, `/execute` returns
`status: "disabled"` — it never falls back to running code on the host and never
returns fake output.

## Run locally
```bash
cp .env.example .env       # set EXECUTION_ENABLED=true on a Docker host to enable
go mod tidy                # resolve deps + generate go.sum (needs network once)
go run .
```

## Backend wiring
Set in the Node backend `.env`:
```
CODE_RUNNER_URL=http://localhost:8090
CODE_RUNNER_API_KEY=<same value as this service's RUNNER_API_KEY>
```
The backend's execution layer uses the Go runner when `CODE_RUNNER_URL` is set
and falls back to its existing providers otherwise.
