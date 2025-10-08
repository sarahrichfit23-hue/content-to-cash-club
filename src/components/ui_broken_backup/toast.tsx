"use client";
import * as React from "react*

chmod +x fix_missing_components.sh

./fix_missing_components.sh

git add src/components
git commit -m "Auto-generate missing component placeholders"
git push

cat <<'EOF' > fix_missing_components.sh
#!/bin/bash

echo "🔍 Scanning for missing components..."

grep -rhoE "@/components/[A-Za-z0-9_/]*" src | sed 's/@\/components\///' | sort -u | while read path; do
  file="src/components/ui/toast.tsx"
  if [ ! -f "src/components/ui/toast.tsx" ]; then
    mkdir -p "src/components/ui"
    name=toast
    capname="Toast"
    cat <<TEMPLATE > "src/components/ui/toast.tsx"
"use client";
import * as React from "react";

export default function Toast() {
  return (
    <div style={{ padding: "1.5rem", border: "1px dashed #aaa", margin: "1rem" }}>
      <h3>Toast Placeholder</h3>
      <p>This component was auto-generated to resolve a missing import.</p>
    </div>
  );
}
