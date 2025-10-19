import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [react()],
    test: {
      environment: "jsdom",
      setupFiles: "./vitest.setup.ts",
    },
    server: {
      port: Number(env.VITE_PORT || 5175),
      proxy: {
        "/api": {
          target: env.VITE_LARAVEL_URL || "http://127.0.0.1:8001",
          changeOrigin: true,
        },
        "/storage": {
          target: env.VITE_LARAVEL_URL || "http://127.0.0.1:8001",
          changeOrigin: true,
        },
      },
    },
  };
});
