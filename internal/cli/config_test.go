// Copyright 2026 Jimmy Ma
// SPDX-License-Identifier: MIT

package cli

import (
	"bytes"
	"os"
	"strings"
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

func TestConfigWriteLocalMDsCmd(t *testing.T) {
	// Create a temporary database for the test
	tmpFile, err := os.CreateTemp("", "whack_config_write_md_test_*.db")
	assert.NoError(t, err)
	dbPath := tmpFile.Name()
	tmpFile.Close()
	defer os.Remove(dbPath)

	// Set the database path in viper
	viper.Reset()
	viper.Set("database", dbPath)
	viper.Set("project", "test-proj")

	// Set the template in global config
	b := bytes.NewBufferString("")
	rootCmd.SetOut(b)
	rootCmd.SetArgs([]string{"config", "set", "local_md_template", "Project is $PROJECT_KEY"})
	err = rootCmd.Execute()
	assert.NoError(t, err)

	// Run write-local-mds
	b.Reset()
	rootCmd.SetArgs([]string{"config", "write-local-mds"})
	err = rootCmd.Execute()
	assert.NoError(t, err)
	assert.Contains(t, b.String(), "Updated CLAUDE.local.md")
	assert.Contains(t, b.String(), "Updated GEMINI.local.md")

	// Clean up generated files
	defer os.Remove("CLAUDE.local.md")
	defer os.Remove("GEMINI.local.md")

	// Verify file contents
	for _, filename := range []string{"CLAUDE.local.md", "GEMINI.local.md"} {
		data, err := os.ReadFile(filename)
		assert.NoError(t, err)
		content := string(data)
		assert.Contains(t, content, "<!-- whackAmole-start -->")
		assert.Contains(t, content, "Project is test-proj")
		assert.Contains(t, content, "<!-- whackAmole-end -->")
	}

	// Test recovery from corrupted markers (start only)
	err = os.WriteFile("CLAUDE.local.md", []byte("Existing content\n<!-- whackAmole-start -->\nOld content\n"), 0644)
	assert.NoError(t, err)

	rootCmd.SetArgs([]string{"config", "write-local-mds"})
	err = rootCmd.Execute()
	assert.NoError(t, err)

	data, err := os.ReadFile("CLAUDE.local.md")
	assert.NoError(t, err)
	content := string(data)
	assert.Contains(t, content, "Existing content")
	assert.Contains(t, content, "<!-- whackAmole-start -->")
	assert.Contains(t, content, "Project is test-proj")
	assert.Contains(t, content, "<!-- whackAmole-end -->")
	// Verify it didn't duplicate the start marker or append at the very end incorrectly
	assert.Equal(t, 1, strings.Count(content, "<!-- whackAmole-start -->"))
}
