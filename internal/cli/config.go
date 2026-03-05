// Copyright 2026 Jimmy Ma
// SPDX-License-Identifier: MIT

package cli

import (
	"fmt"
	"os"

	"github.com/spf13/cobra"
	"github.com/spf13/viper"
)

// configCmd represents the config command
var configCmd = &cobra.Command{
	Use:   "config",
	Short: "Manage configuration",
	Long:  `Manage whack configuration.`,
}

// configShowCmd represents the config show command
var configShowCmd = &cobra.Command{
	Use:   "show",
	Short: "Print the configuration",
	Long:  `Print the configuration whack is using.`,
	Run: func(cmd *cobra.Command, args []string) {
		cmd.Printf("database: %s\n", viper.GetString("database"))
		cmd.Printf("project: %s\n", viper.GetString("project"))
	},
}

var configSetLocalCmd = &cobra.Command{
	Use:   "set-local <key> <value>",
	Short: "Set a local configuration value in .whackamole.yaml",
	Args:  cobra.ExactArgs(2),
	RunE: func(cmd *cobra.Command, args []string) error {
		key := args[0]
		value := args[1]

		if key != "database" && key != "project" {
			return fmt.Errorf("invalid config key: %s (must be 'database' or 'project')", key)
		}

		localViper := viper.New()
		localViper.SetConfigFile(".whackamole.yaml")
		localViper.SetConfigType("yaml")

		// Read existing local config if it exists
		if _, err := os.Stat(".whackamole.yaml"); err == nil {
			if err := localViper.ReadInConfig(); err != nil {
				return fmt.Errorf("error reading local config: %w", err)
			}
		}

		localViper.Set(key, value)

		if err := localViper.WriteConfigAs(".whackamole.yaml"); err != nil {
			return fmt.Errorf("error writing local config: %w", err)
		}

		fmt.Fprintf(cmd.OutOrStdout(), "Updated local config: %s = %s\n", key, value)
		return nil
	},
}

func init() {
	rootCmd.AddCommand(configCmd)
	configCmd.AddCommand(configShowCmd)
	configCmd.AddCommand(configSetLocalCmd)
}
