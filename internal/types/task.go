// Copyright 2026 Jimmy Ma
// SPDX-License-Identifier: MIT

package types

import "time"

type TaskID int64

type TaskType string

const (
	TaskTypeFeat     TaskType = "feat"
	TaskTypeBug      TaskType = "bug"
	TaskTypeDocs     TaskType = "docs"
	TaskTypeRefactor TaskType = "refactor"
	TaskTypeChore    TaskType = "chore"
)

type TaskStatus string

const (
	TaskStatusNotStarted TaskStatus = "notStarted"
	TaskStatusInProgress TaskStatus = "inProgress"
	TaskStatusReview     TaskStatus = "review"
	TaskStatusBlocked    TaskStatus = "blocked"
	TaskStatusCompleted  TaskStatus = "completed"
	TaskStatusClosed     TaskStatus = "closed"
)

type Task struct {
	ID          TaskID     `json:"id"`
	ProjectID   ProjectID  `json:"projectId"`
	Name        string     `json:"name"`
	Description string     `json:"description"`
	Type        TaskType   `json:"type"`
	Status      TaskStatus `json:"status"`
	CreatedAt   time.Time  `json:"createdAt"`
	UpdatedAt   time.Time  `json:"updatedAt"`
}
