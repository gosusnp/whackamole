// Copyright 2026 Jimmy Ma
// SPDX-License-Identifier: MIT

package cli

import (
	"bytes"
	"os"
	"testing"

	"github.com/spf13/viper"
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

	// Save original database and restore after
	oldDbPath := getDBPath(rootCmd)
	viper.Set("database", testDbPath)
	defer func() {
		viper.Set("database", oldDbPath)
	}()

	// Need a project first
	{
		b := bytes.NewBufferString("")
		rootCmd.SetOut(b)
		rootCmd.SetErr(b)
		rootCmd.SetArgs([]string{"project", "add", "Test Project", "-k", "p1"})
		err := rootCmd.Execute()
		require.NoError(t, err)
	}

	setup := func() {
		viper.Reset()
		viper.Set("database", testDbPath)
		_ = rootCmd.PersistentFlags().Set("project", "")
		rootCmd.PersistentFlags().Lookup("project").Changed = false
		// Note: We need to re-initialize config/bindings because viper.Reset() cleared them
		initConfig()
	}

	t.Run("Add", func(t *testing.T) {
		setup()
		b := bytes.NewBufferString("")
		rootCmd.SetOut(b)
		rootCmd.SetErr(b)
		rootCmd.SetArgs([]string{"task", "add", "Test Task", "--project", "p1", "--desc", "My Task"})

		err := rootCmd.Execute()
		assert.NoError(t, err)
		assert.Contains(t, b.String(), "Task created")
		assert.Contains(t, b.String(), "Test Task")
	})

	t.Run("List", func(t *testing.T) {
		setup()
		b := bytes.NewBufferString("")
		rootCmd.SetOut(b)
		rootCmd.SetErr(b)
		rootCmd.SetArgs([]string{"task", "list", "-p", "p1"})

		err := rootCmd.Execute()
		assert.NoError(t, err)
		assert.Contains(t, b.String(), "Test Task")
	})

	t.Run("Show", func(t *testing.T) {
		setup()
		b := bytes.NewBufferString("")
		rootCmd.SetOut(b)
		rootCmd.SetErr(b)
		rootCmd.SetArgs([]string{"task", "show", "1", "-p", "p1"})

		err := rootCmd.Execute()
		assert.NoError(t, err)
		assert.Contains(t, b.String(), "ID:")
		assert.Contains(t, b.String(), "Name:")
		assert.Contains(t, b.String(), "Test Task")
	})

	t.Run("Update", func(t *testing.T) {
		setup()
		b := bytes.NewBufferString("")
		rootCmd.SetOut(b)
		rootCmd.SetErr(b)
		rootCmd.SetArgs([]string{"task", "update", "1", "-p", "p1", "--status", "inProgress"})

		err := rootCmd.Execute()
		assert.NoError(t, err)
		assert.Contains(t, b.String(), "Task 1 updated")
	})

	t.Run("Rm", func(t *testing.T) {
		setup()
		b := bytes.NewBufferString("")
		rootCmd.SetOut(b)
		rootCmd.SetErr(b)
		rootCmd.SetArgs([]string{"task", "rm", "1", "-p", "p1"})

		err := rootCmd.Execute()
		assert.NoError(t, err)
		assert.Contains(t, b.String(), "Task 1 removed")
	})

	t.Run("ListMissingProject", func(t *testing.T) {
		setup()
		b := bytes.NewBufferString("")
		rootCmd.SetOut(b)
		rootCmd.SetErr(b)
		rootCmd.SetArgs([]string{"task", "list"})

		err := rootCmd.Execute()
		if assert.Error(t, err) {
			assert.Contains(t, err.Error(), "project key is required")
		}
	})

	t.Run("ListEmptyProject", func(t *testing.T) {
		setup()
		// Re-add p1 if it was removed
		{
			rootCmd.SetArgs([]string{"project", "add", "Test Project", "-k", "p1"})
			_ = rootCmd.Execute()
		}

		b := bytes.NewBufferString("")
		rootCmd.SetOut(b)
		rootCmd.SetErr(b)
		rootCmd.SetArgs([]string{"task", "list", "--project", "p1"})

		err := rootCmd.Execute()
		assert.NoError(t, err)
		assert.Contains(t, b.String(), "No tasks found for project Test Project.")
	})

	t.Run("ListEmpty", func(t *testing.T) {
		setup()
		b := bytes.NewBufferString("")
		rootCmd.SetOut(b)
		rootCmd.SetErr(b)
		rootCmd.SetArgs([]string{"task", "list", "--project", "nonexistent"})

		err := rootCmd.Execute()
		assert.Error(t, err)
		assert.Contains(t, err.Error(), "project not found with key: nonexistent")
	})

	t.Run("UseConfigProject", func(t *testing.T) {
		setup()
		viper.Set("project", "p1")
		// Re-add p1 since it was deleted in Rm test
		{
			rootCmd.SetArgs([]string{"project", "add", "Test Project", "-k", "p1"})
			_ = rootCmd.Execute()
		}

		b := bytes.NewBufferString("")
		rootCmd.SetOut(b)
		rootCmd.SetErr(b)
		rootCmd.SetArgs([]string{"task", "add", "Task with config project"})

		err := rootCmd.Execute()
		assert.NoError(t, err)
		assert.Contains(t, b.String(), "Task created")
	})
}
