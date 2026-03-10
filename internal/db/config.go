// Copyright 2026 Jimmy Ma
// SPDX-License-Identifier: MIT

package db

import (
	"database/sql"
	"fmt"

	"github.com/gosusnp/whackamole/internal/types"
)

type ConfigStore struct {
	db *sql.DB
}

func NewConfigStore(db *sql.DB) *ConfigStore {
	return &ConfigStore{db: db}
}

func (s *ConfigStore) UpdateConfig(key types.GlobalConfigKey, value string) error {
	if !key.IsValid() {
		return fmt.Errorf("invalid config key: %s", key)
	}

	_, err := s.db.Exec(`
		INSERT INTO global_config (key, value) VALUES (?, ?)
		ON CONFLICT(key) DO UPDATE SET value = excluded.value
	`, string(key), value)

	if err != nil {
		return fmt.Errorf("failed to update config: %w", err)
	}

	return nil
}

func (s *ConfigStore) GetConfig(key types.GlobalConfigKey) (*types.GlobalConfig, error) {
	var c types.GlobalConfig
	err := s.db.QueryRow("SELECT key, value, created_at, updated_at FROM global_config WHERE key = ?", key).
		Scan(&c.Key, &c.Value, &c.CreatedAt, &c.UpdatedAt)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, fmt.Errorf("failed to get config: %w", err)
	}
	return &c, nil
}

func (s *ConfigStore) GetConfigs() ([]types.GlobalConfig, error) {
	rows, err := s.db.Query("SELECT key, value, created_at, updated_at FROM global_config ORDER BY key ASC")
	if err != nil {
		return nil, fmt.Errorf("failed to list configs: %w", err)
	}
	defer rows.Close()

	configs := []types.GlobalConfig{}
	for rows.Next() {
		var c types.GlobalConfig
		if err := rows.Scan(&c.Key, &c.Value, &c.CreatedAt, &c.UpdatedAt); err != nil {
			return nil, fmt.Errorf("failed to scan config: %w", err)
		}
		configs = append(configs, c)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("error during row iteration: %w", err)
	}

	return configs, nil
}
