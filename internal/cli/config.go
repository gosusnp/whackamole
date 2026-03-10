// Copyright 2026 Jimmy Ma
// SPDX-License-Identifier: MIT

package cli

import (
	"fmt"
	"os"

	"github.com/gosusnp/whackamole/internal/db"
	"github.com/gosusnp/whackamole/internal/types"
	"github.com/spf13/cobra"
	"github.com/spf13/viper"
)

var configCmd = &cobra.Command{
	Use:   "config",
	Short: "Manage configuration",
	Long:  `Manage whack configuration, both local CLI settings and global database settings.`,
}

var configShowCmd = &cobra.Command{
	Use:   "show",
	Short: "Print the CLI configuration",
	Long:  `Print the CLI configuration whack is using (database path, default project).`,
	Run: func(cmd *cobra.Command, args []string) {
		fmt.Fprintf(cmd.OutOrStdout(), "database: %s\n", viper.GetString("database"))
		fmt.Fprintf(cmd.OutOrStdout(), "project: %s\n", viper.GetString("project"))
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

var configSetCmd = &cobra.Command{
	Use:   "set <key> <value>",
	Short: "Set a global database configuration value",
	Args:  cobra.ExactArgs(2),
	RunE: func(cmd *cobra.Command, args []string) error {
		key := args[0]
		value := args[1]

		database, err := db.Open(getDBPath(cmd))
		if err != nil {
			return err
		}

		store := db.NewConfigStore(database)
		err = store.UpdateConfig(types.GlobalConfigKey(key), value)
		if err != nil {
			return err
		}

		fmt.Fprintf(cmd.OutOrStdout(), "Config '%s' set successfully.\n", key)
		return nil
	},
}

var configListCmd = &cobra.Command{
	Use:   "list",
	Short: "List all global database configurations",
	RunE: func(cmd *cobra.Command, args []string) error {
		database, err := db.Open(getDBPath(cmd))
		if err != nil {
			return err
		}

		store := db.NewConfigStore(database)
		configs, err := store.GetConfigs()
		if err != nil {
			return err
		}

		if len(configs) == 0 {
			fmt.Fprintln(cmd.OutOrStdout(), "No configurations found.")
			return nil
		}

		for _, c := range configs {
			fmt.Fprintf(cmd.OutOrStdout(), "%s: %s\n", c.Key, c.Value)
		}
		return nil
	},
}

func init() {
	configCmd.AddCommand(configShowCmd)
	configCmd.AddCommand(configSetLocalCmd)
	configCmd.AddCommand(configSetCmd)
	configCmd.AddCommand(configListCmd)
	rootCmd.AddCommand(configCmd)
}
