import { markRaw } from "vue";
import { createMotionRegion } from "@getcortexlabs/mavis-core/experimental";
import { useMavisWebMotion } from "@getcortexlabs/mavis-web/experimental";

/** The statement enters once; the decorative line follows reading, never a timer. */
export function useKindnessMotion() {
  const region = markRaw(createMotionRegion());
  useMavisWebMotion(region, (scope, element) => {
    const lines = [
      ...element.querySelectorAll<HTMLElement>("[data-kindness-line]"),
    ];
    for (const [index, line] of lines.entries()) {
      scope.set(line, { y: 0 });
      scope.observeGeometry(line);
      scope.viewportEnter(line, {
        keyframes: { y: [50, 0], rotate: [1, 0] },
        transition: { duration: 900, delay: index * 100, ease: "easeOut" },
        threshold: 0.3,
        once: true,
      });
    }
    const ribbon = element.querySelector<HTMLElement>(
      "[data-kindness-ribbon]",
    )!;
    scope.set(ribbon, { x: 0 });
    scope.observeGeometry(ribbon);
    scope.scrollLinked(
      element.ownerDocument,
      ribbon,
      { x: [0, -220] },
      {
        range: [0, 4000],
      },
    );
  });
  return region;
}
