"use client";
import * as React from "react";

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Avatar(props: AvatarProps) {
  return <div {...props} />;
}
