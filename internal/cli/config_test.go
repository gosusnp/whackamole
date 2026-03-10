// Copyright 2026 Jimmy Ma
// SPDX-License-Identifier: MIT

package cli

import (
	"bytes"
	"os"
	"testing"

	"github.com/spf13/viper"
	"github.com/stretchr/testify/assert"
)

func TestConfigCmd(t *testing.T) {
	// Reset viper for this test
	viper.Reset()
	viper.Set("database", "test-db.db")
	viper.Set("project", "test-project")

	b := bytes.NewBufferString("")
	rootCmd.SetOut(b)
	rootCmd.SetArgs([]string{"config", "show"})

	err := rootCmd.Execute()
	assert.NoError(t, err)

	expected := "database: test-db.db\nproject: test-project\n"
	assert.Equal(t, expected, b.String())
}

func TestConfigSetLocalCmd(t *testing.T) {
	// Clean up any existing .whackamole.yaml
	os.Remove(".whackamole.yaml")
	defer os.Remove(".whackamole.yaml")

	b := bytes.NewBufferString("")
	rootCmd.SetOut(b)
	rootCmd.SetArgs([]string{"config", "set-local", "project", "my-project"})

	err := rootCmd.Execute()
	assert.NoError(t, err)

	assert.Contains(t, b.String(), "Updated local config: project = my-project")

	// Verify file content
	data, err := os.ReadFile(".whackamole.yaml")
	assert.NoError(t, err)
	assert.Contains(t, string(data), "project: my-project")
}

func TestConfigGlobalCmd(t *testing.T) {
	// Create a temporary database for the test
	tmpFile, err := os.CreateTemp("", "whack_config_cli_test_*.db")
	assert.NoError(t, err)
	dbPath := tmpFile.Name()
	tmpFile.Close()
	defer os.Remove(dbPath)

	// Set the database path in viper
	viper.Reset()
	viper.Set("database", dbPath)

	// Test config set
	b := bytes.NewBufferString("")
	rootCmd.SetOut(b)
	rootCmd.SetArgs([]string{"config", "set", "mcp_instructions", "Be helpful"})
	err = rootCmd.Execute()
	assert.NoError(t, err)
	assert.Contains(t, b.String(), "Config 'mcp_instructions' set successfully.")

	// Test config list
	b.Reset()
	rootCmd.SetArgs([]string{"config", "list"})
	err = rootCmd.Execute()
	assert.NoError(t, err)
	assert.Contains(t, b.String(), "mcp_instructions: Be helpful")
}
