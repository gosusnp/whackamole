// Copyright 2026 Jimmy Ma
// SPDX-License-Identifier: MIT

package types

import "time"

type HistoryID int64

type History struct {
	ID         HistoryID `json:"id"`
	CreatedAt  time.Time `json:"createdAt"`
	ObjectType string    `json:"objectType"`
	ObjectID   int64     `json:"objectId"`
	ProjectID  int64     `json:"projectId"`
	Operation  string    `json:"operation"`
}
