import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import {
  activeCaseFilters,
  caseSearchQuery,
  readCaseSearch,
  type SearchField,
} from "../presentation/search-state";

export function useCaseSearch() {
  const route = useRoute(),
    router = useRouter();
  const state = computed(() => readCaseSearch(route.query));
  let pending: Partial<Record<SearchField, string>> = {};
  let navigation = 0;
  async function patch(changes: Partial<Record<SearchField, string>>) {
    const current = ++navigation;
    pending = { ...pending, ...changes };
    try {
      await router.replace({
        query: caseSearchQuery({ ...state.value, page: "1", ...pending }),
      });
    } finally {
      if (current === navigation) pending = {};
    }
  }
  const field = (key: SearchField) =>
    computed({
      get: () => state.value[key],
      set: (value: string) => {
        void patch({ [key]: value });
      },
    });
  async function removeFilter(key: SearchField) {
    await patch({ [key]: "" });
    // User event only: return keyboard focus to the field whose chip disappeared.
    const fields = {
      search: "filter-query",
      city: "filter-city",
      age: "filter-age",
      sort: "case-order",
      page: "case-page",
      pageSize: "case-page-size",
      dateField: "filter-date-field",
      from: "filter-from",
      to: "filter-to",
    };
    if (route.path === "/cases")
      document.getElementById(fields[key])?.focus({ preventScroll: true });
  }
  return {
    query: field("search"),
    city: field("city"),
    age: field("age"),
    order: field("sort"),
    page: field("page"),
    pageSize: field("pageSize"),
    dateField: field("dateField"),
    from: field("from"),
    to: field("to"),
    filters: computed(() => ({
      dateField: state.value.dateField as "missing" | "reviewed",
      from: state.value.from,
      to: state.value.to,
      query: state.value.search,
      city: state.value.city,
      age: state.value.age,
    })),
    context: computed(() => caseSearchQuery(state.value)),
    activeFilters: computed(() => activeCaseFilters(state.value)),
    removeFilter,
    reset: () =>
      patch({
        search: "",
        city: "",
        age: "",
        dateField: "missing",
        from: "",
        to: "",
      }),
  };
}
