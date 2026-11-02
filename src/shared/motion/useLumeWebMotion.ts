import { watch } from "vue";
import { useMavisWebMotion } from "@getcortexlabs/mavis-web/experimental";
import type { MotionRegion } from "@getcortexlabs/mavis-core/experimental";
import type {
  WebMotionResource,
  WebMotionScope,
} from "@rafaelaugusto/jolt/web";
import { usePreferences } from "../../modules/preferences/composables/usePreferences";

/** Borrow Mavis' scope and release decorative work when motion is reduced. */
export function useLumeWebMotion(
  region: MotionRegion,
  setup: (
    scope: WebMotionScope,
    element: HTMLElement,
  ) => void | WebMotionResource,
) {
  const { reduced } = usePreferences();
  return useMavisWebMotion(region, (owner, element) => {
    const stop = watch(
      reduced,
      (disabled, _, cleanup) => {
        if (disabled) return;
        const scope = owner.scope();
        scope.use((active) => setup(active, element));
        cleanup(() => scope.dispose());
      },
      { immediate: true, flush: "sync" },
    );
    return stop;
  });
}
