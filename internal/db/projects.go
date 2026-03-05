// Copyright 2026 Jimmy Ma
// SPDX-License-Identifier: MIT

package db

import (
	"database/sql"
	"fmt"
	"regexp"
	"strings"

	"github.com/gosusnp/whackamole/internal/types"
)

type ProjectStore struct {
	db *sql.DB
}

func NewProjectStore(db *sql.DB) *ProjectStore {
	return &ProjectStore{db: db}
}

func (s *ProjectStore) Create(name string, key types.ProjectKey) (*types.Project, error) {
	name = strings.TrimSpace(name)
	if name == "" {
		return nil, fmt.Errorf("project name cannot be empty")
	}

	key = types.ProjectKey(strings.TrimSpace(string(key)))
	if key == "" {
		key = types.ProjectKey(slugify(name))
	}

	res, err := s.db.Exec("INSERT INTO projects (name, key) VALUES (?, ?)", name, key)
	if err != nil {
		return nil, fmt.Errorf("failed to create project: %w", err)
	}

	id, err := res.LastInsertId()
	if err != nil {
		return nil, fmt.Errorf("failed to get last insert id: %w", err)
	}

	return s.Get(types.ProjectID(id))
}

func (s *ProjectStore) Get(id types.ProjectID) (*types.Project, error) {
	var p types.Project
	err := s.db.QueryRow("SELECT id, name, key, created_at, updated_at FROM projects WHERE id = ?", id).
		Scan(&p.ID, &p.Name, &p.Key, &p.CreatedAt, &p.UpdatedAt)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("project not found with ID: %d", id)
		}
		return nil, fmt.Errorf("failed to get project: %w", err)
	}
	return &p, nil
}

func (s *ProjectStore) GetByKey(key types.ProjectKey) (*types.Project, error) {
	var p types.Project
	err := s.db.QueryRow("SELECT id, name, key, created_at, updated_at FROM projects WHERE key = ?", key).
		Scan(&p.ID, &p.Name, &p.Key, &p.CreatedAt, &p.UpdatedAt)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("project not found with key: %s", key)
		}
		return nil, fmt.Errorf("failed to get project by key: %w", err)
	}
	return &p, nil
}

func (s *ProjectStore) List() ([]types.Project, error) {
	rows, err := s.db.Query("SELECT id, name, key, created_at, updated_at FROM projects ORDER BY created_at DESC")
	if err != nil {
		return nil, fmt.Errorf("failed to list projects: %w", err)
	}
	defer rows.Close()

	var projects []types.Project
	for rows.Next() {
		var p types.Project
		if err := rows.Scan(&p.ID, &p.Name, &p.Key, &p.CreatedAt, &p.UpdatedAt); err != nil {
			return nil, fmt.Errorf("failed to scan project: %w", err)
		}
		projects = append(projects, p)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("error during row iteration: %w", err)
	}

	return projects, nil
}

func (s *ProjectStore) Update(id types.ProjectID, name string, key types.ProjectKey) (*types.Project, error) {
	name = strings.TrimSpace(name)
	if name == "" {
		return nil, fmt.Errorf("project name cannot be empty")
	}

	key = types.ProjectKey(strings.TrimSpace(string(key)))
	if key == "" {
		return nil, fmt.Errorf("project key cannot be empty")
	}

	_, err := s.db.Exec("UPDATE projects SET name = ?, key = ? WHERE id = ?", name, key, id)
	if err != nil {
		return nil, fmt.Errorf("failed to update project: %w", err)
	}
	return s.Get(id)
}

var slugifyRegexp = regexp.MustCompile(`[^a-z0-9]+`)

func slugify(s string) string {
	s = strings.ToLower(s)
	s = slugifyRegexp.ReplaceAllString(s, "-")
	return strings.Trim(s, "-")
}

func (s *ProjectStore) Delete(id types.ProjectID) error {
	_, err := s.db.Exec("DELETE FROM projects WHERE id = ?", id)
	if err != nil {
		return fmt.Errorf("failed to delete project: %w", err)
	}
	return nil
}
