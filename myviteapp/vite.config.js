import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  /** Where Vite forwards /api (must match backend listen port). */
  const apiProxyTarget =
    env.VITE_API_PROXY_TARGET || env.API_PROXY_TARGET || "http://127.0.0.1:5000";

  return {
    plugins: [react()],
    server: {
      port: 8000,
      strictPort: false,
      proxy: {
        "/api": {
          target: apiProxyTarget,
          changeOrigin: true,
        },
      },
    },
    preview: {
      port: 8000,
      strictPort: false,
      proxy: {
        "/api": {
          target: apiProxyTarget,
          changeOrigin: true,
        },
      },
    },
  };
});
