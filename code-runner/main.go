// Command code-runner is the Bluelearnerhub secure code-execution microservice.
//
// It exposes a small HTTP API the Node backend calls to run student code inside
// a Docker sandbox and persists each submission to MongoDB. Execution is OFF by
// default and must be explicitly enabled by an operator on a host with Docker.
package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/bluelearnerhub/code-runner/internal/api"
	"github.com/bluelearnerhub/code-runner/internal/config"
	"github.com/bluelearnerhub/code-runner/internal/executor"
	"github.com/bluelearnerhub/code-runner/internal/store"
)

func main() {
	cfg := config.Load()

	ctx := context.Background()
	st, err := store.Connect(ctx, cfg.MongoURI, cfg.MongoDB)
	if err != nil {
		log.Printf("[startup] MongoDB connect failed (%v) — continuing without persistence", err)
		st = &store.Store{}
	} else if st.Enabled() {
		log.Printf("[startup] connected to MongoDB (%s)", cfg.MongoDB)
	}
	defer st.Disconnect(ctx)

	ex := executor.New(executor.Config{
		Enabled:     cfg.ExecutionEnabled,
		RunTimeout:  cfg.RunTimeout,
		MemoryLimit: cfg.MemoryLimit,
		CPULimit:    cfg.CPULimit,
		PidsLimit:   cfg.PidsLimit,
		MaxOutputKB: cfg.MaxOutputKB,
	})
	log.Printf("[startup] execution ready: %v", ex.Ready())

	srv := api.NewServer(st, ex, cfg.APIKey, cfg.MaxCodeBytes)
	httpServer := &http.Server{
		Addr:              ":" + cfg.Port,
		Handler:           srv.Handler(),
		ReadHeaderTimeout: 10 * time.Second,
	}

	go func() {
		log.Printf("[startup] code-runner listening on :%s", cfg.Port)
		if err := httpServer.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("server error: %v", err)
		}
	}()

	// Graceful shutdown on SIGINT/SIGTERM.
	stop := make(chan os.Signal, 1)
	signal.Notify(stop, os.Interrupt, syscall.SIGTERM)
	<-stop
	log.Println("[shutdown] draining...")
	shutdownCtx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	_ = httpServer.Shutdown(shutdownCtx)
}
