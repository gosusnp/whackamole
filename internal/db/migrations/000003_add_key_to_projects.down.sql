-- Copyright 2026 Jimmy Ma
-- SPDX-License-Identifier: MIT

DROP INDEX IF EXISTS idx_projects_key;
ALTER TABLE projects DROP COLUMN key;
