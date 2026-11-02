import { defineNuxtPlugin } from "#app";
import {
  createDemoSession,
  sessionKey,
} from "../modules/session/data/demo-session";
export default defineNuxtPlugin((app) => {
  const session = createDemoSession();
  app.vueApp.provide(sessionKey, session);
  // Restore before the initial route middleware runs. No session state enters SSR.
  if (import.meta.client) session.connect(() => window.sessionStorage);
  return { provide: { demoSession: session } };
});
