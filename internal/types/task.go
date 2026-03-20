// Copyright 2026 Jimmy Ma
// SPDX-License-Identifier: MIT

package types

import (
	"fmt"
	"strings"
	"time"
)

type TaskID int64

type TaskType string

const (
	TaskTypeFeat     TaskType = "feat"
	TaskTypeBug      TaskType = "bug"
	TaskTypeDocs     TaskType = "docs"
	TaskTypeRefactor TaskType = "refactor"
	TaskTypeChore    TaskType = "chore"
)

func ParseTaskType(s string) (TaskType, error) {
	normalized := strings.ToLower(strings.ReplaceAll(s, "_", ""))
	switch normalized {
	case "feat", "feature":
		return TaskTypeFeat, nil
	case "bug", "fix":
		return TaskTypeBug, nil
	case "docs", "documentation":
		return TaskTypeDocs, nil
	case "refactor":
		return TaskTypeRefactor, nil
	case "chore":
		return TaskTypeChore, nil
	default:
		return "", fmt.Errorf("invalid task type: %s", s)
	}
}

type TaskStatus string

const (
	TaskStatusNotStarted TaskStatus = "notStarted"
	TaskStatusInProgress TaskStatus = "inProgress"
	TaskStatusReview     TaskStatus = "review"
	TaskStatusBlocked    TaskStatus = "blocked"
	TaskStatusCompleted  TaskStatus = "completed"
	TaskStatusClosed     TaskStatus = "closed"
)

func ParseTaskStatus(s string) (TaskStatus, error) {
	normalized := strings.ToLower(strings.ReplaceAll(s, "_", ""))
	switch normalized {
	case "notstarted":
		return TaskStatusNotStarted, nil
	case "inprogress":
		return TaskStatusInProgress, nil
	case "review":
		return TaskStatusReview, nil
	case "blocked":
		return TaskStatusBlocked, nil
	case "completed", "done":
		return TaskStatusCompleted, nil
	case "closed":
		return TaskStatusClosed, nil
	default:
		return "", fmt.Errorf("invalid task status: %s", s)
	}
}

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
