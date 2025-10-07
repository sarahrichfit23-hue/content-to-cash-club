"use client";

import * as React from "react";

export interface TooltipProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Tooltip(props: TooltipProps) {
  return <div {...props} />;
}
