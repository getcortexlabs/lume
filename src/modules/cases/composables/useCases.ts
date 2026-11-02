import { onScopeDispose, onServerPrefetch, watch, type Ref } from "vue";
import { useServices } from "../../../app/services";
import { useAsyncResource } from "../../../shared/composables/useAsyncResource";
import type { CaseFilters, PublicCase } from "../domain/case";
export function useCases(filters: Ref<CaseFilters>) {
  const { cases } = useServices();
  const resource = useAsyncResource<PublicCase[]>(
    () => cases.listPublic(filters.value),
    [],
    () => `cases:list:${JSON.stringify(filters.value)}`,
  );
  watch(filters, resource.refresh, { immediate: true, deep: true });
  if (typeof window !== "undefined")
    onScopeDispose(cases.subscribe(resource.refresh));
  onServerPrefetch(resource.refresh);
  return resource;
}
