export default defineNuxtConfig({
  compatibilityDate: "2026-11-02",
  srcDir: "src/",
  dir: { public: "public" },
  devtools: { enabled: false },
  telemetry: false,
  css: ["@getcortexlabs/mavis-web/style.css", "~/shared/styles/main.css"],
  app: {
    head: {
      htmlAttrs: { lang: "pt-BR" },
      title: "Lume — Cada pessoa importa",
      meta: [
        {
          name: "description",
          content:
            "Informação que conecta. Cuidado que aproxima. Uma demonstração da plataforma Lume.",
        },
        { name: "robots", content: "noindex,nofollow" },
      ],
    },
  },
  routeRules: {
    "/embed": { ssr: false, headers: { "Cache-Control": "no-store" } },
    "/screen": { ssr: false, headers: { "Cache-Control": "no-store" } },
    "/organization": { ssr: false, headers: { "Cache-Control": "no-store" } },
    "/organization/**": {
      ssr: false,
      headers: { "Cache-Control": "no-store" },
    },
    "/cases/**": { headers: { "Cache-Control": "no-store" } },
  },
  nitro: { preset: "node-server" },
  vite: { define: { __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: true } },
  typescript: { strict: true },
});
