// Copyright 2026 Jimmy Ma
// SPDX-License-Identifier: MIT

package types

import "time"

type GlobalConfigKey string

const (
	ConfigKeyMCPInstructions GlobalConfigKey = "mcp_instructions"
	ConfigKeyLocalMDTemplate GlobalConfigKey = "local_md_template"
)

func (k GlobalConfigKey) IsValid() bool {
	switch k {
	case ConfigKeyMCPInstructions, ConfigKeyLocalMDTemplate:
		return true
	default:
		return false
	}
}

type GlobalConfig struct {
	Key       GlobalConfigKey `json:"key"`
	Value     string          `json:"value"`
	CreatedAt time.Time       `json:"createdAt"`
	UpdatedAt time.Time       `json:"updatedAt"`
}
