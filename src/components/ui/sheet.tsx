"use client";
import * as React from "react";

export interface SheetProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Sheet(props: SheetProps) {
  return <div {...props} />;
}
