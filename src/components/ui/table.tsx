"use client";
import * as React from "react";

export interface TableProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Table(props: TableProps) {
  return <div {...props} />;
}
