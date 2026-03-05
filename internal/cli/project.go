// Copyright 2026 Jimmy Ma
// SPDX-License-Identifier: MIT

package cli

import (
	"fmt"
	"text/tabwriter"

	"github.com/gosusnp/whackamole/internal/db"
	"github.com/gosusnp/whackamole/internal/types"
	"github.com/spf13/cobra"
)

var projectCmd = &cobra.Command{
	Use:     "project",
	Aliases: []string{"p"},
	Short:   "Manage projects",
}

var projectAddCmd = &cobra.Command{
	Use:   "add <name>",
	Short: "Add a new project",
	Args:  cobra.ExactArgs(1),
	RunE: func(cmd *cobra.Command, args []string) error {
		database, err := db.Open(dbPath)
		if err != nil {
			return err
		}
		defer database.Close()

		key, _ := cmd.Flags().GetString("key")

		store := db.NewProjectStore(database)
		p, err := store.Create(args[0], types.ProjectKey(key))
		if err != nil {
			return err
		}

		fmt.Fprintf(cmd.OutOrStdout(), "Project created: %s (%s)\n", p.Name, p.Key)
		return nil
	},
}

var projectListCmd = &cobra.Command{
	Use:   "list",
	Short: "List all projects",
	RunE: func(cmd *cobra.Command, args []string) error {
		database, err := db.Open(dbPath)
		if err != nil {
			return err
		}
		defer database.Close()

		store := db.NewProjectStore(database)
		projects, err := store.List()
		if err != nil {
			return err
		}

		if len(projects) == 0 {
			fmt.Fprintln(cmd.OutOrStdout(), "No projects found.")
			return nil
		}

		w := tabwriter.NewWriter(cmd.OutOrStdout(), 0, 0, 2, ' ', 0)
		fmt.Fprintln(w, "KEY\tNAME\tCREATED AT")
		for _, p := range projects {
			fmt.Fprintf(w, "%s\t%s\t%s\n", p.Key, p.Name, p.CreatedAt.Format("2006-01-02 15:04:05"))
		}
		w.Flush()
		return nil
	},
}

var projectRmCmd = &cobra.Command{
	Use:   "rm <key>",
	Short: "Remove a project",
	Args:  cobra.ExactArgs(1),
	RunE: func(cmd *cobra.Command, args []string) error {
		key := types.ProjectKey(args[0])

		database, err := db.Open(dbPath)
		if err != nil {
			return err
		}
		defer database.Close()

		store := db.NewProjectStore(database)
		p, err := store.GetByKey(key)
		if err != nil {
			return err
		}

		err = store.Delete(p.ID)
		if err != nil {
			return err
		}

		fmt.Fprintf(cmd.OutOrStdout(), "Project %s removed.\n", key)
		return nil
	},
}

func init() {
	rootCmd.AddCommand(projectCmd)
	projectCmd.AddCommand(projectAddCmd)
	projectCmd.AddCommand(projectListCmd)
	projectCmd.AddCommand(projectRmCmd)

	projectAddCmd.Flags().StringP("key", "k", "", "Project key (optional, will be generated if not provided)")
}
