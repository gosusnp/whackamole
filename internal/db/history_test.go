// Copyright 2026 Jimmy Ma
// SPDX-License-Identifier: MIT

package db

import (
	"database/sql"
	"os"
	"testing"
	"time"

	"github.com/stretchr/testify/suite"
)

type HistoryStoreTestSuite struct {
	suite.Suite
	dbPath       string
	db           *sql.DB
	historyStore *HistoryStore
}

func (s *HistoryStoreTestSuite) SetupTest() {
	// Create a fresh temp database for each test
	tmpFile, err := os.CreateTemp("", "whack_history_test_*.db")
	s.NoError(err)
	s.dbPath = tmpFile.Name()
	tmpFile.Close()

	database, err := Open(s.dbPath)
	s.NoError(err)
	s.db = database
	s.historyStore = NewHistoryStore(database)
}

func (s *HistoryStoreTestSuite) TearDownTest() {
	if s.db != nil {
		s.NoError(s.db.Close())
	}
	if s.dbPath != "" {
		os.Remove(s.dbPath)
	}
}

func (s *HistoryStoreTestSuite) TestAddUpdate() {
	h, err := s.historyStore.AddUpdate("project", 1, 1, "created")
	s.NoError(err)
	s.NotZero(h.ID)
	s.Equal("project", h.ObjectType)
	s.Equal(int64(1), h.ObjectID)
	s.Equal(int64(1), h.ProjectID)
	s.Equal("created", h.Operation)
	s.False(h.CreatedAt.IsZero())
}

func (s *HistoryStoreTestSuite) TestGetUpdates() {
	since := time.Now().Add(-1 * time.Minute)

	_, _ = s.historyStore.AddUpdate("project", 1, 1, "created")
	_, _ = s.historyStore.AddUpdate("task", 10, 1, "created")

	updates, err := s.historyStore.GetUpdates(since)
	s.NoError(err)
	s.Len(updates, 2)

	s.Equal("project", updates[0].ObjectType)
	s.Equal(int64(1), updates[0].ObjectID)
	s.Equal(int64(1), updates[0].ProjectID)
	s.Equal("created", updates[0].Operation)

	s.Equal("task", updates[1].ObjectType)
	s.Equal(int64(10), updates[1].ObjectID)
	s.Equal(int64(1), updates[1].ProjectID)
	s.Equal("created", updates[1].Operation)
}
func (s *HistoryStoreTestSuite) TestPassiveTTL() {
	// Manually insert an old record
	oldTime := time.Now().Add(-8 * 24 * time.Hour).Format("2006-01-02 15:04:05")
	_, err := s.db.Exec("INSERT INTO whack_history (created_at, object_type, object_id, project_id, operation) VALUES (?, ?, ?, ?, ?)",
		oldTime, "project", 99, 1, "deleted")
	s.NoError(err)

	// Verify it's there
	var count int
	err = s.db.QueryRow("SELECT COUNT(*) FROM whack_history").Scan(&count)
	s.NoError(err)
	s.Equal(1, count)

	// Trigger cleanup via AddUpdate
	_, err = s.historyStore.AddUpdate("task", 1, 1, "updated")
	s.NoError(err)

	// Verify old record is gone
	err = s.db.QueryRow("SELECT COUNT(*) FROM whack_history WHERE object_id = 99").Scan(&count)
	s.NoError(err)
	s.Equal(0, count)
}

func TestHistoryStoreSuite(t *testing.T) {
	suite.Run(t, new(HistoryStoreTestSuite))
}
