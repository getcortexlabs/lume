import { defineNuxtPlugin } from "#app";
import {
  createPreferencesStore,
  preferencesKey,
} from "../modules/preferences/data/browser-preferences";
export default defineNuxtPlugin((app) => {
  const preferences = createPreferencesStore();
  app.vueApp.provide(preferencesKey, preferences);
  if (import.meta.client) {
    let disconnect: (() => void) | undefined;
    app.hook("app:mounted", () => {
      disconnect = preferences.connect(window);
    });
    app.vueApp.onUnmount(() => disconnect?.());
  }
});
