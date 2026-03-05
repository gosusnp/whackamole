// Copyright 2026 Jimmy Ma
// SPDX-License-Identifier: MIT

package cli

import (
	"bytes"
	"os"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestProjectCommands(t *testing.T) {
	// Setup temp DB
	tmpFile, err := os.CreateTemp("", "whack_cli_test_*.db")
	require.NoError(t, err)
	testDbPath := tmpFile.Name()
	tmpFile.Close()
	defer os.Remove(testDbPath)

	// Save original dbPath and restore after
	oldDbPath := dbPath
	dbPath = testDbPath
	defer func() { dbPath = oldDbPath }()

	t.Run("Add", func(t *testing.T) {
		b := bytes.NewBufferString("")
		rootCmd.SetOut(b)
		rootCmd.SetErr(b)
		rootCmd.SetArgs([]string{"project", "add", "Test Project", "-k", "p1"})

		err := rootCmd.Execute()
		assert.NoError(t, err)
		assert.Contains(t, b.String(), "Project created: Test Project (p1)\n")
	})

	t.Run("List", func(t *testing.T) {
		b := bytes.NewBufferString("")
		rootCmd.SetOut(b)
		rootCmd.SetErr(b)
		rootCmd.SetArgs([]string{"project", "list"})

		err := rootCmd.Execute()
		assert.NoError(t, err)
		assert.Contains(t, b.String(), "p1")
		assert.Contains(t, b.String(), "Test Project")
	})

	t.Run("Rm", func(t *testing.T) {
		b := bytes.NewBufferString("")
		rootCmd.SetOut(b)
		rootCmd.SetErr(b)
		rootCmd.SetArgs([]string{"project", "rm", "p1"})

		err := rootCmd.Execute()
		assert.NoError(t, err)
		assert.Contains(t, b.String(), "Project p1 removed")
	})

	t.Run("ListEmpty", func(t *testing.T) {
		b := bytes.NewBufferString("")
		rootCmd.SetOut(b)
		rootCmd.SetErr(b)
		rootCmd.SetArgs([]string{"project", "list"})

		err := rootCmd.Execute()
		assert.NoError(t, err)
		assert.Contains(t, b.String(), "No projects found")
	})
}
