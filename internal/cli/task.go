// Copyright 2026 Jimmy Ma
// SPDX-License-Identifier: MIT

package cli

import (
	"fmt"
	"strconv"
	"text/tabwriter"

	"github.com/gosusnp/whackamole/internal/db"
	"github.com/gosusnp/whackamole/internal/types"
	"github.com/spf13/cobra"
)

var taskCmd = &cobra.Command{
	Use:     "task",
	Aliases: []string{"t"},
	Short:   "Manage tasks",
}

var (
	taskDesc   string
	taskType   string
	taskStatus string
)

var taskAddCmd = &cobra.Command{
	Use:   "add <name>",
	Short: "Add a new task",
	Args:  cobra.ExactArgs(1),
	RunE: func(cmd *cobra.Command, args []string) error {
		projectKey := getProjectKey(cmd)
		if projectKey == "" {
			return fmt.Errorf("project key is required (use --project or set it in config)")
		}

		database, err := db.Open(getDBPath(cmd))
		if err != nil {
			return err
		}
		defer database.Close()

		pStore := db.NewProjectStore(database)
		p, err := pStore.GetByKey(types.ProjectKey(projectKey))
		if err != nil {
			return err
		}

		store := db.NewTaskStore(database)
		t, err := store.Create(p.ID, args[0], taskDesc, types.TaskType(taskType), types.TaskStatus(taskStatus))
		if err != nil {
			return err
		}

		fmt.Fprintf(cmd.OutOrStdout(), "Task created: %d - %s\n", t.ID, t.Name)
		return nil
	},
}

var taskListCmd = &cobra.Command{
	Use:   "list",
	Short: "List tasks for a project",
	Args:  cobra.NoArgs,
	RunE: func(cmd *cobra.Command, args []string) error {
		projectKey := getProjectKey(cmd)
		if projectKey == "" {
			return fmt.Errorf("project key is required (use --project or set it in config)")
		}

		database, err := db.Open(getDBPath(cmd))
		if err != nil {
			return err
		}
		defer database.Close()

		pStore := db.NewProjectStore(database)
		p, err := pStore.GetByKey(types.ProjectKey(projectKey))
		if err != nil {
			return err
		}

		store := db.NewTaskStore(database)
		tasks, err := store.ListByProject(p.ID)
		if err != nil {
			return err
		}

		if len(tasks) == 0 {
			fmt.Fprintf(cmd.OutOrStdout(), "No tasks found for project %s.\n", p.Name)
			return nil
		}

		w := tabwriter.NewWriter(cmd.OutOrStdout(), 0, 0, 2, ' ', 0)
		fmt.Fprintln(w, "ID\tNAME\tTYPE\tSTATUS\tCREATED AT")
		for _, t := range tasks {
			fmt.Fprintf(w, "%d\t%s\t%s\t%s\t%s\n", t.ID, t.Name, t.Type, t.Status, t.CreatedAt.Format("2006-01-02 15:04:05"))
		}
		w.Flush()
		return nil
	},
}

var taskRmCmd = &cobra.Command{
	Use:   "rm <id>",
	Short: "Remove a task",
	Args:  cobra.ExactArgs(1),
	RunE: func(cmd *cobra.Command, args []string) error {
		id, err := strconv.ParseInt(args[0], 10, 64)
		if err != nil {
			return fmt.Errorf("invalid task id: %s", args[0])
		}

		database, err := db.Open(getDBPath(cmd))
		if err != nil {
			return err
		}
		defer database.Close()

		store := db.NewTaskStore(database)
		err = store.Delete(types.TaskID(id))
		if err != nil {
			return err
		}

		fmt.Fprintf(cmd.OutOrStdout(), "Task %d removed.\n", id)
		return nil
	},
}

