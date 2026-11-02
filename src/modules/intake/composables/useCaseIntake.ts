import { RepositoryError } from "../../cases/domain/api";
import {
  mergeDraftConflict,
  type DraftConflict,
  type ConflictChoices,
} from "../domain/draft-conflict";
import { ref, computed, watch, onMounted, onBeforeUnmount } from "vue";
import { useRoute, useRouter, onBeforeRouteLeave } from "vue-router";
import { useServices } from "../../../app/services";
import { emptyDraft, validateDraft } from "../domain/draft";
export function useCaseIntake() {
  const { cases } = useServices(),
    route = useRoute(),
    router = useRouter();
  const input = ref(emptyDraft()),
    step = ref(0),
    revision = ref(0);
  const initialId = route.params.id ?? route.query.draft;
  const id = ref<string | null>(
    typeof initialId === "string" ? initialId : null,
  );
  const busy = ref(false),
    saving = ref(false),
    ready = ref(false),
    error = ref(""),
    message = ref("");
  const conflict = ref<DraftConflict | null>(null);
  const issues = ref<string[]>([]),
    saved = ref(JSON.stringify(input.value)),
    savedAt = ref("");
  const dirty = computed(() => JSON.stringify(input.value) !== saved.value);
  const saveStatus = computed(() =>
    saving.value
      ? "Salvando neste navegador…"
      : dirty.value
        ? "Alterações ainda não salvas."
        : savedAt.value
          ? "Salvo neste navegador."
          : "O rascunho será salvo automaticamente.",
  );
  let timer: ReturnType<typeof setTimeout> | undefined;
  let pending: Promise<boolean> | undefined;
  let leaving = false;
  async function persist(): Promise<boolean> {
    clearTimeout(timer);
    if (conflict.value) return false;
    if (pending) {
      await pending;
      return dirty.value ? persist() : !error.value;
    }
    if (!ready.value || (!dirty.value && id.value)) return true;
    const snapshot = { ...input.value };
    saving.value = true;
    error.value = "";
    pending = (async () => {
      try {
        const draft = await cases.saveDraft(id.value, snapshot, revision.value);
        id.value = draft.id;
        revision.value = draft.revision;
        saved.value = JSON.stringify(snapshot);
        savedAt.value = draft.updatedAt;
        return true;
      } catch (e) {
        if (
          id.value &&
          e instanceof RepositoryError &&
          (e.code === "conflict" || e.code === "not_found")
        ) {
          try {
            conflict.value = {
              base: JSON.parse(saved.value),
              local: { ...input.value },
              remote: await cases.getDraft(id.value),
            };
          } catch {
            /* Keep the original error when the latest revision is unavailable. */
          }
        }
        error.value =
          e instanceof Error ? e.message : "Não foi possível salvar.";
        return false;
      } finally {
        saving.value = false;
      }
    })();
    const result = await pending;
    pending = undefined;
    if (
      result &&
      !route.params.id &&
      route.query.draft !== id.value &&
      !leaving
    )
      await router.replace({ query: { ...route.query, draft: id.value } });
    return result;
  }
  watch(
    input,
    () => {
      if (!ready.value || conflict.value) return;
      clearTimeout(timer);
      if (dirty.value) timer = setTimeout(() => void persist(), 700);
    },
    { deep: true, flush: "sync" },
  );
  function beforeUnload(event: BeforeUnloadEvent) {
    if (dirty.value || saving.value) {
      event.preventDefault();
      event.returnValue = "";
    }
  }
  onMounted(async () => {
    window.addEventListener("beforeunload", beforeUnload);
    try {
      if (id.value) {
        const draft = await cases.getDraft(id.value);
        if (!draft)
          throw new Error("Este rascunho não está disponível neste navegador.");
        input.value = draft.input;
        revision.value = draft.revision;
        saved.value = JSON.stringify(input.value);
        savedAt.value = draft.updatedAt;
      }
      ready.value = true;
    } catch (e) {
      error.value =
        e instanceof Error ? e.message : "Não foi possível carregar.";
    }
  });
  onBeforeUnmount(() => {
    clearTimeout(timer);
    window.removeEventListener("beforeunload", beforeUnload);
  });
  onBeforeRouteLeave(async () => {
    leaving = true;
    if (!dirty.value && !pending) return true;
    const ok = await persist();
    if (!ok) {
      leaving = window.confirm(
        "Há alterações não salvas. Sair e perder essas alterações?",
      );
      return leaving;
    }
    return true;
  });
  async function resolveConflict(
    action: "merge" | "remote" | "copy",
    choices: ConflictChoices = {},
  ) {
    const current = conflict.value;
    if (!current || saving.value || busy.value) return;
    try {
      ready.value = false;
      const next =
        action === "merge"
          ? mergeDraftConflict(current, choices)
          : action === "remote"
            ? current.remote!.input
            : { ...current.local, authorized: false };
      input.value = { ...next };
      if (action === "copy") {
        id.value = null;
        revision.value = 0;
        saved.value = JSON.stringify(emptyDraft());
      } else {
        revision.value = current.remote!.revision;
        saved.value = JSON.stringify(current.remote!.input);
        savedAt.value = current.remote!.updatedAt;
      }
      conflict.value = null;
      error.value = "";
      ready.value = true;
      if (action !== "remote") {
        if (!(await persist())) return;
        if (action === "copy")
          await router.replace(`/organization/drafts/${id.value}`);
      }
    } catch (e) {
      error.value =
        e instanceof Error ? e.message : "Não foi possível combinar.";
    } finally {
      ready.value = true;
    }
  }
  function next() {
    issues.value = validateDraft(input.value, step.value);
    if (!issues.value.length) step.value = Math.min(3, step.value + 1);
  }
  async function save(submit = false) {
    if (busy.value || !ready.value) return;
    issues.value = submit ? validateDraft(input.value) : [];
    if (issues.value.length) return;
    busy.value = true;
    message.value = "";
    try {
      if (!(await persist()) || !id.value) return;
      // Flush edits made during a delayed mock save before a transition.
      if (dirty.value && !(await persist())) return;
      if (submit) {
        const caseId = await cases.submitDraft(id.value, revision.value, {
          idempotencyKey: `submit:${id.value}:${revision.value}`,
        });
        await router.push({ path: "/organization", query: { case: caseId } });
      } else {
        message.value =
          "Rascunho salvo neste navegador. Você pode retomá-lo pela organização.";
        await router.replace(`/organization/drafts/${id.value}`);
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : "Não foi possível salvar.";
    } finally {
      busy.value = false;
    }
  }
  return {
    conflict,
    resolveConflict,
    input,
    step,
    busy,
    ready,
    error,
    message,
    issues,
    next,
    save,
    saveStatus,
    dirty,
  };
}
