// Copyright 2026 Jimmy Ma
// SPDX-License-Identifier: MIT

package db

import (
	"database/sql"
	"fmt"
	"strings"

	"github.com/gosusnp/whackamole/internal/types"
)

type TaskStore struct {
	db      *sql.DB
	history *HistoryStore
}

func NewTaskStore(db *sql.DB, history *HistoryStore) *TaskStore {
	return &TaskStore{db: db, history: history}
}

func (s *TaskStore) Create(projectID types.ProjectID, name, description string, taskType types.TaskType, status types.TaskStatus) (*types.Task, error) {
	name = strings.TrimSpace(name)
	if name == "" {
		return nil, fmt.Errorf("task name cannot be empty")
	}

	if taskType == "" {
		taskType = types.TaskTypeFeat
	} else if !isValidTaskType(taskType) {
		return nil, fmt.Errorf("invalid task type: %s", taskType)
	}

	if status == "" {
		status = types.TaskStatusNotStarted
	} else if !isValidTaskStatus(status) {
		return nil, fmt.Errorf("invalid task status: %s", status)
	}

	tx, err := s.db.Begin()
	if err != nil {
		return nil, fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer func() { _ = tx.Rollback() }()

	res, err := tx.Exec("INSERT INTO tasks (project_id, name, description, type, status) VALUES (?, ?, ?, ?, ?)",
		projectID, name, description, taskType, status)
	if err != nil {
		return nil, fmt.Errorf("failed to create task: %w", err)
	}

	id, err := res.LastInsertId()
	if err != nil {
		return nil, fmt.Errorf("failed to get last insert id: %w", err)
	}

	if err := s.history.AddUpdateTx(tx, "task", id, "create"); err != nil {
		return nil, fmt.Errorf("failed to add history: %w", err)
	}

	if err := tx.Commit(); err != nil {
		return nil, fmt.Errorf("failed to commit transaction: %w", err)
	}

	return s.Get(types.TaskID(id))
}

func (s *TaskStore) Get(id types.TaskID) (*types.Task, error) {
	var t types.Task
	err := s.db.QueryRow("SELECT id, project_id, name, description, type, status, created_at, updated_at FROM tasks WHERE id = ?", id).
		Scan(&t.ID, &t.ProjectID, &t.Name, &t.Description, &t.Type, &t.Status, &t.CreatedAt, &t.UpdatedAt)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("task not found: %d", id)
		}
		return nil, fmt.Errorf("failed to get task: %w", err)
	}
	return &t, nil
}

func (s *TaskStore) ListByProject(projectID types.ProjectID, includeAll bool) ([]types.Task, error) {
	query := "SELECT id, project_id, name, description, type, status, created_at, updated_at FROM tasks WHERE project_id = ?"
	args := []interface{}{projectID}

	if !includeAll {
		query += " AND status NOT IN (?, ?)"
		args = append(args, types.TaskStatusCompleted, types.TaskStatusClosed)
	}

	query += " ORDER BY created_at DESC"

	rows, err := s.db.Query(query, args...)
	if err != nil {
		return nil, fmt.Errorf("failed to list tasks: %w", err)
	}
	defer rows.Close()

	var tasks []types.Task
	for rows.Next() {
		var t types.Task
		if err := rows.Scan(&t.ID, &t.ProjectID, &t.Name, &t.Description, &t.Type, &t.Status, &t.CreatedAt, &t.UpdatedAt); err != nil {
			return nil, fmt.Errorf("failed to scan task: %w", err)
		}
		tasks = append(tasks, t)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("error during row iteration: %w", err)
	}

	return tasks, nil
}

