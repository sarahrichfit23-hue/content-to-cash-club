import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { fileURLToPath, URL } from "node:url";
export default defineConfig({
  root: "src", // tells Vite the app starts in /src
  plugins: [react()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  build: {
    outDir: "../dist", // the folder where Vercel will find your built site
    emptyOutDir: true, // clear it before rebuilding
  },
  publicDir: "../public", // points to the public folder for images, icons, etc.
});
