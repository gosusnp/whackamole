/**
 * Copyright 2026 Jimmy Ma
 * SPDX-License-Identifier: MIT
 */

import { useState } from 'preact/hooks';
import { Card } from '../components/ui/Card';
import { Columns, Column } from '../components/ui/Columns';
import { Tabs } from '../components/ui/Tabs';
import { Popover } from '../components/ui/Popover';
import { ToggleGroup } from '../components/ui/ToggleGroup';
import { Heading } from '../components/ui/Heading';
import { Text } from '../components/ui/Text';

export function DesignElements() {
  const [toggleValue, setToggleValue] = useState('left');

  const tabItems = [
    {
      id: 'tab1',
      label: 'Layout',
      content: (
        <Columns>
          <Column>
            <Card title="Column 1">
              <Text>This is the first column in a flexible layout.</Text>
            </Card>
          </Column>
          <Column>
            <Card title="Column 2">
              <Text>This is the second column in a flexible layout.</Text>
            </Card>
          </Column>
        </Columns>
      ),
    },
    {
      id: 'tab2',
      label: 'Interactive',
      content: (
        <Columns vertical>
          <Column>
            <Card title="Popover & Toggle Group">
              <div className="flex items-center gap-4">
                <Text>Current Value: {toggleValue}</Text>
                <Popover
                  trigger={
                    <button className="bg-bg-muted border-border-base text-text-base rounded border px-4 py-2 text-sm">
                      Open Menu
                    </button>
                  }
                >
                  <div className="flex flex-col gap-2">
                    <Text small muted>
                      Select an option:
                    </Text>
                    <ToggleGroup
                      value={toggleValue}
                      onValueChange={setToggleValue}
                      items={[
                        { value: 'left', label: 'Left' },
                        { value: 'center', label: 'Center' },
                        { value: 'right', label: 'Right' },
                      ]}
                    />
                  </div>
                </Popover>
              </div>
            </Card>
          </Column>
        </Columns>
      ),
    },
    {
      id: 'tab3',
      label: 'Task Types',
      content: (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {(['feat', 'fix', 'bug', 'docs', 'refactor', 'chore'] as const).map((type) => (
            <Card
              key={type}
              title={`${type.toUpperCase()} Card`}
              className={`card-type-container card-type-${type}`}
            >
              <Text>
                This card showcases the <strong>{type}</strong> category with a high-signal vertical
                anchoring bar and a subtle gradient wash.
              </Text>
            </Card>
          ))}
        </div>
      ),
    },
  ];

  return (
    <div className="p-8">
      <Heading level={1}>Gold Standard Elements</Heading>
      <Tabs items={tabItems} />
    </div>
  );
}
