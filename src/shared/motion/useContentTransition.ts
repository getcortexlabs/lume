import { motionRecipe } from "@getcortexlabs/mavis-core";
import { useMavisTheme } from "@getcortexlabs/mavis-web";
import { shallowRef, watch } from "vue";
import { useWebMotion } from "@rafaelaugusto/jolt/web/vue";
import { usePreferences } from "../../modules/preferences/composables/usePreferences";
/** Vue owns presence and focusability; Jolt owns playback and cancellation. */
export function useContentTransition() {
  const { reduced } = usePreferences();
  const { theme } = useMavisTheme();
  const entrance = motionRecipe(theme.value, "enter");
  const exit = motionRecipe(theme.value, "exit");
  const motion = useWebMotion(shallowRef<HTMLElement | null>(null), {
    reducedMotion: reduced.value ? "always" : "user",
    // Keep incoming copy at full contrast, including during reduced motion.
    enter: { ...entrance, keyframes: { opacity: [1, 1], y: [10, 0] } },
    leave: exit,
  });
  watch(reduced, (value) =>
    motion.configure({ reducedMotion: value ? "always" : "user" }),
  );
  function interactive(el: Element, value: boolean) {
    if (el instanceof HTMLElement) el.inert = !value;
  }
  return {
    ...motion.transition,
    mode: "out-in" as const,
    onBeforeEnter: (el: Element) => interactive(el, true),
    onBeforeLeave: (el: Element) => interactive(el, false),
    onLeaveCancelled: (el: Element) => {
      motion.transition.onLeaveCancelled(el);
      interactive(el, true);
    },
  };
}
