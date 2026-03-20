// Copyright 2026 Jimmy Ma
// SPDX-License-Identifier: MIT

package types

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestParseTaskStatus(t *testing.T) {
	tests := []struct {
		input    string
		expected TaskStatus
		wantErr  bool
	}{
		{"notStarted", TaskStatusNotStarted, false},
		{"not_started", TaskStatusNotStarted, false},
		{"NOTSTARTED", TaskStatusNotStarted, false},
		{"inProgress", TaskStatusInProgress, false},
		{"in_progress", TaskStatusInProgress, false},
		{"IN_PROGRESS", TaskStatusInProgress, false},
		{"In_ProGress", TaskStatusInProgress, false},
		{"review", TaskStatusReview, false},
		{"REVIEW", TaskStatusReview, false},
		{"blocked", TaskStatusBlocked, false},
		{"completed", TaskStatusCompleted, false},
		{"done", TaskStatusCompleted, false},
		{"closed", TaskStatusClosed, false},
		{"invalid", "", true},
	}

	for _, tt := range tests {
		t.Run(tt.input, func(t *testing.T) {
			got, err := ParseTaskStatus(tt.input)
			if tt.wantErr {
				assert.Error(t, err)
			} else {
				assert.NoError(t, err)
				assert.Equal(t, tt.expected, got)
			}
		})
	}
}

func TestParseTaskType(t *testing.T) {
	tests := []struct {
		input    string
		expected TaskType
		wantErr  bool
	}{
		{"feat", TaskTypeFeat, false},
		{"FEAT", TaskTypeFeat, false},
		{"feature", TaskTypeFeat, false},
		{"FEATURE", TaskTypeFeat, false},
		{"bug", TaskTypeBug, false},
		{"BUG", TaskTypeBug, false},
		{"fix", TaskTypeBug, false},
		{"FIX", TaskTypeBug, false},
		{"docs", TaskTypeDocs, false},
		{"DOCS", TaskTypeDocs, false},
		{"documentation", TaskTypeDocs, false},
		{"DOCUMENTATION", TaskTypeDocs, false},
		{"refactor", TaskTypeRefactor, false},
		{"REFACTOR", TaskTypeRefactor, false},
		{"chore", TaskTypeChore, false},
		{"CHORE", TaskTypeChore, false},
		{"invalid", "", true},
	}

	for _, tt := range tests {
		t.Run(tt.input, func(t *testing.T) {
			got, err := ParseTaskType(tt.input)
			if tt.wantErr {
				assert.Error(t, err)
			} else {
				assert.NoError(t, err)
				assert.Equal(t, tt.expected, got)
			}
		})
	}
}
