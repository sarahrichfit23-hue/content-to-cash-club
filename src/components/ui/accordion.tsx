"use client";
import * as React from "react";

export interface AccordionProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Accordion(props: AccordionProps) {
  return <div {...props} />;
}
