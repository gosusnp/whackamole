// Copyright 2026 Jimmy Ma
// SPDX-License-Identifier: MIT

package db

import (
	"os"
	"path/filepath"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestOpenCreatesDirectory(t *testing.T) {
	tmpDir, err := os.MkdirTemp("", "whack_test_dir_*")
	if err != nil {
		t.Fatalf("failed to create temp dir: %v", err)
	}
	defer os.RemoveAll(tmpDir)

	dbPath := filepath.Join(tmpDir, "subdir", "test.db")

	// Ensure subdir does not exist
	_, err = os.Stat(filepath.Dir(dbPath))
	assert.True(t, os.IsNotExist(err))

	db, err := Open(dbPath)
	assert.NoError(t, err)
	assert.NotNil(t, db)
	defer db.Close()

	// Check if directory was created
	info, err := os.Stat(filepath.Dir(dbPath))
	assert.NoError(t, err)
	assert.True(t, info.IsDir())

	// Check if file was created
	_, err = os.Stat(dbPath)
	assert.NoError(t, err)
}

func TestOpenSetsWALMode(t *testing.T) {
	tmpDir, err := os.MkdirTemp("", "whack_wal_test_*")
	if err != nil {
		t.Fatalf("failed to create temp dir: %v", err)
	}
	defer os.RemoveAll(tmpDir)

	dbPath := filepath.Join(tmpDir, "test.db")

	db, err := Open(dbPath)
	assert.NoError(t, err)
	defer db.Close()

	var journalMode string
	err = db.QueryRow("PRAGMA journal_mode;").Scan(&journalMode)
	assert.NoError(t, err)
	assert.Equal(t, "wal", journalMode)

	var synchronous int
	err = db.QueryRow("PRAGMA synchronous;").Scan(&synchronous)
	assert.NoError(t, err)
	assert.Equal(t, 1, synchronous) // 1 is NORMAL
}
