// Copyright 2026 Jimmy Ma
// SPDX-License-Identifier: MIT

package db

import (
	"database/sql"
	"os"
	"testing"

	"github.com/gosusnp/whackamole/internal/types"
	"github.com/stretchr/testify/suite"
)

type TaskStoreTestSuite struct {
	suite.Suite
	dbPath       string
	db           *sql.DB
	projectStore *ProjectStore
	taskStore    *TaskStore
	project      *types.Project
}

func (s *TaskStoreTestSuite) SetupTest() {
	tmpFile, err := os.CreateTemp("", "whack_task_test_*.db")
	s.NoError(err)
	s.dbPath = tmpFile.Name()
	tmpFile.Close()

	database, err := Open(s.dbPath)
	s.NoError(err)
	s.db = database
	s.projectStore = NewProjectStore(database)
	s.taskStore = NewTaskStore(database)

	// Create a project for the tasks
	p, err := s.projectStore.Create("Test Project", "tp1")
	s.NoError(err)
	s.project = p
}

func (s *TaskStoreTestSuite) TearDownTest() {
	if s.db != nil {
		s.NoError(s.db.Close())
	}
	if s.dbPath != "" {
		os.Remove(s.dbPath)
	}
}

func (s *TaskStoreTestSuite) TestCreate() {
	t, err := s.taskStore.Create(s.project.ID, "Test Task", "Desc", types.TaskTypeFeat, types.TaskStatusNotStarted)
	s.NoError(err)
	s.NotZero(t.ID)
	s.Equal(s.project.ID, t.ProjectID)
	s.Equal("Test Task", t.Name)
	s.Equal("Desc", t.Description)
	s.Equal(types.TaskTypeFeat, t.Type)
	s.Equal(types.TaskStatusNotStarted, t.Status)
}

func (s *TaskStoreTestSuite) TestCreateValidation() {
	_, err := s.taskStore.Create(s.project.ID, "", "", "", "")
	s.Error(err)
	s.Contains(err.Error(), "cannot be empty")
}

func (s *TaskStoreTestSuite) TestGet() {
	t, _ := s.taskStore.Create(s.project.ID, "Get Me", "", "", "")
	got, err := s.taskStore.Get(t.ID)
	s.NoError(err)
	s.Equal(t.ID, got.ID)
}

func (s *TaskStoreTestSuite) TestListByProject() {
	_, _ = s.taskStore.Create(s.project.ID, "Task 1", "", "", types.TaskStatusNotStarted)
	_, _ = s.taskStore.Create(s.project.ID, "Task 2", "", "", types.TaskStatusCompleted)

	// List all
	tasks, err := s.taskStore.ListByProject(s.project.ID, true)
	s.NoError(err)
	s.Len(tasks, 2)

	// List only unfinished
	tasks, err = s.taskStore.ListByProject(s.project.ID, false)
	s.NoError(err)
	s.Len(tasks, 1)
	s.Equal("Task 1", tasks[0].Name)
}

func (s *TaskStoreTestSuite) TestUpdate() {
	t, _ := s.taskStore.Create(s.project.ID, "Old", "Old", types.TaskTypeFeat, types.TaskStatusNotStarted)
	updated, err := s.taskStore.Update(t.ID, "New", "New", types.TaskTypeBug, types.TaskStatusInProgress)
	s.NoError(err)
	s.Equal("New", updated.Name)
	s.Equal("New", updated.Description)
	s.Equal(types.TaskTypeBug, updated.Type)
	s.Equal(types.TaskStatusInProgress, updated.Status)
}

func (s *TaskStoreTestSuite) TestPatch() {
	t, _ := s.taskStore.Create(s.project.ID, "Original Name", "Original Desc", types.TaskTypeFeat, types.TaskStatusNotStarted)

	// Patch only name
	patched, err := s.taskStore.Patch(t.ID, map[string]interface{}{"name": "Patched Name"})
	s.NoError(err)
	s.Equal("Patched Name", patched.Name)
	s.Equal("Original Desc", patched.Description)
	s.Equal(types.TaskTypeFeat, patched.Type)
	s.Equal(types.TaskStatusNotStarted, patched.Status)

	// Patch status and type
	patched, err = s.taskStore.Patch(t.ID, map[string]interface{}{
		"status": types.TaskStatusInProgress,
		"type":   types.TaskTypeBug,
	})
	s.NoError(err)
	s.Equal("Patched Name", patched.Name)
	s.Equal(types.TaskStatusInProgress, patched.Status)
	s.Equal(types.TaskTypeBug, patched.Type)

	// Test validation in Patch
	_, err = s.taskStore.Patch(t.ID, map[string]interface{}{"name": ""})
	s.Error(err)
	s.Contains(err.Error(), "cannot be empty")
}

func (s *TaskStoreTestSuite) TestDelete() {
	t, _ := s.taskStore.Create(s.project.ID, "Delete", "", "", "")
	err := s.taskStore.Delete(t.ID)
	s.NoError(err)

	_, err = s.taskStore.Get(t.ID)
	s.Error(err)
}

func TestTaskStoreSuite(t *testing.T) {
	suite.Run(t, new(TaskStoreTestSuite))
}
