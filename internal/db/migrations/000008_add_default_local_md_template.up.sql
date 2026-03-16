-- Copyright 2026 Jimmy Ma
-- SPDX-License-Identifier: MIT

INSERT INTO global_config (key, value)
VALUES ('local_md_template', '## whackAmole task management

- You have access to the whackAmole MCP server for task management.
- whackAmole project key is $PROJECT_KEY.')
ON CONFLICT(key) DO NOTHING;
