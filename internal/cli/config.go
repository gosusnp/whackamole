// Copyright 2026 Jimmy Ma
// SPDX-License-Identifier: MIT

package cli

import (
	"github.com/spf13/cobra"
)

// configCmd represents the config command
var configCmd = &cobra.Command{
	Use:   "config",
	Short: "Print the configuration",
	Long:  `Print the configuration whack is using.`,
	Run: func(cmd *cobra.Command, args []string) {
		cmd.Printf("database: %s\n", dbPath)
	},
}

func init() {
	rootCmd.AddCommand(configCmd)
}