var taskUpdateCmd = &cobra.Command{
	Use:   "update <id>",
	Short: "Update a task",
	Args:  cobra.ExactArgs(1),
	RunE: func(cmd *cobra.Command, args []string) error {
		id, err := strconv.ParseInt(args[0], 10, 64)
		if err != nil {
			return fmt.Errorf("invalid task id: %s", args[0])
		}

		database, err := db.Open(getDBPath(cmd))
		if err != nil {
			return err
		}
		defer database.Close()

		store := db.NewTaskStore(database)

		current, err := store.Get(types.TaskID(id))
		if err != nil {
			return err
		}

		name := current.Name
		if cmd.Flags().Changed("name") {
			name, _ = cmd.Flags().GetString("name")
		}

		desc := current.Description
		if cmd.Flags().Changed("desc") {
			desc, _ = cmd.Flags().GetString("desc")
		}

		tType := current.Type
		if cmd.Flags().Changed("type") {
			tTypeStr, _ := cmd.Flags().GetString("type")
			tType = types.TaskType(tTypeStr)
		}

		status := current.Status
		if cmd.Flags().Changed("status") {
			statusStr, _ := cmd.Flags().GetString("status")
			status = types.TaskStatus(statusStr)
		}

		_, err = store.Update(types.TaskID(id), name, desc, tType, status)
		if err != nil {
			return err
		}

		fmt.Fprintf(cmd.OutOrStdout(), "Task %d updated.\n", id)
		return nil
	},
}

var taskShowCmd = &cobra.Command{
	Use:   "show <id>",
	Short: "Show task details",
	Args:  cobra.ExactArgs(1),
	RunE: func(cmd *cobra.Command, args []string) error {
		id, err := strconv.ParseInt(args[0], 10, 64)
		if err != nil {
			return fmt.Errorf("invalid task id: %s", args[0])
		}

		database, err := db.Open(getDBPath(cmd))
		if err != nil {
			return err
		}
		defer database.Close()

		store := db.NewTaskStore(database)
		t, err := store.Get(types.TaskID(id))
		if err != nil {
			return err
		}

		w := tabwriter.NewWriter(cmd.OutOrStdout(), 0, 0, 2, ' ', 0)
		fmt.Fprintf(w, "ID:\t%d\n", t.ID)
		fmt.Fprintf(w, "Project ID:\t%d\n", t.ProjectID)
		fmt.Fprintf(w, "Name:\t%s\n", t.Name)
		fmt.Fprintf(w, "Description:\t%s\n", t.Description)
		fmt.Fprintf(w, "Type:\t%s\n", t.Type)
		fmt.Fprintf(w, "Status:\t%s\n", t.Status)
		fmt.Fprintf(w, "Created At:\t%s\n", t.CreatedAt.Format("2006-01-02 15:04:05"))
		fmt.Fprintf(w, "Updated At:\t%s\n", t.UpdatedAt.Format("2006-01-02 15:04:05"))
		w.Flush()
		return nil
	},
}

func init() {
	rootCmd.AddCommand(taskCmd)
	taskCmd.AddCommand(taskAddCmd)
	taskCmd.AddCommand(taskListCmd)
	taskCmd.AddCommand(taskRmCmd)
	taskCmd.AddCommand(taskUpdateCmd)
	taskCmd.AddCommand(taskShowCmd)

	taskAddCmd.Flags().StringVarP(&taskDesc, "desc", "d", "", "Task description")
	taskAddCmd.Flags().StringVarP(&taskType, "type", "t", string(types.TaskTypeFeat), "Task type (feat, fix, bug, docs, refactor, chore)")
	taskAddCmd.Flags().StringVarP(&taskStatus, "status", "s", string(types.TaskStatusNotStarted), "Task status (notStarted, inProgress, blocked, completed, closed)")

	taskUpdateCmd.Flags().StringP("name", "n", "", "Task name")
	taskUpdateCmd.Flags().StringP("desc", "d", "", "Task description")
	taskUpdateCmd.Flags().StringP("type", "t", "", "Task type")
	taskUpdateCmd.Flags().StringP("status", "s", "", "Task status")
}
