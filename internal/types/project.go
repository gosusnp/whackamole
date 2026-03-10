// Copyright 2026 Jimmy Ma
// SPDX-License-Identifier: MIT

package types

import (
	"fmt"
	"regexp"
	"time"
)

type ProjectID int64
type ProjectKey string

var projectKeyRegex = regexp.MustCompile(`^[a-z0-9-]+$`)

func (k ProjectKey) Validate() error {
	if k == "" {
		return fmt.Errorf("project key cannot be empty")
	}
	if !projectKeyRegex.MatchString(string(k)) {
		return fmt.Errorf("project key must be lowercase, alphanumeric, and may contain dashes")
	}
	return nil
}

type Project struct {
	ID        ProjectID  `json:"id"`
	Key       ProjectKey `json:"key"`
	Name      string     `json:"name"`
	CreatedAt time.Time  `json:"createdAt"`
	UpdatedAt time.Time  `json:"updatedAt"`
}
