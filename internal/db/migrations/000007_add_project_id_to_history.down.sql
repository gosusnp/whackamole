-- Copyright 2026 Jimmy Ma
-- SPDX-License-Identifier: MIT

-- SQLite does not support dropping columns directly in older versions, 
-- but for simplicity and since it's a new migration, we just leave it or 
-- if we really want to drop it we need to recreate the table.
-- Given it's a project instruction to provide down migrations:

CREATE TABLE whack_history_dg_tmp (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    object_type TEXT NOT NULL,
    object_id INTEGER NOT NULL,
    operation TEXT NOT NULL
);

INSERT INTO whack_history_dg_tmp(id, created_at, object_type, object_id, operation)
SELECT id, created_at, object_type, object_id, operation FROM whack_history;

DROP TABLE whack_history;

ALTER TABLE whack_history_dg_tmp RENAME TO whack_history;

CREATE INDEX IF NOT EXISTS idx_whack_history_created_at ON whack_history(created_at);
