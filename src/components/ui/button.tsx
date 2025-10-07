"use client";
import * as React from "react";

export interface ButtonProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Button(props: ButtonProps) {
  return <div {...props} />;
}
