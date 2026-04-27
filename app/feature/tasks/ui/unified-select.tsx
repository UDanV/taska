"use client";

import type { ComponentProps } from "react";
import { Select, SelectItem } from "@heroui/react";

type UnifiedSelectProps = Omit<ComponentProps<typeof Select>, "children"> & {
  children?: any;
};

export function UnifiedSelect({ classNames, ...props }: UnifiedSelectProps) {
  return (
    <Select
      classNames={{
        trigger: "h-11 rounded-xl border border-border bg-background px-3 text-sm shadow-none",
        ...classNames,
      }}
      {...(props as ComponentProps<typeof Select>)}
    />
  );
}

export const UnifiedSelectItem = SelectItem;
