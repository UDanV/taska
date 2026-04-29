"use client";

import type { ComponentProps, ReactNode } from "react";
import { Select, SelectItem } from "@heroui/react";

type SelectUIProps = Omit<ComponentProps<typeof Select>, "children"> & {
  children?: ReactNode;
};

export function SelectUI({ classNames, ...props }: SelectUIProps) {
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

export const SelectItemUI = SelectItem;