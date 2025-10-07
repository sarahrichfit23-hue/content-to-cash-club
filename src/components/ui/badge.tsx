"use client";
import * as React from "react";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Badge(props: BadgeProps) {
  return <div {...props} />;
}
