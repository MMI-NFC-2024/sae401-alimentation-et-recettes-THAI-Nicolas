// @ts-check
import { defineConfig } from "astro/config";
import node from "@astrojs/node";
import vue from "@astrojs/vue";
import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
  integrations: [vue()],
  vite: {
    plugins: [tailwindcss()],
  },
  output: "server",
  adapter: node({
    mode: "standalone",
  }),
});
