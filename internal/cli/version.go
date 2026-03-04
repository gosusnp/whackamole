// Copyright 2026 Jimmy Ma
// SPDX-License-Identifier: MIT

package cli

import (
	"github.com/gosusnp/whackamole/internal"
	"github.com/spf13/cobra"
)

// versionCmd represents the version command
var versionCmd = &cobra.Command{
	Use:   "version",
	Short: "Print the version number of whack",
	Long:  `All software has versions. This is whack's.`,
	Run: func(cmd *cobra.Command, args []string) {
		cmd.Printf("whack version %s\n", internal.Version)
	},
}

func init() {
	rootCmd.AddCommand(versionCmd)
	rootCmd.Version = internal.Version
}
