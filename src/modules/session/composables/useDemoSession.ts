import { inject } from "vue";
import { sessionKey } from "../data/demo-session";
export function useDemoSession() {
  const session = inject(sessionKey);
  if (!session)
    throw new Error("Demo session must be provided at the app boundary.");
  return session;
}
