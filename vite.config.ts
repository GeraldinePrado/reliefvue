import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const entry = (name: string) => fileURLToPath(new URL(name, import.meta.url));

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  define: {
    "import.meta.env.VITE_PUBLIC_DEMO": JSON.stringify(
      mode === "public" ? "1" : "0",
    ),
  },
  server: {
    host: "127.0.0.1",
    port: 5173,
    strictPort: true,
    proxy: {
      "/api": { target: "http://127.0.0.1:8787", changeOrigin: false },
      "/papi": {
        target: "http://127.0.0.1:8788",
        changeOrigin: false,
        rewrite: (path) => path.replace(/^\/papi/, "/api"),
      },
    },
  },
  preview: { host: "127.0.0.1", port: 4173, strictPort: true },
  build: {
    sourcemap: false,
    rollupOptions: {
      input: { main: entry("index.html"), app: entry("app.html") },
    },
  },
}));
