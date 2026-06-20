// Package config loads the code-runner configuration from environment
// variables. No secret has a default; everything is read from the environment
// so nothing sensitive is ever hardcoded.
package config

import (
	"log"
	"os"
	"strconv"
	"time"
)

type Config struct {
	Port string

	// MongoDB — optional. When MongoURI is empty the service still runs but
	// submissions are not persisted (a warning is logged at startup).
	MongoURI string
	MongoDB  string

	// Execution safety. ExecutionEnabled is FALSE by default: the service will
	// not run untrusted code on the host until an operator explicitly opts in
	// AND Docker is available. When disabled, /execute returns status "disabled".
	ExecutionEnabled bool

	// Docker sandbox limits.
	RunTimeout   time.Duration // wall-clock per run
	MemoryLimit  string        // docker --memory, e.g. "128m"
	CPULimit     string        // docker --cpus, e.g. "0.5"
	PidsLimit    int           // docker --pids-limit
	MaxCodeBytes int           // reject source larger than this
	MaxOutputKB  int           // truncate stdout/stderr beyond this

	// Optional shared secret. When set, callers must send it as
	// `X-Runner-Key`. Leave empty to disable the check (e.g. on a private net).
	APIKey string
}

func getenv(key, def string) string {
	if v, ok := os.LookupEnv(key); ok && v != "" {
		return v
	}
	return def
}

func getbool(key string, def bool) bool {
	v, ok := os.LookupEnv(key)
	if !ok || v == "" {
		return def
	}
	b, err := strconv.ParseBool(v)
	if err != nil {
		return def
	}
	return b
}

func getint(key string, def int) int {
	v, ok := os.LookupEnv(key)
	if !ok || v == "" {
		return def
	}
	n, err := strconv.Atoi(v)
	if err != nil {
		return def
	}
	return n
}

// Load reads configuration from the process environment, applying safe defaults.
func Load() Config {
	cfg := Config{
		Port:             getenv("PORT", "8090"),
		MongoURI:         os.Getenv("MONGODB_URI"),
		MongoDB:          getenv("MONGODB_DB", "bluelearnerhub"),
		ExecutionEnabled: getbool("EXECUTION_ENABLED", false),
		RunTimeout:       time.Duration(getint("RUN_TIMEOUT_SECONDS", 10)) * time.Second,
		MemoryLimit:      getenv("MEMORY_LIMIT", "128m"),
		CPULimit:         getenv("CPU_LIMIT", "0.5"),
		PidsLimit:        getint("PIDS_LIMIT", 128),
		MaxCodeBytes:     getint("MAX_CODE_BYTES", 64*1024),
		MaxOutputKB:      getint("MAX_OUTPUT_KB", 64),
		APIKey:           os.Getenv("RUNNER_API_KEY"),
	}

	if cfg.MongoURI == "" {
		log.Println("[config] MONGODB_URI not set — submissions will NOT be persisted")
	}
	if !cfg.ExecutionEnabled {
		log.Println("[config] EXECUTION_ENABLED=false — code execution is disabled (safe default)")
	}
	return cfg
}
