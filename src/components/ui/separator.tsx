"use client";
import * as React from "react";

export interface SeparatorProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Separator(props: SeparatorProps) {
  return <div {...props} />;
}
