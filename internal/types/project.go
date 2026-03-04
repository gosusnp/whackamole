// Copyright 2026 Jimmy Ma
// SPDX-License-Identifier: MIT

package types

import "time"

type Project struct {
	ID        int64     `json:"id"`
	Name      string    `json:"name"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}
