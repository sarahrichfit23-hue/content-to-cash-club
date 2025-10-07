import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

export default defineConfig({
  plugins: [react()],
});

  },
  build: {
    outDir: "../dist",
    emptyOutDir: true,
  },
  publicDir: "../public",
  server: {
    host: "::",
    port: 8080,
  },
});


