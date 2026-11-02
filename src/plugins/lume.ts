import { createBrowserDraftStore } from "../modules/intake/data/browser-draft-store";
import { defineNuxtPlugin, useState, useRequestEvent } from "#app";
import { setResponseStatus } from "h3";
import { createMavis } from "@getcortexlabs/mavis-web";
import { createDemoServices } from "../app/create-services";
import { servicesKey } from "../app/services";
import { lumeTheme } from "../app/theme";
import { resourceHydrationKey } from "../shared/composables/resource-hydration";
export default defineNuxtPlugin((nuxtApp) => {
  const snapshots = useState<Record<string, unknown>>(
    "lume:public-resources",
    () => ({}),
  );
  const event = useRequestEvent();
  nuxtApp.vueApp.use(
    createMavis({
      theme: lumeTheme,
      appearance: "light",
      toast: { closeLabel: "Fechar notificação" },
    }),
  );
  nuxtApp.vueApp.provide(
    servicesKey,
    createDemoServices(
      import.meta.client
        ? createBrowserDraftStore(() => window.localStorage)
        : undefined,
      import.meta.client
        ? (id) =>
            createBrowserDraftStore(
              () => window.localStorage,
              `lume:demo-drafts:v1:${id}`,
            )
        : undefined,
    ),
  );
  nuxtApp.vueApp.provide(resourceHydrationKey, {
    reuse: () => Boolean(import.meta.server || nuxtApp.isHydrating),
    has: (key) => Object.hasOwn(snapshots.value, key),
    read: (key) => snapshots.value[key],
    write: (key, data) => {
      if (!import.meta.server) return;
      snapshots.value[key] = data;
      if (event && key.startsWith("cases:detail:")) {
        const state = (data as { state?: string }).state;
        if (state === "unavailable") setResponseStatus(event, 404);
        if (state === "withdrawn") setResponseStatus(event, 410);
      }
    },
  });
});
