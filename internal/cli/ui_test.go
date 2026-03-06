// Copyright 2026 Jimmy Ma
// SPDX-License-Identifier: MIT

package cli

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"os"
	"testing"

	"github.com/gosusnp/whackamole/internal/db"
	"github.com/gosusnp/whackamole/internal/types"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestUIAPI(t *testing.T) {
	// Setup temp DB
	tmpFile, err := os.CreateTemp("", "whack_ui_test_*.db")
	require.NoError(t, err)
	testDbPath := tmpFile.Name()
	tmpFile.Close()
	defer os.Remove(testDbPath)

	database, err := db.Open(testDbPath)
	require.NoError(t, err)
	defer database.Close()

	handler, err := newUIServer(database)
	require.NoError(t, err)

	server := httptest.NewServer(handler)
	defer server.Close()

	t.Run("StaticFiles", func(t *testing.T) {
		resp, err := http.Get(server.URL + "/")
		require.NoError(t, err)
		assert.Equal(t, http.StatusOK, resp.StatusCode)
		assert.Contains(t, resp.Header.Get("Content-Type"), "text/html")

		resp, err = http.Get(server.URL + "/vite.svg")
		require.NoError(t, err)
		assert.Equal(t, http.StatusOK, resp.StatusCode)
		assert.Contains(t, resp.Header.Get("Content-Type"), "image/svg+xml")
	})

	t.Run("CreateProject", func(t *testing.T) {
		p := types.Project{Name: "API Project", Key: "api-p"}
		body, _ := json.Marshal(p)
		resp, err := http.Post(server.URL+"/api/projects", "application/json", bytes.NewBuffer(body))
		require.NoError(t, err)
		assert.Equal(t, http.StatusCreated, resp.StatusCode)

		var created types.Project
		err = json.NewDecoder(resp.Body).Decode(&created)
		require.NoError(t, err)
		assert.Equal(t, "API Project", created.Name)
		assert.Equal(t, types.ProjectKey("api-p"), created.Key)
	})

	t.Run("ListProjects", func(t *testing.T) {
		resp, err := http.Get(server.URL + "/api/projects")
		require.NoError(t, err)
		assert.Equal(t, http.StatusOK, resp.StatusCode)

		var projects []types.Project
		err = json.NewDecoder(resp.Body).Decode(&projects)
		require.NoError(t, err)
		assert.NotEmpty(t, projects)
		assert.Equal(t, "API Project", projects[0].Name)
	})

	t.Run("GetProject", func(t *testing.T) {
		resp, err := http.Get(server.URL + "/api/projects/1")
		require.NoError(t, err)
		assert.Equal(t, http.StatusOK, resp.StatusCode)

		var project types.Project
		err = json.NewDecoder(resp.Body).Decode(&project)
		require.NoError(t, err)
		assert.Equal(t, types.ProjectID(1), project.ID)
		assert.Equal(t, "API Project", project.Name)
	})

	t.Run("UpdateProject", func(t *testing.T) {
		p := types.Project{Name: "Updated Project", Key: "api-p-upd"}
		body, _ := json.Marshal(p)
		req, _ := http.NewRequest(http.MethodPut, server.URL+"/api/projects/1", bytes.NewBuffer(body))
		req.Header.Set("Content-Type", "application/json")
		resp, err := http.DefaultClient.Do(req)
		require.NoError(t, err)
		assert.Equal(t, http.StatusOK, resp.StatusCode)

		var updated types.Project
		err = json.NewDecoder(resp.Body).Decode(&updated)
		require.NoError(t, err)
		assert.Equal(t, "Updated Project", updated.Name)
	})

	t.Run("CreateTask", func(t *testing.T) {
		tk := types.Task{
			ProjectID: 1,
			Name:      "API Task",
			Type:      types.TaskTypeFeat,
			Status:    types.TaskStatusNotStarted,
		}
		body, _ := json.Marshal(tk)
		resp, err := http.Post(server.URL+"/api/tasks", "application/json", bytes.NewBuffer(body))
		require.NoError(t, err)
		assert.Equal(t, http.StatusCreated, resp.StatusCode)

		var created types.Task
		err = json.NewDecoder(resp.Body).Decode(&created)
		require.NoError(t, err)
		assert.Equal(t, "API Task", created.Name)
		assert.Equal(t, types.ProjectID(1), created.ProjectID)
	})

	t.Run("GetTask", func(t *testing.T) {
		resp, err := http.Get(server.URL + "/api/tasks/1")
		require.NoError(t, err)
		assert.Equal(t, http.StatusOK, resp.StatusCode)

		var task types.Task
		err = json.NewDecoder(resp.Body).Decode(&task)
		require.NoError(t, err)
		assert.Equal(t, types.TaskID(1), task.ID)
		assert.Equal(t, "API Task", task.Name)
	})

	t.Run("UpdateTask", func(t *testing.T) {
		tk := types.Task{
			Name:   "Updated Task",
			Type:   types.TaskTypeBug,
			Status: types.TaskStatusInProgress,
		}
		body, _ := json.Marshal(tk)
		req, _ := http.NewRequest(http.MethodPut, server.URL+"/api/tasks/1", bytes.NewBuffer(body))
		req.Header.Set("Content-Type", "application/json")
		resp, err := http.DefaultClient.Do(req)
		require.NoError(t, err)
		assert.Equal(t, http.StatusOK, resp.StatusCode)

		var updated types.Task
		err = json.NewDecoder(resp.Body).Decode(&updated)
		require.NoError(t, err)
		assert.Equal(t, "Updated Task", updated.Name)
		assert.Equal(t, types.TaskStatusInProgress, updated.Status)
	})

	t.Run("ListTasks", func(t *testing.T) {
		resp, err := http.Get(server.URL + "/api/tasks?projectId=1")
		require.NoError(t, err)
		assert.Equal(t, http.StatusOK, resp.StatusCode)

		var tasks []types.Task
		err = json.NewDecoder(resp.Body).Decode(&tasks)
		require.NoError(t, err)
		assert.NotEmpty(t, tasks)
		assert.Equal(t, "Updated Task", tasks[0].Name)
	})

	t.Run("DeleteTask", func(t *testing.T) {
		req, _ := http.NewRequest(http.MethodDelete, server.URL+"/api/tasks/1", nil)
		resp, err := http.DefaultClient.Do(req)
		require.NoError(t, err)
		assert.Equal(t, http.StatusNoContent, resp.StatusCode)

		resp, err = http.Get(server.URL + "/api/tasks/1")
		require.NoError(t, err)
		assert.Equal(t, http.StatusNotFound, resp.StatusCode)
	})

	t.Run("DeleteProject", func(t *testing.T) {
		req, _ := http.NewRequest(http.MethodDelete, server.URL+"/api/projects/1", nil)
		resp, err := http.DefaultClient.Do(req)
		require.NoError(t, err)
		assert.Equal(t, http.StatusNoContent, resp.StatusCode)

		resp, err = http.Get(server.URL + "/api/projects/1")
		require.NoError(t, err)
		assert.Equal(t, http.StatusNotFound, resp.StatusCode)
	})
}
