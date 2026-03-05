// Copyright 2026 Jimmy Ma
// SPDX-License-Identifier: MIT

package cli

import (
	"os"
	"path/filepath"

	"github.com/spf13/cobra"
)

var dbPath string

// rootCmd represents the base command when called without any subcommands
var rootCmd = &cobra.Command{
	Use:   "whack",
	Short: "A small task manager for assisting agent coding",
	Long: `whackAmole is a small task manager for assisting agent coding.
The CLI tool, 'whack', helps manage and track tasks effectively during development sessions.`,
}

// Execute adds all child commands to the root command and sets flags appropriately.
// This is called by main.main(). It only needs to happen once to the rootCmd.
func Execute() {
	err := rootCmd.Execute()
	if err != nil {
		os.Exit(1)
	}
}

func init() {
	home, err := os.UserHomeDir()
	defaultDBPath := "whackamole.db"
	if err == nil {
		defaultDBPath = filepath.Join(home, ".local", "share", "whackamole", "whackamole.db")
	}

	rootCmd.PersistentFlags().StringVar(&dbPath, "db", defaultDBPath, "path to the sqlite database")

	// Cobra also supports local flags, which will only run
	// when this action is called directly.
	rootCmd.Flags().BoolP("toggle", "t", false, "Help message for toggle")
}
