// Copyright 2026 Jimmy Ma
// SPDX-License-Identifier: MIT

package cli

import (
	"bytes"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestConfigCmd(t *testing.T) {
	// Save the original dbPath and restore it after the test
	originalDbPath := dbPath
	defer func() { dbPath = originalDbPath }()

	dbPath = "test-db.db"

	b := bytes.NewBufferString("")
	rootCmd.SetOut(b)
	rootCmd.SetArgs([]string{"config"})

	err := rootCmd.Execute()
	assert.NoError(t, err)

	expected := "database: test-db.db\n"
	assert.Equal(t, expected, b.String())
}
