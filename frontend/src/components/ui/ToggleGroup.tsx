/**
 * Copyright 2026 Jimmy Ma
 * SPDX-License-Identifier: MIT
 */

import * as RadixToggleGroup from '@radix-ui/react-toggle-group';

interface ToggleItem {
  value: string;
  label: string;
}

interface ToggleGroupProps {
  items: ToggleItem[];
  value: string;
  onValueChange: (value: string) => void;
}

export function ToggleGroup({ items, value, onValueChange }: ToggleGroupProps) {
  return (
    <RadixToggleGroup.Root
      className="toggle-group-root"
      type="single"
      value={value}
      onValueChange={(val) => {
        if (val) onValueChange(val);
      }}
    >
      {items.map((item) => (
        <RadixToggleGroup.Item key={item.value} className="toggle-group-item" value={item.value}>
          {item.label}
        </RadixToggleGroup.Item>
      ))}
    </RadixToggleGroup.Root>
  );
}
