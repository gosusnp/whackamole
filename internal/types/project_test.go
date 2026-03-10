// Copyright 2026 Jimmy Ma
// SPDX-License-Identifier: MIT

package types

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestProjectKeyValidate(t *testing.T) {
	tests := []struct {
		key     ProjectKey
		wantErr bool
		errMsg  string
	}{
		{"valid-key", false, ""},
		{"valid123", false, ""},
		{"v-1-2-3", false, ""},
		{"", true, "cannot be empty"},
		{"Invalid Key", true, "must be lowercase, alphanumeric, and may contain dashes"},
		{"invalid_key", true, "must be lowercase, alphanumeric, and may contain dashes"},
		{"invalid!", true, "must be lowercase, alphanumeric, and may contain dashes"},
		{"Invalid", true, "must be lowercase, alphanumeric, and may contain dashes"},
	}

	for _, tt := range tests {
		t.Run(string(tt.key), func(t *testing.T) {
			err := tt.key.Validate()
			if tt.wantErr {
				assert.Error(t, err)
				assert.Contains(t, err.Error(), tt.errMsg)
			} else {
				assert.NoError(t, err)
			}
		})
	}
}
