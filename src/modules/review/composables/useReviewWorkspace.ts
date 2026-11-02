import {
  computed,
  watch,
  ref,
  onScopeDispose,
  onMounted,
  onServerPrefetch,
} from "vue";
import { useRoute, useRouter } from "vue-router";
import { useServices } from "../../../app/services";
import { useAsyncResource } from "../../../shared/composables/useAsyncResource";
import type { ReviewCase, PublicationStatus } from "../../cases/domain/case";

export function useReviewWorkspace() {
  const { cases, workspace } = useServices();
  const resource = useAsyncResource<ReviewCase[]>(() => cases.listReview(), []);
  onMounted(resource.refresh);
  onServerPrefetch(resource.refresh);
  onScopeDispose(cases.subscribe(resource.refresh));

  const route = useRoute(),
    router = useRouter();
  const filter = computed<PublicationStatus | "">(() =>
    ["published", "withdrawn", "in_review"].includes(String(route.query.status))
      ? (route.query.status as PublicationStatus)
      : "",
  );
  const selected = ref(
    typeof route.query.case === "string"
      ? route.query.case
      : workspace.getState().organization.casePrefix + "beatriz-santos",
  );
  watch(
    () => route.query.case,
    (value) => {
      if (typeof value === "string") {
        selected.value = value;
        success.value = "";
        decisionError.value = "";
      }
    },
  );
  const busy = ref(false);
  const decisionError = ref("");
  const success = ref("");
  const filtered = computed(() =>
    resource.data.value.filter(
      (c) => !filter.value || c.status === filter.value,
    ),
  );
  const current = computed(
    () =>
      filtered.value.find((c) => c.id === selected.value) ?? filtered.value[0],
  );
  const stats = computed(() => ({
    pending: resource.data.value.filter((c) => c.status === "in_review").length,
    published: resource.data.value.filter((c) => c.status === "published")
      .length,
    withdrawn: resource.data.value.filter((c) => c.status === "withdrawn")
      .length,
  }));

  function setFilter(value: string) {
    if (
      value === "" ||
      value === "published" ||
      value === "withdrawn" ||
      value === "in_review"
    )
      void router.replace({
        query: { ...route.query, status: value || undefined },
      });
  }

  function select(id: string) {
    selected.value = id;
    if (route.query.case !== id)
      void router.replace({ query: { ...route.query, case: id } });
    success.value = "";
    decisionError.value = "";
  }

  const position = computed(() =>
    filtered.value.findIndex((c) => c.id === current.value?.id),
  );
  function move(delta: number) {
    if (busy.value) return;
    const next = filtered.value[position.value + delta];
    if (next) select(next.id);
  }
  function keyboard(event: KeyboardEvent) {
    const target = event.target as HTMLElement | null;
    if (
      !event.altKey ||
      event.ctrlKey ||
      event.metaKey ||
      event.shiftKey ||
      event.repeat ||
      target?.closest(
        'input,textarea,select,[contenteditable="true"],[role="dialog"],[role="listbox"]',
      )
    )
      return;
    if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
      event.preventDefault();
      move(event.key === "ArrowRight" ? 1 : -1);
    }
  }
  onMounted(() => window.addEventListener("keydown", keyboard));
  onScopeDispose(() => {
    if (typeof window !== "undefined")
      window.removeEventListener("keydown", keyboard);
  });

  async function decide(status: "published" | "withdrawn", reason: string) {
    if (!current.value || busy.value) return;
    busy.value = true;
    decisionError.value = "";
    success.value = "";
    try {
      await cases.decide(
        current.value.id,
        status,
        reason,
        current.value.revision,
        {
          idempotencyKey: `decision:${current.value.id}:${current.value.revision}:${status}`,
        },
      );
      await resource.refresh();
      success.value =
        status === "published"
          ? "Publicação aprovada. O aviso já está disponível no site e na prévia da rede."
          : "Divulgação retirada do site e da prévia da rede.";
    } catch (cause) {
      decisionError.value =
        cause instanceof Error
          ? cause.message
          : "Não foi possível registrar a decisão.";
    } finally {
      busy.value = false;
    }
  }

  return {
    ...resource,
    position,
    move,
    filter,
    setFilter,
    filtered,
    current,
    stats,
    busy,
    decisionError,
    success,
    select,
    decide,
  };
}
