import { defineConfig } from "vite";

export default defineConfig(({ mode }) => ({
  define: {
    "import.meta.env.VITE_PUBLIC_DEMO": JSON.stringify(
      mode === "public" ? "1" : "0",
    ),
  },
  server: {
    host: "127.0.0.1",
    port: 5173,
    strictPort: true,
    proxy: { "/api": { target: "http://127.0.0.1:8787", changeOrigin: false } },
  },
  preview: { host: "127.0.0.1", port: 4173, strictPort: true },
  build: { sourcemap: false },
}));
