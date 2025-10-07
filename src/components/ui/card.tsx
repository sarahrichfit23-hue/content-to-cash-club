"use client";
import * as React from "react";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Card(props: CardProps) {
  return <div {...props} />;
}
