import { ref, onMounted, onScopeDispose } from "vue";
import { useServices } from "../../../app/services";
import { useAsyncResource } from "../../../shared/composables/useAsyncResource";
import {
  emptySource,
  type ManagedSource,
  type SourceInput,
} from "../domain/source";
export function useSources() {
  const { sources } = useServices();
  const resource = useAsyncResource(
    () => sources.listSources(),
    [] as ManagedSource[],
  );
  const selected = ref<ManagedSource | null>(null),
    editing = ref(false),
    input = ref(emptySource()),
    busy = ref(false),
    actionError = ref(""),
    message = ref("");
  onMounted(resource.refresh);
  onScopeDispose(sources.subscribe(resource.refresh));
  function edit(source: ManagedSource | null) {
    selected.value = source;
    input.value = source
      ? {
          name: source.name,
          url: source.url,
          owner: source.owner,
          frequencyHours: source.frequencyHours,
          enabled: source.enabled,
        }
      : emptySource();
    editing.value = true;
    actionError.value = "";
  }
  async function run(
    action: "save" | "check" | "recover",
    source?: ManagedSource,
  ) {
    if (busy.value) return;
    busy.value = true;
    actionError.value = "";
    message.value = "";
    try {
      if (action === "save") {
        await sources.saveSource(
          selected.value?.id ?? null,
          { ...input.value } as SourceInput,
          selected.value?.revision,
        );
        editing.value = false;
        message.value =
          "Fonte fictícia salva. Nenhuma coleta externa foi iniciada.";
      } else if (source) {
        if (action === "check") await sources.checkSource(source.id);
        else await sources.simulateSourceUpdate(source.id);
        message.value =
          action === "check"
            ? "Consulta simulada concluída. A data de atualização da fonte foi preservada."
            : "Recuperação e atualização simuladas. Nenhum aviso foi publicado automaticamente.";
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
  return {
    ...resource,
    selected,
    editing,
    input,
    busy,
    actionError,
    message,
    edit,
    run,
  };
}
