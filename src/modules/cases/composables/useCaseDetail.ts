import {
  computed,
  watch,
  onScopeDispose,
  onServerPrefetch,
  type Ref,
} from "vue";
import { useServices } from "../../../app/services";
import { useAsyncResource } from "../../../shared/composables/useAsyncResource";
import type { PublicCaseDetail } from "../domain/case";

export function useCaseDetail(id: Ref<string>) {
  const { cases } = useServices();
  const resource = useAsyncResource<PublicCaseDetail>(
    () => cases.getPublicDetail(id.value),
    { state: "unavailable", record: null },
    () => `cases:detail:${id.value}`,
  );
  watch(id, resource.refresh, { immediate: true });
  if (typeof window !== "undefined")
    onScopeDispose(cases.subscribe(resource.refresh));
  onServerPrefetch(resource.refresh);
  return {
    ...resource,
    data: computed(() => resource.data.value.record),
    state: computed(() => resource.data.value.state),
  };
}
