// Copyright 2026 Jimmy Ma
// SPDX-License-Identifier: MIT

package cli

import (
	"fmt"

	"github.com/gosusnp/whackamole/internal"
	"github.com/spf13/cobra"
)

// versionCmd represents the version command
var versionCmd = &cobra.Command{
	Use:   "version",
	Short: "Print the version number of whack",
	Long:  `All software has versions. This is whack's.`,
	Run: func(cmd *cobra.Command, args []string) {
		cmd.Printf("whack version %s (%s)\n", internal.Version, internal.Commit)
	},
}

func init() {
	rootCmd.AddCommand(versionCmd)
	rootCmd.Version = fmt.Sprintf("%s (%s)", internal.Version, internal.Commit)
}
