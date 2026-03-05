// Copyright 2026 Jimmy Ma
// SPDX-License-Identifier: MIT

package cli

import (
	"context"
	"os"
	"testing"

	"github.com/gosusnp/whackamole/internal/db"
	"github.com/mark3labs/mcp-go/mcp"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestMCPHandlers(t *testing.T) {
	// Setup temp DB
	tmpFile, err := os.CreateTemp("", "whack_mcp_test_*.db")
	require.NoError(t, err)
	testDbPath := tmpFile.Name()
	tmpFile.Close()
	defer os.Remove(testDbPath)

	database, err := db.Open(testDbPath)
	require.NoError(t, err)
	defer database.Close()

	taskStore := db.NewTaskStore(database)
	projectStore := db.NewProjectStore(database)

	// Create a project first
	p, err := projectStore.Create("Test Project", "p1")
	require.NoError(t, err)

	t.Run("list_tasks_empty", func(t *testing.T) {
		handler := listTasksHandler(taskStore, projectStore)
		req := mcp.CallToolRequest{}
		req.Params.Arguments = map[string]any{
			"projectKey": "p1",
		}

		result, err := handler(context.Background(), req)
		assert.NoError(t, err)
		assert.Contains(t, result.Content[0].(mcp.TextContent).Text, "No tasks found")
	})

	t.Run("add_task", func(t *testing.T) {
		handler := addTaskHandler(taskStore, projectStore)
		req := mcp.CallToolRequest{}
		req.Params.Arguments = map[string]any{
			"projectKey": "p1",
			"name":       "New Task",
		}

		result, err := handler(context.Background(), req)
		assert.NoError(t, err)
		assert.Contains(t, result.Content[0].(mcp.TextContent).Text, "Task created")

		// Verify task was actually created
		tasks, err := taskStore.ListByProject(p.ID, true)
		assert.NoError(t, err)
		assert.Len(t, tasks, 1)
		assert.Equal(t, "New Task", tasks[0].Name)
	})

	t.Run("list_tasks_with_content", func(t *testing.T) {
		handler := listTasksHandler(taskStore, projectStore)
		req := mcp.CallToolRequest{}
		req.Params.Arguments = map[string]any{
			"projectKey": "p1",
		}

		result, err := handler(context.Background(), req)
		assert.NoError(t, err)
		assert.Contains(t, result.Content[0].(mcp.TextContent).Text, "New Task")
	})

	t.Run("remove_task", func(t *testing.T) {
		tasks, _ := taskStore.ListByProject(p.ID, true)
		taskID := tasks[0].ID

		handler := removeTaskHandler(taskStore)
		req := mcp.CallToolRequest{}
		req.Params.Arguments = map[string]any{
			"taskId": float64(taskID), // mcp-go uses float64 for numbers from JSON
		}

		result, err := handler(context.Background(), req)
		assert.NoError(t, err)
		assert.Contains(t, result.Content[0].(mcp.TextContent).Text, "removed")

		// Verify task was actually removed
		tasks, err = taskStore.ListByProject(p.ID, true)
		assert.NoError(t, err)
		assert.Len(t, tasks, 0)
	})
}
