"use client";
import * as React from "react";

export interface SonnerProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Sonner(props: SonnerProps) {
  return <div {...props} />;
}
