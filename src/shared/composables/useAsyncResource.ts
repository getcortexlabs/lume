import { inject, onScopeDispose, ref, shallowRef } from "vue";
import { resourceHydrationKey } from "./resource-hydration";
export function useAsyncResource<T>(
  loader: () => Promise<T>,
  initial: T,
  publicKey?: () => string,
) {
  const hydration = inject(resourceHydrationKey, null);
  const data = shallowRef<T>(initial),
    loading = ref(false),
    error = ref("");
  let request = 0;
  let pending: { key: string; promise: Promise<void> } | undefined;
  function refresh(): Promise<void> {
    const key = publicKey?.() ?? "";
    if (key && hydration?.reuse() && hydration.has(key)) {
      request++;
      pending = undefined;
      data.value = hydration.read(key) as T;
      loading.value = false;
      error.value = "";
      return Promise.resolve();
    }
    if (pending?.key === key && hydration?.reuse()) return pending.promise;
    const current = ++request;
    loading.value = true;
    error.value = "";
    const promise = Promise.resolve()
      .then(loader)
      .then((result) => {
        if (current === request) {
          data.value = result;
          if (key) hydration?.write(key, result);
        }
      })
      .catch((cause) => {
        if (current === request) {
          data.value = initial;
          error.value =
            cause instanceof Error
              ? cause.message
              : "Não foi possível carregar. Tente novamente.";
        }
      })
      .finally(() => {
        if (current === request) {
          loading.value = false;
          pending = undefined;
        }
      });
    pending = { key, promise };
    return promise;
  }
  onScopeDispose(() => {
    request++;
    pending = undefined;
  });
  return { data, loading, error, refresh };
}
