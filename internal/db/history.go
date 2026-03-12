// Copyright 2026 Jimmy Ma
// SPDX-License-Identifier: MIT

package db

import (
	"database/sql"
	"fmt"
	"time"

	"github.com/gosusnp/whackamole/internal/types"
)

type HistoryStore struct {
	db *sql.DB
}

func NewHistoryStore(db *sql.DB) *HistoryStore {
	return &HistoryStore{db: db}
}

// AddUpdate inserts a new event record and performs a passive cleanup of records older than 7 days.
func (s *HistoryStore) AddUpdate(objectType string, objectID int64, operation string) (*types.History, error) {
	if objectType == "" || operation == "" {
		return nil, fmt.Errorf("object type and operation cannot be empty")
	}

	// Passive cleanup
	defer s.cleanup()

	query := "INSERT INTO whack_history (object_type, object_id, operation) VALUES (?, ?, ?)"
	res, err := s.db.Exec(query, objectType, objectID, operation)
	if err != nil {
		return nil, fmt.Errorf("failed to add history update: %w", err)
	}

	id, err := res.LastInsertId()
	if err != nil {
		return nil, fmt.Errorf("failed to get last insert id: %w", err)
	}

	return s.Get(types.HistoryID(id))
}

// GetUpdates fetches all records where created_at > since and performs a passive cleanup.
func (s *HistoryStore) GetUpdates(since time.Time) ([]types.History, error) {
	// Passive cleanup
	defer s.cleanup()

	query := "SELECT id, created_at, object_type, object_id, operation FROM whack_history WHERE created_at > ? ORDER BY created_at ASC"
	rows, err := s.db.Query(query, since)
	if err != nil {
		return nil, fmt.Errorf("failed to get history updates: %w", err)
	}
	defer rows.Close()

	var updates []types.History
	for rows.Next() {
		var h types.History
		if err := rows.Scan(&h.ID, &h.CreatedAt, &h.ObjectType, &h.ObjectID, &h.Operation); err != nil {
			return nil, fmt.Errorf("failed to scan history update: %w", err)
		}
		updates = append(updates, h)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("error during row iteration: %w", err)
	}

	return updates, nil
}

func (s *HistoryStore) Get(id types.HistoryID) (*types.History, error) {
	var h types.History
	err := s.db.QueryRow("SELECT id, created_at, object_type, object_id, operation FROM whack_history WHERE id = ?", id).
		Scan(&h.ID, &h.CreatedAt, &h.ObjectType, &h.ObjectID, &h.Operation)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("history event not found with ID: %d", id)
		}
		return nil, fmt.Errorf("failed to get history event: %w", err)
	}
	return &h, nil
}

func (s *HistoryStore) cleanup() {
	_, _ = s.db.Exec("DELETE FROM whack_history WHERE created_at < datetime('now', '-7 days');")
}
