import { ref, onMounted, onScopeDispose } from "vue";
import { useServices } from "../../../app/services";
import { useAsyncResource } from "../../../shared/composables/useAsyncResource";
import type { CaseDraft } from "../domain/draft";
export function useDrafts() {
  const { cases } = useServices();
  const resource = useAsyncResource(
    () => cases.listDrafts(),
    [] as CaseDraft[],
  );
  const selected = ref<CaseDraft | null>(null),
    busy = ref(false),
    actionError = ref(""),
    message = ref("");
  function onStorage() {
    void resource.refresh();
  }
  onMounted(() => {
    resource.refresh();
    window.addEventListener("storage", onStorage);
  });
  onScopeDispose(() => {
    if (typeof window !== "undefined")
      window.removeEventListener("storage", onStorage);
  });
  onScopeDispose(cases.subscribe(resource.refresh));
  async function run(action: "delete" | "duplicate", draft: CaseDraft) {
    if (busy.value) return;
    busy.value = true;
    actionError.value = "";
    message.value = "";
    try {
      const context = {
        idempotencyKey: `${action}:${draft.id}:${draft.revision}:${crypto.randomUUID()}`,
      };
      if (action === "delete") {
        await cases.deleteDraft(draft.id, draft.revision, context);
        selected.value = null;
        message.value = "Rascunho excluído deste navegador.";
      } else {
        await cases.duplicateDraft(draft.id, draft.revision, context);
        message.value =
          "Cópia criada. A autorização precisa ser conferida novamente.";
      }
      await resource.refresh();
    } catch (e) {
      actionError.value =
        e instanceof Error ? e.message : "Não foi possível concluir.";
      await resource.refresh();
    } finally {
      busy.value = false;
    }
  }
  return { ...resource, selected, busy, actionError, message, run };
}
