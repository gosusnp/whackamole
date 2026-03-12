-- Copyright 2026 Jimmy Ma
-- SPDX-License-Identifier: MIT

ALTER TABLE whack_history ADD COLUMN project_id INTEGER NOT NULL DEFAULT 0;
