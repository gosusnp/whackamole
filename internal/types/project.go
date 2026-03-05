// Copyright 2026 Jimmy Ma
// SPDX-License-Identifier: MIT

package types

import "time"

type ProjectID int64

type Project struct {
	ID        ProjectID `json:"id"`
	Name      string    `json:"name"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}
