"use client";
import * as React from "react";

export interface CheckboxProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Checkbox(props: CheckboxProps) {
  return <div {...props} />;
}
