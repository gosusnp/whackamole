-- Copyright 2026 Jimmy Ma
-- SPDX-License-Identifier: MIT

CREATE TABLE IF NOT EXISTS whack_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    object_type TEXT NOT NULL,
    object_id INTEGER NOT NULL,
    operation TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_whack_history_created_at ON whack_history(created_at);
