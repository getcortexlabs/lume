import { useRoute, useRouter } from "vue-router";
import { useDemoSession } from "./useDemoSession";
import { useServices } from "../../../app/services";
import {
  sessionDestination,
  sessionReturnPath,
  type SessionStatus,
} from "../domain/session";
export function useSessionActions() {
  const session = useDemoSession(),
    route = useRoute(),
    router = useRouter();
  const { simulation } = useServices();
  async function leave(status: Exclude<SessionStatus, "active">) {
    const target = sessionReturnPath(route.fullPath);
    // Let the editor's leave guard save or cancel before hiding the workspace.
    const failure = await router.push({
      path: sessionDestination(status),
      query: { returnTo: target },
    });
    if (!failure) session.change(status);
  }
  async function enter() {
    simulation.configure({ role: "reviewer" });
    session.change("active");
    await router.replace(sessionReturnPath(route.query.returnTo));
  }
  return { session, leave, enter };
}
