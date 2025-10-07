"use client";
import * as React from "react";

export interface SwitchProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Switch(props: SwitchProps) {
  return <div {...props} />;
}
