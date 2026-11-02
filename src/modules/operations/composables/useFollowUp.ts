import { ref, computed, onMounted, onScopeDispose } from "vue";
import { useServices } from "../../../app/services";
import { useAsyncResource } from "../../../shared/composables/useAsyncResource";
import {
  buildFollowUpTasks,
  type FollowUpTask,
  type SourceHealth,
} from "../domain/operations";
export function useFollowUp() {
  const { cases, network, operations } = useServices();
  const resource = useAsyncResource(
    async () => {
      const [records, partners, sources] = await Promise.all([
        cases.listReview(),
        network.listPartners(),
        operations.listSources(),
      ]);
      return {
        tasks: buildFollowUpTasks(records, partners, sources, Date.now()),
        sources,
      };
    },
    { tasks: [] as FollowUpTask[], sources: [] as SourceHealth[] },
  );
  const filter = ref("all"),
    busy = ref(false),
    actionError = ref(""),
    message = ref("");
  const visible = computed(() =>
    resource.data.value.tasks.filter(
      (t) => filter.value === "all" || t.kind === filter.value,
    ),
  );
  let timer: ReturnType<typeof setInterval> | undefined;
  onMounted(() => {
    resource.refresh();
    timer = setInterval(resource.refresh, 30000);
  });
  onScopeDispose(() => clearInterval(timer));
  onScopeDispose(cases.subscribe(resource.refresh));
  onScopeDispose(network.subscribe(resource.refresh));
  async function updateSource(id: string) {
    if (busy.value) return;
    busy.value = true;
    actionError.value = "";
    message.value = "";
    try {
      await operations.simulateSourceUpdate(id);
      await resource.refresh();
      message.value =
        "Atualização fictícia registrada. Nenhuma fonte externa foi consultada.";
    } catch (e) {
      actionError.value =
        e instanceof Error ? e.message : "Não foi possível atualizar.";
    } finally {
      busy.value = false;
    }
  }
  return {
    ...resource,
    filter,
    visible,
    busy,
    actionError,
    message,
    updateSource,
  };
}
