import { markRaw, watch, type Ref } from "vue";
import { createMotionRegion } from "@getcortexlabs/mavis-core/experimental";
import { useLumeWebMotion } from "./useLumeWebMotion";
import type { WebItemsAnimation } from "@rafaelaugusto/jolt/web";
/** Mavis lends one scope; layout owns outer positions and keyed entrances animate inner wrappers. */
export function useListLayout(
  container: Ref<HTMLElement | null>,
  items: Readonly<Ref<unknown>>,
) {
  const region = markRaw(createMotionRegion());
  useLumeWebMotion(region, (scope) => {
    let entrances: WebItemsAnimation | undefined;
    const stopLayout = watch(
      items,
      () => {
        if (container.value?.isConnected)
          scope.animateLayout(container.value, {
            type: "tween",
            duration: 420,
            ease: "easeOut",
            size: false,
            enter: false,
          });
      },
      { flush: "pre" },
    );
    const stopEntrances = watch(
      [container, items],
      () => {
        const targets = [
          ...(container.value?.querySelectorAll<HTMLElement>(
            "[data-case-id]",
          ) ?? []),
        ].map((target) => ({ key: target.dataset.caseId!, target }));
        if (entrances) entrances.update(targets);
        else
          entrances = scope.animateItems(
            targets,
            { y: [14, 0] },
            {
              type: "tween",
              duration: 420,
              ease: "easeOut",
              once: true,
              threshold: 0.08,
            },
          );
      },
      { flush: "post", immediate: true },
    );
    return () => {
      stopLayout();
      stopEntrances();
    };
  });
  return region;
}
