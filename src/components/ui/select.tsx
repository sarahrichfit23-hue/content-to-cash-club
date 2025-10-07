"use client";
import * as React from "react";

export interface SelectProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Select(props: SelectProps) {
  return <div {...props} />;
}
