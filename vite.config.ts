// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@/components": path.resolve(__dirname, "./src/components"),
      "@/layouts": path.resolve(__dirname, "./src/layouts"),
      "@/modules": path.resolve(__dirname, "./src/modules"),
      "@/hooks": path.resolve(__dirname, "./src/hooks"),
      "@/stores": path.resolve(__dirname, "./src/stores"),
      "@/types": path.resolve(__dirname, "./src/types"),
      "@/utils": path.resolve(__dirname, "./src/utils"),
      "@/apis": path.resolve(__dirname, "./src/apis"),
      "@/consts": path.resolve(__dirname, "./src/consts"),
    },
  },
})