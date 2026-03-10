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

type ProjectStoreTestSuite struct {
	suite.Suite
	dbPath string
	db     *sql.DB
	store  *ProjectStore
}

func (s *ProjectStoreTestSuite) SetupTest() {
	// Create a fresh temp database for each test
	tmpFile, err := os.CreateTemp("", "whack_test_*.db")
	s.NoError(err)
	s.dbPath = tmpFile.Name()
	tmpFile.Close()

	database, err := Open(s.dbPath)
	s.NoError(err)
	s.db = database
	s.store = NewProjectStore(database)
}

func (s *ProjectStoreTestSuite) TearDownTest() {
	if s.db != nil {
		s.NoError(s.db.Close())
	}
	if s.dbPath != "" {
		os.Remove(s.dbPath)
	}
}

func (s *ProjectStoreTestSuite) TestCreate() {
	name := "Test Project"
	p, err := s.store.Create(name, "p1")
	s.NoError(err)
	s.NotZero(p.ID)
	s.Equal(name, p.Name)
	s.Equal(types.ProjectKey("p1"), p.Key)
	s.False(p.CreatedAt.IsZero())
	s.False(p.UpdatedAt.IsZero())
}

func (s *ProjectStoreTestSuite) TestCreateAutoKey() {
	name := "Test Project"
	p, err := s.store.Create(name, "")
	s.NoError(err)
	s.NotZero(p.ID)
	s.Equal(name, p.Name)
	s.Equal(types.ProjectKey("test-project"), p.Key)
}

func (s *ProjectStoreTestSuite) TestCreateValidation() {
	_, err := s.store.Create("", "p1")
	s.Error(err)
	s.Contains(err.Error(), "cannot be empty")

	_, err = s.store.Create("   ", "p1")
	s.Error(err)

	// Test invalid keys
	_, err = s.store.Create("Project", "Invalid Key")
	s.Error(err)
	s.Contains(err.Error(), "must be lowercase, alphanumeric, and may contain dashes")

	_, err = s.store.Create("Project", "project!")
	s.Error(err)
}

func (s *ProjectStoreTestSuite) TestUpdateValidation() {
	p, _ := s.store.Create("Valid Name", "p1")
	_, err := s.store.Update(p.ID, "", "p1")
	s.Error(err)
	s.Contains(err.Error(), "cannot be empty")

	_, err = s.store.Update(p.ID, "Valid Name", "")
	s.Error(err)
	s.Contains(err.Error(), "cannot be empty")

	// Test invalid keys
	_, err = s.store.Update(p.ID, "Valid Name", "Invalid Key")
	s.Error(err)
	s.Contains(err.Error(), "must be lowercase, alphanumeric, and may contain dashes")
}

func (s *ProjectStoreTestSuite) TestGet() {
	p, err := s.store.Create("Get Me", "getme")
	s.NoError(err)

	got, err := s.store.Get(p.ID)
	s.NoError(err)
	s.Equal(p.ID, got.ID)
	s.Equal("Get Me", got.Name)
	s.Equal(types.ProjectKey("getme"), got.Key)
}

func (s *ProjectStoreTestSuite) TestGetByKey() {
	p, err := s.store.Create("Get Me Key", "getmekey")
	s.NoError(err)

	got, err := s.store.GetByKey("getmekey")
	s.NoError(err)
	s.Equal(p.ID, got.ID)
	s.Equal("Get Me Key", got.Name)
}

func (s *ProjectStoreTestSuite) TestGetNotFound() {
	_, err := s.store.Get(types.ProjectID(999))
	s.Error(err)
	s.Contains(err.Error(), "not found with ID")

	_, err = s.store.GetByKey("nonexistent")
	s.Error(err)
	s.Contains(err.Error(), "not found with key")
}

func (s *ProjectStoreTestSuite) TestList() {
	_, err := s.store.Create("Project 1", "p1")
	s.NoError(err)
	_, err = s.store.Create("Project 2", "p2")
	s.NoError(err)

	projects, err := s.store.List()
	s.NoError(err)
	s.Len(projects, 2)
}

func (s *ProjectStoreTestSuite) TestUpdate() {
	p, err := s.store.Create("Old Name", "oldkey")
	s.NoError(err)

	newName := "New Name"
	newKey := types.ProjectKey("newkey")
	updated, err := s.store.Update(p.ID, newName, newKey)
	s.NoError(err)
	s.Equal(newName, updated.Name)
	s.Equal(newKey, updated.Key)
	s.Equal(p.ID, updated.ID)
	s.False(updated.UpdatedAt.IsZero())
}

func (s *ProjectStoreTestSuite) TestDelete() {
	p, err := s.store.Create("Delete Me", "deleteme")
	s.NoError(err)

	err = s.store.Delete(p.ID)
	s.NoError(err)

	_, err = s.store.Get(p.ID)
	s.Error(err)
}

func TestProjectStoreSuite(t *testing.T) {
	suite.Run(t, new(ProjectStoreTestSuite))
}
