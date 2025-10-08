for file in accordion alert alert-dialog avatar badge button card checkbox dialog dropdown-menu input label popover radio-group select separator sheet skeleton slider switch table tabs textarea tooltip; do
  cat <<'TEMPLATE' > "src/components/ui/$file.tsx"
"use client";
import * as React from "react";
export interface ${file^}Props extends React.HTMLAttributes<HTMLDivElement> {}
export function ${file^}(props: ${file^}Props) {
  return <div {...props} />;
}
TEMPLATE
  echo "✅ Created src/components/ui/$file.tsx"
done
