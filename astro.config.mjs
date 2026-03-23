// @ts-check
import { defineConfig } from "astro/config";
import node from "@astrojs/node";
import vue from "@astrojs/vue";
import tailwindcss from "@tailwindcss/vite";

// On utilise import.meta.env (syntaxe Astro) ou on type process pour éviter l'erreur
// @ts-ignore
const SITE_URL = process.env.SITE_URL || "https://slurpy.nicolas-thai.fr";

export default defineConfig({
  site: SITE_URL,

  output: "server",
  adapter: node({
    mode: "standalone",
  }),

  security: {
    checkOrigin: true,
    // On transforme la string en objet pour plaire à TypeScript
    allowedDomains: [
      {
        hostname: "slurpy.nicolas-thai.fr",
      },
    ],
  },

  integrations: [vue()],

  vite: {
    plugins: [tailwindcss()],
    server: {
      allowedHosts: ["slurpy.nicolas-thai.fr"],
    },
  },
});
