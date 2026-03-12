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
  extra?: ComponentChildren;
  notificationCount?: number;
}

interface TabsProps {
  items: TabItem[];
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  headerExtra?: ComponentChildren;
}

export function Tabs({ items, defaultValue, value, onValueChange, headerExtra }: TabsProps) {
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
            {item.notificationCount !== undefined && item.notificationCount > 0 && (
              <span className="bg-primary text-primary-foreground ml-2 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[10px] font-bold shadow-sm">
                {item.notificationCount}
              </span>
            )}
            {item.extra}
          </RadixTabs.Trigger>
        ))}
        {headerExtra}
      </RadixTabs.List>
      {items.map((item) => (
        <RadixTabs.Content key={item.id} value={item.id} className="tabs-content">
          {item.content}
        </RadixTabs.Content>
      ))}
    </RadixTabs.Root>
  );
}
