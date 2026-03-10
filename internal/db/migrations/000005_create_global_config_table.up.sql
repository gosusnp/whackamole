-- Copyright 2026 Jimmy Ma
-- SPDX-License-Identifier: MIT

CREATE TABLE IF NOT EXISTS global_config (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER IF NOT EXISTS global_config_updated_at
AFTER UPDATE ON global_config
FOR EACH ROW
BEGIN
    UPDATE global_config SET updated_at = CURRENT_TIMESTAMP WHERE key = OLD.key;
END;
