"use client";
import * as React from "react";

export interface ToasterProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Toaster(props: ToasterProps) {
  return <div {...props} />;
}
