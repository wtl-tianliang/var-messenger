import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import vueJsx from "@vitejs/plugin-vue-jsx";
import electron from "vite-plugin-electron";
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vitejs.dev/config/
export default defineConfig({
  base: "./",
  server: {
    open: false,
  },
  build: {
    rollupOptions: {
      external: ["pg-hstore"],
    }
  },
  plugins: [
    vue(),
    vueJsx(),
    vueDevTools(),
    electron([
      {
        entry: "main/index.ts",
        vite: {
          build: {
            outDir: "dist",
            rollupOptions: {
              // Here are some C/C++ modules them can't be built properly
              external: [
                "@journeyapps/sqlcipher",
                "uuid"
              ],
            }
          },
        },
      },
      {
        entry: "main/preload.ts",
        vite: {
          build: {
            outDir: "dist"
          }
        },
        onstart(options) {
          options.reload();
        },
      },
    ]),
  ],
  resolve: {
    alias: {
      "@typings": fileURLToPath(new URL("./typings", import.meta.url)),
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
