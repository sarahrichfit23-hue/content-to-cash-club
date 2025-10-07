"use client";
import * as React from "react";

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Alert(props: AlertProps) {
  return <div {...props} />;
}
