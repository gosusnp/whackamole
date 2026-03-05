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

func TestTaskCommands(t *testing.T) {
	// Setup temp DB
	tmpFile, err := os.CreateTemp("", "whack_task_cli_test_*.db")
	require.NoError(t, err)
	testDbPath := tmpFile.Name()
	tmpFile.Close()
	defer os.Remove(testDbPath)

	// Save original dbPath and restore after
	oldDbPath := dbPath
	dbPath = testDbPath
	defer func() { dbPath = oldDbPath }()

	// Need a project first
	{
		b := bytes.NewBufferString("")
		rootCmd.SetOut(b)
		rootCmd.SetErr(b)
		rootCmd.SetArgs([]string{"project", "add", "Test Project"})
		err := rootCmd.Execute()
		require.NoError(t, err)
	}

	t.Run("Add", func(t *testing.T) {
		taskProjectID = 0
		taskCmd.PersistentFlags().Lookup("project").Changed = false
		b := bytes.NewBufferString("")
		rootCmd.SetOut(b)
		rootCmd.SetErr(b)
		rootCmd.SetArgs([]string{"task", "add", "Test Task", "--project", "1", "--desc", "My Task"})

		err := rootCmd.Execute()
		assert.NoError(t, err)
		assert.Contains(t, b.String(), "Task created")
		assert.Contains(t, b.String(), "Test Task")
	})

	t.Run("List", func(t *testing.T) {
		taskProjectID = 0
		taskCmd.PersistentFlags().Lookup("project").Changed = false
		b := bytes.NewBufferString("")
		rootCmd.SetOut(b)
		rootCmd.SetErr(b)
		rootCmd.SetArgs([]string{"task", "list", "-p", "1"})

		err := rootCmd.Execute()
		assert.NoError(t, err)
		assert.Contains(t, b.String(), "Test Task")
	})

	t.Run("Show", func(t *testing.T) {
		taskProjectID = 0
		taskCmd.PersistentFlags().Lookup("project").Changed = false
		b := bytes.NewBufferString("")
		rootCmd.SetOut(b)
		rootCmd.SetErr(b)
		rootCmd.SetArgs([]string{"task", "show", "1", "-p", "1"})

		err := rootCmd.Execute()
		assert.NoError(t, err)
		assert.Contains(t, b.String(), "ID:")
		assert.Contains(t, b.String(), "Name:")
		assert.Contains(t, b.String(), "Test Task")
	})

	t.Run("Update", func(t *testing.T) {
		taskProjectID = 0
		taskCmd.PersistentFlags().Lookup("project").Changed = false
		b := bytes.NewBufferString("")
		rootCmd.SetOut(b)
		rootCmd.SetErr(b)
		rootCmd.SetArgs([]string{"task", "update", "1", "-p", "1", "--status", "inProgress"})

		err := rootCmd.Execute()
		assert.NoError(t, err)
		assert.Contains(t, b.String(), "Task 1 updated")
	})

	t.Run("Rm", func(t *testing.T) {
		taskProjectID = 0
		taskCmd.PersistentFlags().Lookup("project").Changed = false
		b := bytes.NewBufferString("")
		rootCmd.SetOut(b)
		rootCmd.SetErr(b)
		rootCmd.SetArgs([]string{"task", "rm", "1", "-p", "1"})

		err := rootCmd.Execute()
		assert.NoError(t, err)
		assert.Contains(t, b.String(), "Task 1 removed")
	})

	t.Run("ListMissingProject", func(t *testing.T) {
		taskProjectID = 0
		taskCmd.PersistentFlags().Lookup("project").Changed = false
		b := bytes.NewBufferString("")
		rootCmd.SetOut(b)
		rootCmd.SetErr(b)
		rootCmd.SetArgs([]string{"task", "list"})

		err := rootCmd.Execute()
		if assert.Error(t, err) {
			assert.Contains(t, err.Error(), "required flag(s) \"project\" not set")
		}
	})

	t.Run("ListEmpty", func(t *testing.T) {
		taskProjectID = 0
		taskCmd.PersistentFlags().Lookup("project").Changed = false
		b := bytes.NewBufferString("")
		rootCmd.SetOut(b)
		rootCmd.SetErr(b)
		rootCmd.SetArgs([]string{"task", "list", "--project", "999"})

		err := rootCmd.Execute()
		assert.NoError(t, err)
		assert.Contains(t, b.String(), "No tasks found")
	})
}
