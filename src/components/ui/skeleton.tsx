"use client";
import * as React from "react";

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Skeleton(props: SkeletonProps) {
  return <div {...props} />;
}
