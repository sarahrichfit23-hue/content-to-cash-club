#!/bin/bash

echo "🔍 Scanning for missing components..."

grep -rhoE "@/components/[A-Za-z0-9_/]*" src | sed 's/@\/components\///' | sort -u | while read path; do
  file="src/components/$path.tsx"
  if [ ! -f "$file" ]; then
    mkdir -p "$(dirname "$file")"
    name=$(basename "$file" .tsx)
    capname="$(echo ${name:0:1} | tr '[:lower:]' '[:upper:]')${name:1}"
    cat <<TEMPLATE > "$file"
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
  file="src/components/$path.tsx"
  if [ ! -f "$file" ]; then
    mkdir -p "$(dirname "$file")"
    name=$(basename "$file" .tsx)
    capname="$(echo ${name:0:1} | tr '[:lower:]' '[:upper:]')${name:1}"
    cat <<TEMPLATE > "$file"
"use client";
import * as React from "react";

export default function ${capname}() {
  return (
    <div style={{ padding: "1.5rem", border: "1px dashed #aaa", margin: "1rem" }}>
      <h3>${capname} Placeholder</h3>
      <p>This component was auto-generated to resolve a missing import.</p>
    </div>
  );
}
TEMPLATE
    echo "✅ Created: $file"
  fi
done

echo "✨ Done! All missing components have been created."