func (s *TaskStore) Update(id types.TaskID, name, description string, taskType types.TaskType, status types.TaskStatus) (*types.Task, error) {
	name = strings.TrimSpace(name)
	if name == "" {
		return nil, fmt.Errorf("task name cannot be empty")
	}

	if !isValidTaskType(taskType) {
		return nil, fmt.Errorf("invalid task type: %s", taskType)
	}

	if !isValidTaskStatus(status) {
		return nil, fmt.Errorf("invalid task status: %s", status)
	}

	tx, err := s.db.Begin()
	if err != nil {
		return nil, fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer func() { _ = tx.Rollback() }()

	_, err = tx.Exec("UPDATE tasks SET name = ?, description = ?, type = ?, status = ? WHERE id = ?",
		name, description, taskType, status, id)
	if err != nil {
		return nil, fmt.Errorf("failed to update task: %w", err)
	}

	if err := s.history.AddUpdateTx(tx, "task", int64(id), "update"); err != nil {
		return nil, fmt.Errorf("failed to add history: %w", err)
	}

	if err := tx.Commit(); err != nil {
		return nil, fmt.Errorf("failed to commit transaction: %w", err)
	}

	return s.Get(id)
}

func (s *TaskStore) Patch(id types.TaskID, updates map[string]interface{}) (*types.Task, error) {
	if len(updates) == 0 {
		return s.Get(id)
	}

	var setClauses []string
	var args []interface{}

	for k, v := range updates {
		switch k {
		case "name":
			name, ok := v.(string)
			if !ok {
				return nil, fmt.Errorf("invalid name type")
			}
			name = strings.TrimSpace(name)
			if name == "" {
				return nil, fmt.Errorf("task name cannot be empty")
			}
			setClauses = append(setClauses, "name = ?")
			args = append(args, name)
		case "description":
			description, ok := v.(string)
			if !ok {
				return nil, fmt.Errorf("invalid description type")
			}
			setClauses = append(setClauses, "description = ?")
			args = append(args, description)
		case "type":
			taskType, ok := v.(types.TaskType)
			if !ok {
				// Also support string for JSON unmarshaling
				if sVal, ok := v.(string); ok {
					taskType = types.TaskType(sVal)
				} else {
					return nil, fmt.Errorf("invalid type type")
				}
			}
			if !isValidTaskType(taskType) {
				return nil, fmt.Errorf("invalid task type: %s", taskType)
			}
			setClauses = append(setClauses, "type = ?")
			args = append(args, taskType)
		case "status":
			status, ok := v.(types.TaskStatus)
			if !ok {
				// Also support string for JSON unmarshaling
				if sVal, ok := v.(string); ok {
					status = types.TaskStatus(sVal)
				} else {
					return nil, fmt.Errorf("invalid status type")
				}
			}
			if !isValidTaskStatus(status) {
				return nil, fmt.Errorf("invalid task status: %s", status)
			}
			setClauses = append(setClauses, "status = ?")
			args = append(args, status)
		default:
			return nil, fmt.Errorf("unknown field: %s", k)
		}
	}

	tx, err := s.db.Begin()
	if err != nil {
		return nil, fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer func() { _ = tx.Rollback() }()

	query := fmt.Sprintf("UPDATE tasks SET %s WHERE id = ?", strings.Join(setClauses, ", "))
	args = append(args, id)

	_, err = tx.Exec(query, args...)
	if err != nil {
		return nil, fmt.Errorf("failed to patch task: %w", err)
	}

	if err := s.history.AddUpdateTx(tx, "task", int64(id), "update"); err != nil {
		return nil, fmt.Errorf("failed to add history: %w", err)
	}

	if err := tx.Commit(); err != nil {
		return nil, fmt.Errorf("failed to commit transaction: %w", err)
	}

	return s.Get(id)
}

func (s *TaskStore) Delete(id types.TaskID) error {
	tx, err := s.db.Begin()
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer func() { _ = tx.Rollback() }()

	_, err = tx.Exec("DELETE FROM tasks WHERE id = ?", id)
	if err != nil {
		return fmt.Errorf("failed to delete task: %w", err)
	}

	if err := s.history.AddUpdateTx(tx, "task", int64(id), "delete"); err != nil {
		return fmt.Errorf("failed to add history: %w", err)
	}

	if err := tx.Commit(); err != nil {
		return fmt.Errorf("failed to commit transaction: %w", err)
	}

	return nil
}

func isValidTaskType(t types.TaskType) bool {
	switch t {
	case types.TaskTypeFeat, types.TaskTypeBug, types.TaskTypeDocs, types.TaskTypeRefactor, types.TaskTypeChore:
		return true
	default:
		return false
	}
}

func isValidTaskStatus(s types.TaskStatus) bool {
	switch s {
	case types.TaskStatusNotStarted, types.TaskStatusInProgress, types.TaskStatusReview, types.TaskStatusBlocked, types.TaskStatusCompleted, types.TaskStatusClosed:
		return true
	default:
		return false
	}
}
