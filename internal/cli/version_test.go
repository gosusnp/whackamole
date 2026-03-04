// Copyright 2026 Jimmy Ma
// SPDX-License-Identifier: MIT

package cli

import (
	"bytes"
	"testing"

	"github.com/gosusnp/whackamole/internal"
	"github.com/stretchr/testify/assert"
)

func TestVersionCmd(t *testing.T) {
	b := bytes.NewBufferString("")
	rootCmd.SetOut(b)
	rootCmd.SetArgs([]string{"version"})

	err := rootCmd.Execute()
	assert.NoError(t, err)

	expected := "whack version " + internal.Version + "\n"
	assert.Equal(t, expected, b.String())
}
