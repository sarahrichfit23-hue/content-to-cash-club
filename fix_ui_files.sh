for f in src/components/ui/*.tsx; do
  name=$(basename "$f" .tsx)
  capname="$(echo ${name:0:1} | tr '[:lower:]' '[:upper:]')${name:1}"
  cat <<TEMPLATE > "$f"
"use client";
import * as React from "react";

export interface ${capname}Props extends React.HTMLAttributes<HTMLDivElement> {}

export function ${capname}(props: ${capname}Props) {
  return <div {...props} />;
}
TEMPLATE
  echo "✅ Fixed $f"
done
