import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// This is a special debug configuration for Vite
// It includes additional error reporting and source mapping
export default defineConfig({
  plugins: [
    react({
      // Better React error reporting
      jsxRuntime: "automatic",
      babel: {
        plugins: [
          ["babel-plugin-transform-vite-meta-env"],
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client", "src"),
      "@shared": path.resolve(__dirname, "shared"),
      "@assets": path.resolve(__dirname, "attached_assets"),
    },
  },
  root: path.resolve(__dirname, "client"),
  build: {
    outDir: path.resolve(__dirname, "dist/public"),
    emptyOutDir: true,
    // Improved source maps for better debugging
    sourcemap: true,
  },
  server: {
    // Improved error handling
    fs: {
      strict: false, // Less strict for debugging
    },
    hmr: {
      overlay: true,
    },
  },
  // Better error reporting
  esbuild: {
    logOverride: { 'this-is-undefined-in-esm': 'silent' }
  },
  envDir: "./",
});