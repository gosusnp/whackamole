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

type ConfigStoreTestSuite struct {
	suite.Suite
	dbPath string
	db     *sql.DB
	store  *ConfigStore
}

func (s *ConfigStoreTestSuite) SetupTest() {
	tmpFile, err := os.CreateTemp("", "whack_config_test_*.db")
	s.NoError(err)
	s.dbPath = tmpFile.Name()
	tmpFile.Close()

	database, err := Open(s.dbPath)
	s.NoError(err)
	s.db = database
	s.store = NewConfigStore(database)
}

func (s *ConfigStoreTestSuite) TearDownTest() {
	if s.db != nil {
		s.NoError(s.db.Close())
	}
	if s.dbPath != "" {
		os.Remove(s.dbPath)
	}
}

func (s *ConfigStoreTestSuite) TestUpdateAndGetConfig() {
	key := types.ConfigKeyMCPInstructions
	val := "Hello agent"

	err := s.store.UpdateConfig(key, val)
	s.NoError(err)

	config, err := s.store.GetConfig(key)
	s.NoError(err)
	s.Equal(key, config.Key)
	s.Equal(val, config.Value)
	s.False(config.CreatedAt.IsZero())
	s.False(config.UpdatedAt.IsZero())

	// Test update (UPSERT)
	newVal := "Updated instructions"
	err = s.store.UpdateConfig(key, newVal)
	s.NoError(err)

	config, err = s.store.GetConfig(key)
	s.NoError(err)
	s.Equal(newVal, config.Value)
}

func (s *ConfigStoreTestSuite) TestGetConfigNotFound() {
	config, err := s.store.GetConfig("nonexistent")
	s.NoError(err)
	s.Nil(config)
}

func (s *ConfigStoreTestSuite) TestGetConfigs() {
	// Use valid keys for listing
	key1 := types.ConfigKeyMCPInstructions
	err := s.store.UpdateConfig(key1, "val1")
	s.NoError(err)

	configs, err := s.store.GetConfigs()
	s.NoError(err)
	s.Len(configs, 1)
	s.Equal(key1, configs[0].Key)
}

func (s *ConfigStoreTestSuite) TestGetConfigsEmpty() {
	configs, err := s.store.GetConfigs()
	s.NoError(err)
	s.NotNil(configs)
	s.Len(configs, 0)
}

func (s *ConfigStoreTestSuite) TestUpdateConfigValidation() {
	err := s.store.UpdateConfig("invalid_key", "value")
	s.Error(err)
	s.Contains(err.Error(), "invalid config key")
}

func TestConfigStoreSuite(t *testing.T) {
	suite.Run(t, new(ConfigStoreTestSuite))
}
