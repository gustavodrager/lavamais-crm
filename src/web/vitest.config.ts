import path from "node:path";
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "server-only": path.resolve(__dirname, "../../tests/frontend/suporte/server-only.ts"),
      "@testing-library/react": path.resolve(__dirname, "node_modules/@testing-library/react/dist/index.js"),
      "@testing-library/user-event": path.resolve(__dirname, "node_modules/@testing-library/user-event/dist/esm/index.js"),
    },
  },
  server: { fs: { allow: [path.resolve(__dirname, "../.."), path.resolve(__dirname, "node_modules")] } },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: [path.resolve(__dirname, "vitest.setup.ts")],
    include: [path.resolve(__dirname, "../../tests/frontend/**/*.test.{ts,tsx}")],
  },
});
