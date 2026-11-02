import { defineNuxtRouteMiddleware, navigateTo, useNuxtApp } from "#app";
import {
  isOrganizationPath,
  sessionDestination,
  sessionReturnPath,
} from "../modules/session/domain/session";
export default defineNuxtRouteMiddleware((to) => {
  if (import.meta.server || !isOrganizationPath(to.path)) return;
  const session = useNuxtApp().$demoSession;
  if (session.status.value !== "active")
    return navigateTo(
      {
        path: sessionDestination(session.status.value),
        query: { returnTo: sessionReturnPath(to.fullPath) },
      },
      { replace: true },
    );
});
