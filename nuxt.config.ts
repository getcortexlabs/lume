const socialImage = "https://lume.getcortexlabs.com/brand/lume-social.png";
const socialDescription =
  "Tecnologia e comunidade apoiando a busca por pessoas desaparecidas. Conheça a demonstração do Lume.";
const socialImageAlt =
  "Lume. Hope deserves better tools. Technology and community supporting the search for missing people.";

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
      link: [
        { rel: "icon", href: "/favicon.ico", sizes: "16x16 32x32 48x48" },
        {
          rel: "icon",
          type: "image/svg+xml",
          href: "/favicon.svg",
          sizes: "any",
        },
        {
          rel: "apple-touch-icon",
          href: "/apple-touch-icon.png",
          sizes: "180x180",
        },
      ],
      meta: [
        {
          name: "description",
          content:
            "Informação que conecta. Cuidado que aproxima. Uma demonstração da plataforma Lume.",
        },
        { name: "robots", content: "noindex,nofollow" },
        { name: "theme-color", content: "#21382d" },
        { property: "og:type", content: "website" },
        { property: "og:site_name", content: "Lume" },
        { property: "og:locale", content: "pt_BR" },
        { property: "og:title", content: "Lume — Cada pessoa importa" },
        { property: "og:description", content: socialDescription },
        { property: "og:image", content: socialImage },
        { property: "og:image:type", content: "image/png" },
        { property: "og:image:width", content: "1734" },
        { property: "og:image:height", content: "907" },
        { property: "og:image:alt", content: socialImageAlt },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: "Lume — Cada pessoa importa" },
        { name: "twitter:description", content: socialDescription },
        { name: "twitter:image", content: socialImage },
        { name: "twitter:image:alt", content: socialImageAlt },
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
