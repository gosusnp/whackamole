// Copyright 2026 Jimmy Ma
// SPDX-License-Identifier: MIT

package types

import "time"

type ProjectID int64
type ProjectKey string

type Project struct {
	ID        ProjectID  `json:"id"`
	Key       ProjectKey `json:"key"`
	Name      string     `json:"name"`
	CreatedAt time.Time  `json:"createdAt"`
	UpdatedAt time.Time  `json:"updatedAt"`
}
