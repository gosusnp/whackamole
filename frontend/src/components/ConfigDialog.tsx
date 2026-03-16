/**
 * Copyright 2026 Jimmy Ma
 * SPDX-License-Identifier: MIT
 */

import { useState, useEffect } from 'preact/hooks';
import { Dialog } from './ui/Dialog';
import { Button } from './ui/Button';
import { TextArea } from './ui/TextArea';
import { Text } from './ui/Text';
import { Row } from './ui/Row';
import { Columns, Column } from './ui/Columns';
import { Settings } from 'lucide-preact';
import type { GlobalConfig } from '../types';

export function ConfigDialog() {
  const [open, setOpen] = useState(false);
  const [mcpInstructions, setMcpInstructions] = useState('');
  const [localMDTemplate, setLocalMDTemplate] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      fetchConfigs();
    }
  }, [open]);

  const fetchConfigs = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/configs');
      if (res.ok) {
        const data = (await res.json()) as GlobalConfig[];
        const mcp = data.find((c) => c.key === 'mcp_instructions');
        if (mcp) {
          setMcpInstructions(mcp.value);
        }
        const template = data.find((c) => c.key === 'local_md_template');
        if (template) {
          setLocalMDTemplate(template.value);
        }
      }
    } catch (err) {
      console.error('Failed to fetch configs', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Save both configs
      const res1 = await fetch('/api/configs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: 'mcp_instructions',
          value: mcpInstructions,
        }),
      });

      const res2 = await fetch('/api/configs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: 'local_md_template',
          value: localMDTemplate,
        }),
      });

      if (res1.ok && res2.ok) {
        setOpen(false);
      } else {
        const err1 = !res1.ok ? await res1.text() : '';
        const err2 = !res2.ok ? await res2.text() : '';
        console.error('Failed to save config', err1, err2);
      }
    } catch (err) {
      console.error('Failed to save config', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog
      title="Global Configuration"
      open={open}
      onOpenChange={setOpen}
      trigger={
        <Button variant="ghost" aria-label="Open settings">
          <Settings size={18} />
        </Button>
      }
    >
      <Columns vertical className="py-4">
        <Column>
          <Text bold>MCP Instructions</Text>
          <Text small muted className="mb-2">
            Global instructions passed to the MCP server. These direct the AI agent's behavior.
          </Text>
          <TextArea
            placeholder="Enter instructions for the agent..."
            value={mcpInstructions}
            onValueChange={(val) => setMcpInstructions(val)}
            rows={10}
          />
        </Column>

        <Column>
          <Text bold>Local MD Template</Text>
          <Text small muted className="mb-2">
            Content for CLAUDE.local.md and GEMINI.local.md files. Use $PROJECT_KEY for the project
            key replacement.
          </Text>
          <TextArea
            placeholder="## whackAmole task management

- Project key is $PROJECT_KEY
..."
            value={localMDTemplate}
            onValueChange={(val) => setLocalMDTemplate(val)}
            rows={10}
          />
        </Column>

        <Row justify="end" gap={2}>
          <Button variant="secondary" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving || loading}>
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </Row>
      </Columns>
    </Dialog>
  );
}
