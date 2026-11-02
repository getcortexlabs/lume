import { computed, onMounted, onScopeDispose, ref } from "vue";
import { useServices } from "../../../app/services";
import { useAsyncResource } from "../../../shared/composables/useAsyncResource";
import type { LumeNotification } from "../domain/notification";
export function useNotifications() {
  const { notifications } = useServices();
  const resource = useAsyncResource<LumeNotification[]>(
    () => notifications.list(),
    [],
  );
  const unreadOnly = ref(false),
    actionError = ref("");
  onMounted(resource.refresh);
  onScopeDispose(notifications.subscribe(resource.refresh));
  const unread = computed(
    () => resource.data.value.filter((n) => !n.read).length,
  );
  const visible = computed(() =>
    resource.data.value.filter((n) => !unreadOnly.value || !n.read),
  );
  async function read(id?: string) {
    try {
      actionError.value = "";
      if (id) await notifications.markRead(id);
      else await notifications.markAllRead();
    } catch (e) {
      actionError.value =
        e instanceof Error ? e.message : "Falha ao atualizar.";
    }
  }
  return { ...resource, unreadOnly, unread, visible, read, actionError };
}
