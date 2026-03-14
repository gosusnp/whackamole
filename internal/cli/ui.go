// Copyright 2026 Jimmy Ma
// SPDX-License-Identifier: MIT

package cli

import (
	"database/sql"
	"embed"
	"encoding/json"
	"fmt"
	"io/fs"
	"net/http"
	"strconv"
	"time"

	"github.com/gosusnp/whackamole/internal/db"
	"github.com/gosusnp/whackamole/internal/types"
	"github.com/spf13/cobra"
)

//go:embed static
var staticFS embed.FS

var uiCmd = &cobra.Command{
	Use:   "ui",
	Short: "Start the web UI",
	Long:  `Start the embedded web user interface to manage tasks and projects visually.`,
	RunE: func(cmd *cobra.Command, args []string) error {
		port, _ := cmd.Flags().GetInt("port")
		dbPath := getDBPath(cmd)

		database, err := db.Open(dbPath)
		if err != nil {
			return err
		}
		defer database.Close()

		mux, err := newUIServer(database)
		if err != nil {
			return err
		}

		fmt.Fprintf(cmd.OutOrStdout(), "Starting UI on http://localhost:%d\n", port)
		return http.ListenAndServe(fmt.Sprintf(":%d", port), mux)
	},
}

func newUIServer(database *sql.DB) (http.Handler, error) {
	sub, err := fs.Sub(staticFS, "static")
	if err != nil {
		return nil, err
	}

	mux := http.NewServeMux()

	historyStore := db.NewHistoryStore(database)
	projectStore := db.NewProjectStore(database, historyStore)
	taskStore := db.NewTaskStore(database, historyStore)
	configStore := db.NewConfigStore(database)

	registerProjectHandlers(mux, projectStore)
	registerTaskHandlers(mux, taskStore)
	registerConfigHandlers(mux, configStore)
	registerHistoryHandlers(mux, historyStore)

	// Static File Server
	mux.Handle("/", http.FileServer(http.FS(sub)))

	return mux, nil
}

func registerHistoryHandlers(mux *http.ServeMux, store *db.HistoryStore) {
	mux.HandleFunc("GET /api/history", func(w http.ResponseWriter, r *http.Request) {
		sinceStr := r.URL.Query().Get("since")
		var since time.Time
		var err error
		if sinceStr != "" {
			since, err = time.Parse(time.RFC3339, sinceStr)
			if err != nil {
				http.Error(w, "invalid since parameter (RFC3339 expected)", http.StatusBadRequest)
				return
			}
		} else {
			// Default to 1 hour ago if not specified
			since = time.Now().Add(-1 * time.Hour)
		}

		updates, err := store.GetUpdates(since)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		if err := json.NewEncoder(w).Encode(updates); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
		}
	})
}

func registerProjectHandlers(mux *http.ServeMux, store *db.ProjectStore) {
	mux.HandleFunc("GET /api/projects", func(w http.ResponseWriter, r *http.Request) {
		projects, err := store.List()
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		if err := json.NewEncoder(w).Encode(projects); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
		}
	})

	mux.HandleFunc("POST /api/projects", func(w http.ResponseWriter, r *http.Request) {
		var p types.Project
		if err := json.NewDecoder(r.Body).Decode(&p); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		project, err := store.Create(p.Name, p.Key)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusCreated)
		if err := json.NewEncoder(w).Encode(project); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
		}
	})

	mux.HandleFunc("GET /api/projects/{id}", func(w http.ResponseWriter, r *http.Request) {
		idStr := r.PathValue("id")
		id, err := strconv.ParseInt(idStr, 10, 64)
		if err != nil {
			http.Error(w, "invalid id", http.StatusBadRequest)
			return
		}
		project, err := store.Get(types.ProjectID(id))
		if err != nil {
			http.Error(w, err.Error(), http.StatusNotFound)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		if err := json.NewEncoder(w).Encode(project); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
		}
	})

	mux.HandleFunc("PUT /api/projects/{id}", func(w http.ResponseWriter, r *http.Request) {
		idStr := r.PathValue("id")
		id, err := strconv.ParseInt(idStr, 10, 64)
		if err != nil {
			http.Error(w, "invalid id", http.StatusBadRequest)
			return
		}
		var p types.Project
		if err := json.NewDecoder(r.Body).Decode(&p); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		project, err := store.Update(types.ProjectID(id), p.Name, p.Key)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		if err := json.NewEncoder(w).Encode(project); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
		}
	})

	mux.HandleFunc("DELETE /api/projects/{id}", func(w http.ResponseWriter, r *http.Request) {
		idStr := r.PathValue("id")
		id, err := strconv.ParseInt(idStr, 10, 64)
		if err != nil {
			http.Error(w, "invalid id", http.StatusBadRequest)
			return
		}
		if err := store.Delete(types.ProjectID(id)); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		w.WriteHeader(http.StatusNoContent)
	})
}

