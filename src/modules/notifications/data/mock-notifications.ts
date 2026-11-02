import type {
  LumeNotification,
  NotificationsRepository,
} from "../domain/notification";
/** Bounded, application-scoped events. No email, push or external delivery. */
export function createNotifications(authorize: () => void, prefix = "") {
  let sequence = 1;
  const items: LumeNotification[] = [
    {
      id: "notice-1",
      title: "Uma revisão precisa de atenção",
      detail: "Há registros fictícios aguardando conferência.",
      href: `/organization?case=${prefix}beatriz-santos`,
      createdAt: new Date().toISOString(),
      read: false,
    },
  ];
  const listeners = new Set<() => void>(),
    emit = () => listeners.forEach((l) => l());
  const repository: NotificationsRepository = {
    async list() {
      authorize();
      return structuredClone(items);
    },
    async markRead(id) {
      authorize();
      const item = items.find((n) => n.id === id);
      if (item) item.read = true;
      emit();
    },
    async markAllRead() {
      authorize();
      items.forEach((n) => (n.read = true));
      emit();
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
  function publish(title: string, detail: string, href: string) {
    items.unshift({
      id: `notice-${++sequence}`,
      title,
      detail,
      href,
      createdAt: new Date().toISOString(),
      read: false,
    });
    items.splice(80);
    emit();
  }
  return { repository, publish };
}
