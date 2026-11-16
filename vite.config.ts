import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // relative base so the build works under any GitHub Pages repo name or host
  base: "./",
});
