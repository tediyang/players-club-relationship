import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "https://players-club-relationship.onrender.com",
        changeOrigin: true,
      },
    },
  },
  preview: {
    port: 4173,
  },
});
