import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig({
  root: "src",
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
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


