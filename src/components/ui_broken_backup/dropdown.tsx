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
  file="src/components/ui/dropdown.tsx"
  if [ ! -f "src/components/ui/dropdown.tsx" ]; then
    mkdir -p "src/components/ui"
    name=dropdown
    capname="Dropdown"
    cat <<TEMPLATE > "src/components/ui/dropdown.tsx"
"use client";
import * as React from "react";

export default function Dropdown() {
  return (
    <div style={{ padding: "1.5rem", border: "1px dashed #aaa", margin: "1rem" }}>
      <h3>Dropdown Placeholder</h3>
      <p>This component was auto-generated to resolve a missing import.</p>
    </div>
  );
}
