-- Copyright 2026 Jimmy Ma
-- SPDX-License-Identifier: MIT

-- SQLite does not support adding UNIQUE constraints via ALTER TABLE ADD COLUMN.
-- We add the column with a default to satisfy NOT NULL, then add a UNIQUE index.
ALTER TABLE projects ADD COLUMN key TEXT NOT NULL DEFAULT '';
CREATE UNIQUE INDEX idx_projects_key ON projects(key);
