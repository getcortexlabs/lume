import { readonly, ref, type InjectionKey } from "vue";
import { sessionStorageKey, type SessionStatus } from "../domain/session";

/** Presentation-only simulation. This store grants no server permissions. */
export function createDemoSession() {
  const status = ref<SessionStatus>("active");
  const message = ref("");
  let storage: (() => Storage) | undefined;
  function connect(target: () => Storage) {
    storage = target;
    try {
      const raw = target().getItem(sessionStorageKey);
      if (!raw) return;
      const saved = JSON.parse(raw);
      if (
        saved.version !== 1 ||
        !["active", "signed-out", "expired", "denied"].includes(saved.status)
      )
        throw new Error();
      status.value = saved.status;
    } catch {
      status.value = "signed-out";
      message.value =
        "Não foi possível recuperar a sessão de demonstração. Entre novamente para continuar.";
    }
  }
  function change(next: SessionStatus) {
    status.value = next;
    message.value = "";
    try {
      if (!storage) throw new Error();
      storage().setItem(
        sessionStorageKey,
        JSON.stringify({ version: 1, status: next }),
      );
    } catch {
      message.value =
        "A mudança vale nesta página. Não foi possível guardar a sessão neste navegador.";
    }
  }
  return {
    status: readonly(status),
    message: readonly(message),
    connect,
    change,
  };
}
export type DemoSession = ReturnType<typeof createDemoSession>;
export const sessionKey: InjectionKey<DemoSession> =
  Symbol("lume.demo-session");
