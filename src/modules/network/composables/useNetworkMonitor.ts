import { useRoute } from "vue-router";
import {
  ref,
  computed,
  onMounted,
  onServerPrefetch,
  onScopeDispose,
} from "vue";
import { useServices } from "../../../app/services";
import { useAsyncResource } from "../../../shared/composables/useAsyncResource";
import type { Partner, ConnectionState } from "../domain/network";
export function useNetworkMonitor() {
  const { network } = useServices();
  const resource = useAsyncResource<Partner[]>(
    () => network.listPartners(),
    [],
  );
  const route = useRoute();
  const selected = ref(
      typeof route.query.partner === "string" ? route.query.partner : "library",
    ),
    index = ref(0),
    busy = ref(false),
    actionError = ref("");
  const current = computed(() =>
    resource.data.value.find((p) => p.id === selected.value),
  );
  const visible = computed(
    () =>
      current.value?.deliveries.flatMap((d) =>
        d.snapshot ? [d.snapshot] : [],
      ) ?? [],
  );
  const active = computed(
    () => visible.value[index.value % (visible.value.length || 1)],
  );
  let timer: ReturnType<typeof setInterval> | undefined;
  onMounted(() => {
    resource.refresh();
    timer = setInterval(resource.refresh, 5000);
  });
  onServerPrefetch(resource.refresh);
  onScopeDispose(() => {
    clearInterval(timer);
  });
  onScopeDispose(network.subscribe(resource.refresh));
  async function run(
    action: "retry" | "expire" | "connection",
    state?: string,
  ) {
    if (!current.value || busy.value) return;
    busy.value = true;
    actionError.value = "";
    try {
      if (action === "connection")
        await network.setConnection(current.value.id, state as ConnectionState);
      else await network[action](current.value.id);
      await resource.refresh();
    } catch (e) {
      actionError.value =
        e instanceof Error ? e.message : "Falha na operação simulada.";
    } finally {
      busy.value = false;
    }
  }
  return {
    ...resource,
    selected,
    current,
    active,
    visible,
    index,
    busy,
    actionError,
    run,
  };
}