func registerTaskHandlers(mux *http.ServeMux, store *db.TaskStore) {
	mux.HandleFunc("GET /api/tasks", func(w http.ResponseWriter, r *http.Request) {
		projectIDStr := r.URL.Query().Get("projectId")
		if projectIDStr == "" {
			http.Error(w, "projectId query parameter is required", http.StatusBadRequest)
			return
		}
		projectID, err := strconv.ParseInt(projectIDStr, 10, 64)
		if err != nil {
			http.Error(w, "invalid projectId", http.StatusBadRequest)
			return
		}
		tasks, err := store.ListByProject(types.ProjectID(projectID), true)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		if err := json.NewEncoder(w).Encode(tasks); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
		}
	})

	mux.HandleFunc("POST /api/tasks", func(w http.ResponseWriter, r *http.Request) {
		var t types.Task
		if err := json.NewDecoder(r.Body).Decode(&t); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		task, err := store.Create(t.ProjectID, t.Name, t.Description, t.Type, t.Status)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusCreated)
		if err := json.NewEncoder(w).Encode(task); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
		}
	})

	mux.HandleFunc("GET /api/tasks/{id}", func(w http.ResponseWriter, r *http.Request) {
		idStr := r.PathValue("id")
		id, err := strconv.ParseInt(idStr, 10, 64)
		if err != nil {
			http.Error(w, "invalid id", http.StatusBadRequest)
			return
		}
		task, err := store.Get(types.TaskID(id))
		if err != nil {
			http.Error(w, err.Error(), http.StatusNotFound)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		if err := json.NewEncoder(w).Encode(task); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
		}
	})

	mux.HandleFunc("PUT /api/tasks/{id}", func(w http.ResponseWriter, r *http.Request) {
		idStr := r.PathValue("id")
		id, err := strconv.ParseInt(idStr, 10, 64)
		if err != nil {
			http.Error(w, "invalid id", http.StatusBadRequest)
			return
		}
		var t types.Task
		if err := json.NewDecoder(r.Body).Decode(&t); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		task, err := store.Update(types.TaskID(id), t.Name, t.Description, t.Type, t.Status)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		if err := json.NewEncoder(w).Encode(task); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
		}
	})

	mux.HandleFunc("PATCH /api/tasks/{id}", func(w http.ResponseWriter, r *http.Request) {
		idStr := r.PathValue("id")
		id, err := strconv.ParseInt(idStr, 10, 64)
		if err != nil {
			http.Error(w, "invalid id", http.StatusBadRequest)
			return
		}
		var updates map[string]interface{}
		if err := json.NewDecoder(r.Body).Decode(&updates); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		task, err := store.Patch(types.TaskID(id), updates)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		if err := json.NewEncoder(w).Encode(task); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
		}
	})

	mux.HandleFunc("DELETE /api/tasks/{id}", func(w http.ResponseWriter, r *http.Request) {
		idStr := r.PathValue("id")
		id, err := strconv.ParseInt(idStr, 10, 64)
		if err != nil {
			http.Error(w, "invalid id", http.StatusBadRequest)
			return
		}
		if err := store.Delete(types.TaskID(id)); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		w.WriteHeader(http.StatusNoContent)
	})

	mux.HandleFunc("DELETE /api/tasks/cleanup", func(w http.ResponseWriter, r *http.Request) {
		projectIDStr := r.URL.Query().Get("projectId")
		if projectIDStr == "" {
			http.Error(w, "projectId query parameter is required", http.StatusBadRequest)
			return
		}
		projectID, err := strconv.ParseInt(projectIDStr, 10, 64)
		if err != nil {
			http.Error(w, "invalid projectId", http.StatusBadRequest)
			return
		}
		if err := store.DeleteCompleted(types.ProjectID(projectID)); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		w.WriteHeader(http.StatusNoContent)
	})
}

func registerConfigHandlers(mux *http.ServeMux, store *db.ConfigStore) {
	mux.HandleFunc("GET /api/configs", func(w http.ResponseWriter, r *http.Request) {
		configs, err := store.GetConfigs()
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		if err := json.NewEncoder(w).Encode(configs); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
		}
	})

	mux.HandleFunc("POST /api/configs", func(w http.ResponseWriter, r *http.Request) {
		var c types.GlobalConfig
		if err := json.NewDecoder(r.Body).Decode(&c); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		if !c.Key.IsValid() {
			http.Error(w, fmt.Sprintf("invalid config key: %s", c.Key), http.StatusBadRequest)
			return
		}

		err := store.UpdateConfig(c.Key, c.Value)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		w.WriteHeader(http.StatusNoContent)
	})
}

func init() {
	rootCmd.AddCommand(uiCmd)
	uiCmd.Flags().IntP("port", "P", 8080, "Port to run the UI on")
}
