"use client";
import * as React from "react";

export interface InputProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Input(props: InputProps) {
  return <div {...props} />;
}
