"use client";
import * as React from "react";

export interface SliderProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Slider(props: SliderProps) {
  return <div {...props} />;
}
