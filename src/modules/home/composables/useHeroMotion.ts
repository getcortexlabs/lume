import { markRaw } from "vue";
import { createMotionRegion } from "@getcortexlabs/mavis-core/experimental";
import { useMavisWebMotion } from "@getcortexlabs/mavis-web/experimental";

/** The opening is finite; all copy is readable in SSR and remains interactive. */
export function useHeroMotion() {
  const region = markRaw(createMotionRegion());
  useMavisWebMotion(region, (scope, element) => {
    const beats = [
      ...element.querySelectorAll<HTMLElement>("[data-hero-beat]"),
    ];
    for (const beat of beats) {
      scope.set(beat, { opacity: 1, y: 0 });
      scope.observeGeometry(beat);
    }
    scope.timeline(
      beats.map(
        (target, index) =>
          [
            target,
            { y: [48, 0], rotate: [1.2, 0] },
            { type: "tween", duration: 950, ease: "easeOut", at: index * 95 },
          ] as const,
      ),
    );
    const underline =
      element.querySelector<SVGPathElement>("[data-hero-stroke]");
    if (underline)
      scope.drawPath(underline, { progress: 0 }).animate(1, {
        duration: 1400,
        ease: "easeInOut",
      });
  });
  return region;
}
