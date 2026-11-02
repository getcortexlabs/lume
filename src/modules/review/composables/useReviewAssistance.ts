import { computed, ref, onMounted, onServerPrefetch, type Ref } from "vue";
import { useServices } from "../../../app/services";
import { normalize, type ReviewCase } from "../../cases/domain/case";
import type { FieldSuggestion } from "../domain/assistance";
export function useReviewAssistance(record: Ref<ReviewCase>) {
  const { cases } = useServices();
  const related = ref<ReviewCase[]>([]),
    busy = ref(false),
    error = ref("");
  const editing = ref(""),
    value = ref(""),
    quote = ref(""),
    reason = ref("");
  const suggestions = computed(() => record.value.suggestions ?? []);
  async function load() {
    try {
      related.value = (await cases.listReview()).filter(
        (c) =>
          c.id !== record.value.id &&
          (normalize(c.name) === normalize(record.value.name) ||
            (c.city === record.value.city &&
              Math.abs(c.age - record.value.age) <= 10 &&
              Math.abs(
                Date.parse(c.missingSince) -
                  Date.parse(record.value.missingSince),
              ) <=
                7 * 86400000)),
      );
    } catch {
      error.value = "Não foi possível consultar registros relacionados.";
    }
  }
  onMounted(load);
  onServerPrefetch(load);
  function edit(suggestion: FieldSuggestion) {
    editing.value = suggestion.id;
    value.value = suggestion.value;
    quote.value = suggestion.quote;
    reason.value = "";
    error.value = "";
  }
  async function resolve(suggestion: FieldSuggestion, accept: boolean) {
    busy.value = true;
    error.value = "";
    try {
      await cases.resolveSuggestion(
        record.value.id,
        suggestion.id,
        accept ? suggestion.value : value.value,
        accept ? suggestion.quote : quote.value,
        accept
          ? "Revisor de demonstração conferiu a sugestão e a evidência."
          : reason.value,
        record.value.revision,
      );
    } catch (e) {
      error.value =
        e instanceof Error
          ? e.message
          : "Não foi possível registrar a revisão.";
    } finally {
      busy.value = false;
    }
  }

  return {
    related,
    busy,
    error,
    editing,
    value,
    quote,
    reason,
    suggestions,
    edit,
    resolve,
  };
}
