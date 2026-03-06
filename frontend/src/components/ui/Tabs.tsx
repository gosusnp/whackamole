/**
 * Copyright 2026 Jimmy Ma
 * SPDX-License-Identifier: MIT
 */

import * as RadixTabs from '@radix-ui/react-tabs';
import type { ComponentChildren } from 'preact';

interface TabItem {
  id: string;
  label: string;
  content: ComponentChildren;
}

interface TabsProps {
  items: TabItem[];
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
}

export function Tabs({ items, defaultValue, value, onValueChange }: TabsProps) {
  const defaultTab = defaultValue || items[0]?.id;

  return (
    <RadixTabs.Root
      className="tabs-root"
      defaultValue={defaultTab}
      value={value}
      onValueChange={onValueChange}
    >
      <RadixTabs.List className="tabs-list">
        {items.map((item) => (
          <RadixTabs.Trigger key={item.id} value={item.id} className="tabs-trigger">
            {item.label}
          </RadixTabs.Trigger>
        ))}
      </RadixTabs.List>
      {items.map((item) => (
        <RadixTabs.Content key={item.id} value={item.id} className="tabs-content">
          {item.content}
        </RadixTabs.Content>
      ))}
    </RadixTabs.Root>
  );
}
