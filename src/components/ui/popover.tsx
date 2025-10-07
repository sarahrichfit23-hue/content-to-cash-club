"use client";
import * as React from "react";

export interface PopoverProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Popover(props: PopoverProps) {
  return <div {...props} />;
}
