"use client";
import * as React from "react";

export interface LabelProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Label(props: LabelProps) {
  return <div {...props} />;
}
