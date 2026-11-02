import { computed, onMounted, onScopeDispose, ref } from "vue";
import { useServices } from "../../../app/services";
import { useAsyncResource } from "../../../shared/composables/useAsyncResource";
import { guideProgress } from "../domain/guide";
import type { ReviewCase } from "../../cases/domain/case";
import type { Tip } from "../../tips/domain/tip";
export function useGuide() {
  const { cases, tips, workspace } = useServices();
  const caseId =
    workspace.getState().organization.casePrefix + "beatriz-santos";
  const resource = useAsyncResource<{
    record: ReviewCase | undefined;
    tips: Tip[];
  }>(
    async () => {
      const [records, items] = await Promise.all([
        cases.listReview(),
        tips.listTips(),
      ]);
      return { record: records.find((c) => c.id === caseId), tips: items };
    },
    { record: undefined, tips: [] },
  );
  const steps = computed(() =>
      guideProgress(resource.data.value.record, resource.data.value.tips),
    ),
    completed = computed(() => steps.value.filter((s) => s.done).length);
  const busy = ref(false),
    actionError = ref(""),
    resetOpen = ref(false),
    clearDrafts = ref(false);
  async function receive() {
    if (busy.value) return;
    busy.value = true;
    actionError.value = "";
    try {
      await tips.receiveExample(caseId, {
        idempotencyKey: `guide-tip:${caseId}`,
      });
      await resource.refresh();
    } catch (e) {
      actionError.value =
        e instanceof Error ? e.message : "Falha na demonstração.";
    } finally {
      busy.value = false;
    }
  }
  function reset() {
    try {
      workspace.reset(clearDrafts.value);
      resetOpen.value = false;
    } catch (e) {
      actionError.value =
        e instanceof Error ? e.message : "Não foi possível reiniciar.";
    }
  }
  onMounted(resource.refresh);
  onScopeDispose(cases.subscribe(resource.refresh));
  onScopeDispose(tips.subscribe(resource.refresh));
  return {
    ...resource,
    caseId,
    steps,
    completed,
    busy,
    actionError,
    receive,
    reset,
    resetOpen,
    clearDrafts,
  };
}
