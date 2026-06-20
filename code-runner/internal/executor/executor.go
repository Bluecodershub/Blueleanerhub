// Package executor runs untrusted source code inside a locked-down Docker
// sandbox: no network, dropped capabilities, read-only root, capped memory/CPU/
// pids, and a wall-clock timeout. If execution is disabled or Docker is missing,
// it returns a clear "disabled" result instead of running code on the host.
package executor

import (
	"bytes"
	"context"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"strconv"
	"strings"
	"time"
)

type Request struct {
	Language string
	Source   string
	Stdin    string
}

type Result struct {
	Status   string `json:"status"` // success | error | timeout | disabled | unsupported_language | internal_error
	Stdout   string `json:"stdout"`
	Stderr   string `json:"stderr"`
	ExitCode int    `json:"exitCode"`
	TimeMs   int64  `json:"timeMs"`
	Message  string `json:"message,omitempty"`
}

type Config struct {
	Enabled     bool
	RunTimeout  time.Duration
	MemoryLimit string
	CPULimit    string
	PidsLimit   int
	MaxOutputKB int
}

type Executor struct {
	cfg          Config
	dockerOnPath bool
}

func New(cfg Config) *Executor {
	_, err := exec.LookPath("docker")
	return &Executor{cfg: cfg, dockerOnPath: err == nil}
}

// Ready reports whether real execution can run (opted-in AND Docker available).
func (e *Executor) Ready() bool { return e.cfg.Enabled && e.dockerOnPath }

func (e *Executor) Execute(ctx context.Context, req Request) Result {
	spec, ok := Languages[req.Language]
	if !ok {
		return Result{Status: "unsupported_language", Message: "language not supported: " + req.Language}
	}
	if !e.cfg.Enabled {
		return Result{Status: "disabled", Message: "code execution is disabled (set EXECUTION_ENABLED=true)"}
	}
	if !e.dockerOnPath {
		return Result{Status: "disabled", Message: "Docker is not available on the runner host"}
	}

	// Stage the source in a private temp dir mounted read-only into the sandbox.
	workDir, err := os.MkdirTemp("", "blh-run-*")
	if err != nil {
		return Result{Status: "internal_error", Message: "could not create work dir"}
	}
	defer os.RemoveAll(workDir)

	if err := os.WriteFile(filepath.Join(workDir, spec.Filename), []byte(req.Source), 0o644); err != nil {
		return Result{Status: "internal_error", Message: "could not write source"}
	}

	runCtx, cancel := context.WithTimeout(ctx, e.cfg.RunTimeout)
	defer cancel()

	inner := fmt.Sprintf("mkdir -p /tmp/work && cp -a /sandbox/. /tmp/work/ && cd /tmp/work && %s", spec.Cmd)
	args := []string{
		"run", "--rm", "-i",
		"--network", "none",
		"--memory", e.cfg.MemoryLimit,
		"--memory-swap", e.cfg.MemoryLimit, // disallow swap
		"--cpus", e.cfg.CPULimit,
		"--pids-limit", strconv.Itoa(e.cfg.PidsLimit),
		"--read-only",
		"--tmpfs", "/tmp:rw,exec,size=64m",
		"--security-opt", "no-new-privileges",
		"--cap-drop", "ALL",
		"-e", "HOME=/tmp",
		"-v", workDir + ":/sandbox:ro",
		"-w", "/tmp",
		spec.Image,
		"sh", "-c", inner,
	}

	cmd := exec.CommandContext(runCtx, "docker", args...)
	if req.Stdin != "" {
		cmd.Stdin = strings.NewReader(req.Stdin)
	}
	var stdout, stderr bytes.Buffer
	cmd.Stdout = &stdout
	cmd.Stderr = &stderr

	start := time.Now()
	runErr := cmd.Run()
	elapsed := time.Since(start).Milliseconds()

	res := Result{
		Stdout: e.truncate(stdout.String()),
		Stderr: e.truncate(stderr.String()),
		TimeMs: elapsed,
	}

	if runCtx.Err() == context.DeadlineExceeded {
		res.Status = "timeout"
		res.Message = fmt.Sprintf("execution exceeded %s", e.cfg.RunTimeout)
		return res
	}

	if runErr == nil {
		res.Status = "success"
		res.ExitCode = 0
		return res
	}

	var exitErr *exec.ExitError
	if errorsAs(runErr, &exitErr) {
		res.ExitCode = exitErr.ExitCode()
		res.Status = "error" // compile or runtime error — see stderr
		return res
	}

	// docker itself failed (image missing, daemon down, etc.)
	res.Status = "internal_error"
	res.Message = runErr.Error()
	return res
}

func (e *Executor) truncate(s string) string {
	max := e.cfg.MaxOutputKB * 1024
	if max > 0 && len(s) > max {
		return s[:max] + "\n…[output truncated]"
	}
	return s
}

// small local helper to avoid importing errors just for As in one spot
func errorsAs(err error, target **exec.ExitError) bool {
	if e, ok := err.(*exec.ExitError); ok {
		*target = e
		return true
	}
	return false
}
