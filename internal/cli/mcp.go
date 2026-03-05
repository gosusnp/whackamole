// Copyright 2026 Jimmy Ma
// SPDX-License-Identifier: MIT

package cli

import (
	"context"
	"fmt"
	"os"

	"github.com/gosusnp/whackamole/internal"
	"github.com/gosusnp/whackamole/internal/db"
	"github.com/gosusnp/whackamole/internal/types"
	"github.com/mark3labs/mcp-go/mcp"
	"github.com/mark3labs/mcp-go/server"
	"github.com/spf13/cobra"
)

var mcpCmd = &cobra.Command{
	Use:   "mcp",
	Short: "Start the MCP server",
	RunE: func(cmd *cobra.Command, args []string) error {
		return startMCPServer()
	},
}

func init() {
	rootCmd.AddCommand(mcpCmd)
}

func startMCPServer() error {
	fmt.Fprintf(os.Stderr, "Starting whackAmole MCP server version %s\n", internal.Version)
	s := server.NewMCPServer(
		"whackAmole",
		internal.Version,
		server.WithLogging(),
	)

	database, err := db.Open(dbPath)
	if err != nil {
		return fmt.Errorf("failed to open database: %w", err)
	}
	defer database.Close()

	taskStore := db.NewTaskStore(database)

	// List Tasks
	s.AddTool(mcp.NewTool("list_tasks",
		mcp.WithDescription("List tasks for a project"),
		mcp.WithNumber("projectId", mcp.Required(), mcp.Description("The ID of the project")),
	), func(ctx context.Context, request mcp.CallToolRequest) (*mcp.CallToolResult, error) {
		args := request.Params.Arguments.(map[string]any)
		pID := int64(args["projectId"].(float64))
		tasks, err := taskStore.ListByProject(types.ProjectID(pID))
		if err != nil {
			return mcp.NewToolResultError(err.Error()), nil
		}

		if len(tasks) == 0 {
			return mcp.NewToolResultText("No tasks found for this project."), nil
		}

		var result string
		for _, t := range tasks {
			result += fmt.Sprintf("ID: %d, Name: %s, Status: %s, Type: %s\n", t.ID, t.Name, t.Status, t.Type)
		}

		return mcp.NewToolResultText(result), nil
	})

	// Show Task
	s.AddTool(mcp.NewTool("show_task",
		mcp.WithDescription("Show detailed information for a task"),
		mcp.WithNumber("taskId", mcp.Required(), mcp.Description("The ID of the task")),
	), func(ctx context.Context, request mcp.CallToolRequest) (*mcp.CallToolResult, error) {
		args := request.Params.Arguments.(map[string]any)
		tID := int64(args["taskId"].(float64))
		t, err := taskStore.Get(types.TaskID(tID))
		if err != nil {
			return mcp.NewToolResultError(err.Error()), nil
		}

		result := fmt.Sprintf("ID: %d\nProject ID: %d\nName: %s\nDescription: %s\nType: %s\nStatus: %s\nCreated At: %s\nUpdated At: %s\n",
			t.ID, t.ProjectID, t.Name, t.Description, t.Type, t.Status, t.CreatedAt, t.UpdatedAt)

		return mcp.NewToolResultText(result), nil
	})

	// Add Task
	s.AddTool(mcp.NewTool("add_task",
		mcp.WithDescription("Add a new task to a project"),
		mcp.WithNumber("projectId", mcp.Required(), mcp.Description("The ID of the project")),
		mcp.WithString("name", mcp.Required(), mcp.Description("The name of the task")),
		mcp.WithString("description", mcp.Description("The description of the task")),
		mcp.WithString("type", mcp.Description("The type of the task (feat, fix, bug, docs, refactor, chore)")),
		mcp.WithString("status", mcp.Description("The status of the task (notStarted, inProgress, blocked, completed, closed)")),
	), func(ctx context.Context, request mcp.CallToolRequest) (*mcp.CallToolResult, error) {
		args := request.Params.Arguments.(map[string]any)
		pID := int64(args["projectId"].(float64))
		name := args["name"].(string)
		desc, _ := args["description"].(string)
		tTypeStr, _ := args["type"].(string)
		statusStr, _ := args["status"].(string)

		t, err := taskStore.Create(types.ProjectID(pID), name, desc, types.TaskType(tTypeStr), types.TaskStatus(statusStr))
		if err != nil {
			return mcp.NewToolResultError(err.Error()), nil
		}

		return mcp.NewToolResultText(fmt.Sprintf("Task created: %d - %s", t.ID, t.Name)), nil
	})

	// Update Task
	s.AddTool(mcp.NewTool("update_task",
		mcp.WithDescription("Update an existing task"),
		mcp.WithNumber("taskId", mcp.Required(), mcp.Description("The ID of the task")),
		mcp.WithString("name", mcp.Description("The new name of the task")),
		mcp.WithString("description", mcp.Description("The new description of the task")),
		mcp.WithString("type", mcp.Description("The new type of the task")),
		mcp.WithString("status", mcp.Description("The new status of the task")),
	), func(ctx context.Context, request mcp.CallToolRequest) (*mcp.CallToolResult, error) {
		args := request.Params.Arguments.(map[string]any)
		tID := int64(args["taskId"].(float64))
		current, err := taskStore.Get(types.TaskID(tID))
		if err != nil {
			return mcp.NewToolResultError(err.Error()), nil
		}

		name := current.Name
		if val, ok := args["name"].(string); ok {
			name = val
		}
		desc := current.Description
		if val, ok := args["description"].(string); ok {
			desc = val
		}
		tType := current.Type
		if val, ok := args["type"].(string); ok {
			tType = types.TaskType(val)
		}
		status := current.Status
		if val, ok := args["status"].(string); ok {
			status = types.TaskStatus(val)
		}

		_, err = taskStore.Update(types.TaskID(tID), name, desc, tType, status)
		if err != nil {
			return mcp.NewToolResultError(err.Error()), nil
		}

		return mcp.NewToolResultText(fmt.Sprintf("Task %d updated.", tID)), nil
	})

	// Remove Task
	s.AddTool(mcp.NewTool("remove_task",
		mcp.WithDescription("Remove a task"),
		mcp.WithNumber("taskId", mcp.Required(), mcp.Description("The ID of the task to remove")),
	), func(ctx context.Context, request mcp.CallToolRequest) (*mcp.CallToolResult, error) {
		args := request.Params.Arguments.(map[string]any)
		tID := int64(args["taskId"].(float64))
		err := taskStore.Delete(types.TaskID(tID))
		if err != nil {
			return mcp.NewToolResultError(err.Error()), nil
		}

		return mcp.NewToolResultText(fmt.Sprintf("Task %d removed.", tID)), nil
	})

	return server.ServeStdio(s)
}
