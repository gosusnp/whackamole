// Copyright 2026 Jimmy Ma
// SPDX-License-Identifier: MIT

package cli

import (
	"os"
	"path/filepath"

	"github.com/spf13/cobra"
	"github.com/spf13/viper"
)

var cfgFile string

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
	cobra.OnInitialize(initConfig)

	home, err := os.UserHomeDir()
	defaultDBPath := "whackamole.db"
	if err == nil {
		defaultDBPath = filepath.Join(home, ".local", "share", "whackamole", "whackamole.db")
	}

	rootCmd.PersistentFlags().StringVar(&cfgFile, "config", "", "config file (default is ~/.whackamole.yaml and then ./.whackamole.yaml)")
	rootCmd.PersistentFlags().String("database", defaultDBPath, "path to the sqlite database")
	rootCmd.PersistentFlags().StringP("project", "p", "", "default project key")
}

// initConfig reads in config file and ENV variables if set.
func initConfig() {
	_ = viper.BindPFlag("database", rootCmd.PersistentFlags().Lookup("database"))
	_ = viper.BindPFlag("project", rootCmd.PersistentFlags().Lookup("project"))

	if cfgFile != "" {
		// Use config file from the flag.
		viper.SetConfigFile(cfgFile)
		_ = viper.ReadInConfig()
	} else {
		// Priority: ~/.whackamole.yaml < ./.whackamole.yaml
		home, err := os.UserHomeDir()
		if err == nil {
			homeConfig := filepath.Join(home, ".whackamole.yaml")
			if _, err := os.Stat(homeConfig); err == nil {
				viper.SetConfigFile(homeConfig)
				_ = viper.ReadInConfig()
			}
		}

		localConfig := ".whackamole.yaml"
		if _, err := os.Stat(localConfig); err == nil {
			viper.SetConfigFile(localConfig)
			if viper.ConfigFileUsed() != "" {
				_ = viper.MergeInConfig()
			} else {
				_ = viper.ReadInConfig()
			}
		}
	}

	viper.AutomaticEnv() // read in environment variables that match
}

func getDBPath(cmd *cobra.Command) string {
	if cmd.Flags().Changed("database") {
		val, _ := cmd.Flags().GetString("database")
		return val
	}
	return viper.GetString("database")
}

func getProjectKey(cmd *cobra.Command) string {
	if cmd.Flags().Changed("project") {
		val, _ := cmd.Flags().GetString("project")
		return val
	}
	return viper.GetString("project")
}
