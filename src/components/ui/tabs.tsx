"use client";
import * as React from "react";

export interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Tabs(props: TabsProps) {
  return <div {...props} />;
}
