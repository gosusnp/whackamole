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
	p, err := s.store.Create(name)
	s.NoError(err)
	s.NotZero(p.ID)
	s.Equal(name, p.Name)
	s.False(p.CreatedAt.IsZero())
	s.False(p.UpdatedAt.IsZero())
}

func (s *ProjectStoreTestSuite) TestCreateValidation() {
	_, err := s.store.Create("")
	s.Error(err)
	s.Contains(err.Error(), "cannot be empty")

	_, err = s.store.Create("   ")
	s.Error(err)
}

func (s *ProjectStoreTestSuite) TestUpdateValidation() {
	p, _ := s.store.Create("Valid Name")
	_, err := s.store.Update(p.ID, "")
	s.Error(err)
	s.Contains(err.Error(), "cannot be empty")
}

func (s *ProjectStoreTestSuite) TestGet() {
	p, err := s.store.Create("Get Me")
	s.NoError(err)

	got, err := s.store.Get(p.ID)
	s.NoError(err)
	s.Equal(p.ID, got.ID)
	s.Equal("Get Me", got.Name)
}

func (s *ProjectStoreTestSuite) TestGetNotFound() {
	_, err := s.store.Get(types.ProjectID(999))
	s.Error(err)
	s.Contains(err.Error(), "not found")
}

func (s *ProjectStoreTestSuite) TestList() {
	_, err := s.store.Create("Project 1")
	s.NoError(err)
	_, err = s.store.Create("Project 2")
	s.NoError(err)

	projects, err := s.store.List()
	s.NoError(err)
	s.Len(projects, 2)
}

func (s *ProjectStoreTestSuite) TestUpdate() {
	p, err := s.store.Create("Old Name")
	s.NoError(err)

	newName := "New Name"
	updated, err := s.store.Update(p.ID, newName)
	s.NoError(err)
	s.Equal(newName, updated.Name)
	s.Equal(p.ID, updated.ID)
	s.False(updated.UpdatedAt.IsZero())
}

func (s *ProjectStoreTestSuite) TestDelete() {
	p, err := s.store.Create("Delete Me")
	s.NoError(err)

	err = s.store.Delete(p.ID)
	s.NoError(err)

	_, err = s.store.Get(p.ID)
	s.Error(err)
}

func TestProjectStoreSuite(t *testing.T) {
	suite.Run(t, new(ProjectStoreTestSuite))
}
