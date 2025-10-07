"use client";
import * as React from "react";

export interface DialogProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Dialog(props: DialogProps) {
  return <div {...props} />;
}
