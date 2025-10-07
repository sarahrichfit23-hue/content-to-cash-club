"use client";
import * as React from "react";

export interface TextareaProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Textarea(props: TextareaProps) {
  return <div {...props} />;
}
