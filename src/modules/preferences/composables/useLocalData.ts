import { computed, onMounted, onScopeDispose, ref } from "vue";
import { usePreferences } from "./usePreferences";
import { useWorkspace } from "../../workspaces/composables/useWorkspace";
export type LocalDataKind = "searches" | "preferences" | "drafts";
export function useLocalData() {
  const preferences = usePreferences();
  const { workspace, state: workspaceState } = useWorkspace();
  const selected = ref<LocalDataKind | null>(null),
    message = ref(""),
    error = ref("");
  const open = ref(false);
  const draftCount = ref<number | null>(null);
  const organization = computed(() => workspaceState.value.organization.name);
  const selectedOrganization = ref("");
  const descriptions = computed(() => ({
    searches:
      "Todas as buscas salvas neste navegador serão excluídas. Sua região, leitura e rascunhos serão mantidos.",
    preferences:
      "Sua região, tamanho do texto, contraste e movimento voltarão ao padrão. Buscas salvas e rascunhos serão mantidos.",
    drafts: `Os rascunhos já salvos de ${organization.value} serão excluídos deste navegador, inclusive em outras abas. Isso não pode ser desfeito. Publicações e rascunhos de outras organizações serão mantidos.`,
  }));
  function refresh() {
    try {
      draftCount.value = workspace.localDraftCount();
    } catch {
      draftCount.value = null;
    }
  }
  function begin(kind: LocalDataKind) {
    selected.value = kind;
    open.value = true;
    selectedOrganization.value = workspaceState.value.organization.id;
    error.value = "";
    message.value = "";
  }
  function confirm() {
    const kind = selected.value;
    if (!kind) return;
    try {
      if (kind === "drafts") {
        if (selectedOrganization.value !== workspace.getState().organization.id)
          throw new Error(
            "A organização mudou. Feche esta confirmação e confira a organização antes de excluir.",
          );
        workspace.clearLocalDrafts();
      } else preferences.clearLocal(kind);
      message.value =
        kind === "drafts"
          ? "Rascunhos desta organização excluídos deste navegador."
          : kind === "searches"
            ? "Buscas salvas excluídas deste navegador."
            : "Preferências restauradas neste navegador.";
      open.value = false;
      refresh();
    } catch (failure) {
      error.value =
        failure instanceof Error
          ? failure.message
          : "Não foi possível concluir a exclusão.";
    }
  }
  onMounted(() => {
    refresh();
    window.addEventListener("storage", refresh);
  });
  onScopeDispose(workspace.subscribe(refresh));
  onScopeDispose(() => {
    if (typeof window !== "undefined")
      window.removeEventListener("storage", refresh);
  });
  return {
    preferences,
    selected,
    open,
    message,
    error,
    draftCount,
    organization,
    descriptions,
    begin,
    confirm,
  };
}
