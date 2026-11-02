import { markRaw, onScopeDispose, watch, type Ref } from "vue";
import {
  createMotionRegion,
  createMotionSurface,
  whenMotionAvailable,
  type MotionSurface,
} from "@getcortexlabs/mavis-core/experimental";
import { useLumeWebMotion } from "../../../shared/motion/useLumeWebMotion";
import { usePreferences } from "../../preferences/composables/usePreferences";
export function useConnectionMotion(city: Ref<string>) {
  const { reduced } = usePreferences();
  const region = markRaw(createMotionRegion()),
    surface = markRaw(createMotionSurface());
  let interaction: MotionSurface | undefined;
  const release = whenMotionAvailable([region, surface], () =>
    watch(
      reduced,
      (disabled, _, cleanup) => {
        if (disabled) return;
        cleanup(
          surface.use((motion) => {
            interaction = motion;
            const pointer = motion.pointerFollow(region, {
              range: { x: [-13, 13], y: [-10, 10] },
              spring: { stiffness: 115, damping: 19, mass: 1 },
            });
            motion.bind({
              x: pointer.x,
              y: pointer.y,
              rotate: pointer.x.to([-13, 13], [-5, 5]),
            });
            return () => {
              interaction = undefined;
            };
          }),
        );
      },
      { immediate: true, flush: "sync" },
    ),
  );
  watch(city, () =>
    interaction?.animate(
      { scale: [1, 1.08, 1] },
      { type: "tween", duration: 480, ease: "easeInOut" },
    ),
  );
  onScopeDispose(release);
  useLumeWebMotion(region, (scope, element) => {
    const nodes = [
      ...element.querySelectorAll<HTMLElement>("[data-network-node]"),
    ];
    for (const node of nodes) {
      scope.set(node, { x: 0, y: 0 });
      scope.observeGeometry(node);
    }
    scope.timeline(
      nodes.map(
        (target, index) =>
          [
            target,
            { x: [index === 0 ? -24 : 24, 0], y: [18, 0] },
            { duration: 850, ease: "easeOut", at: index * 160 },
          ] as const,
      ),
    );
    const paths = [
      ...element.querySelectorAll<SVGPathElement>("[data-connection]"),
    ].map((path) => ({
      city: path.dataset.connection,
      drawing: scope.drawPath(path, { progress: 0 }),
    }));
    const aura = element.querySelector<HTMLElement>(".beacon-aura")!;
    const caption = element.querySelector<HTMLElement>(
      ".network-caption-copy",
    )!;
    const field = element.querySelector<HTMLElement>(".orbit-field")!;
    for (const target of [aura, caption, field]) {
      scope.set(target, { opacity: 1 });
      scope.observeGeometry(target);
    }
    scope.animate(
      field,
      { scale: [0.92, 1] },
      { duration: 1200, ease: "easeOut" },
    );
    function connect() {
      for (const path of paths)
        path.drawing.animate(path.city === city.value ? 1 : 0, {
          type: "tween",
          duration: path.city === city.value ? 1050 : 380,
          ease: "easeInOut",
        });
      scope.animate(
        aura,
        { scale: [0.9, 1.17, 1] },
        { duration: 1250, ease: "easeOut" },
      );
      scope.animate(caption, { y: [7, 0] }, { duration: 380, ease: "easeOut" });
    }
    connect();
    return watch(city, connect, { flush: "post" });
  });
  return { region, surface };
}
