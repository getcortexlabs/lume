import { watch, onScopeDispose, onServerPrefetch, type Ref } from "vue";
import { useServices } from "../../../app/services";
import { useAsyncResource } from "../../../shared/composables/useAsyncResource";
import type { Page, PublicCaseQuery } from "../domain/api";
import type { PublicCase } from "../domain/case";
export function usePublicResults(query: Ref<PublicCaseQuery>) {
  const { cases } = useServices();
  const resource = useAsyncResource<Page<PublicCase>>(
    () => cases.searchPublic(query.value),
    { items: [], total: 0, page: 1, pageSize: 12 },
    () => `cases:page:${JSON.stringify(query.value)}`,
  );
  watch(query, resource.refresh, { immediate: true, deep: true });
  if (typeof window !== "undefined")
    onScopeDispose(cases.subscribe(resource.refresh));
  onServerPrefetch(resource.refresh);
  return resource;
}
