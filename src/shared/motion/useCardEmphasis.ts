import { computed, markRaw, onScopeDispose, ref, watch } from "vue";
import {
  createMotionSurface,
  type MotionSurface,
} from "@getcortexlabs/mavis-core/experimental";

import { usePreferences } from "../../modules/preferences/composables/usePreferences";

/** Hover and keyboard focus share one presentation with Mavis press feedback. */
export function useCardEmphasis() {
  const { reduced } = usePreferences();
  const surface = markRaw(createMotionSurface());
  const hovered = ref(false),
    focused = ref(false);
  const active = computed(() => hovered.value || focused.value);
  let motion: MotionSurface | undefined;
  const release = surface.use((owner) => {
    motion = owner;
    return () => {
      motion = undefined;
    };
  });
  watch([active, reduced], ([value, disabled]) =>
    motion?.animate(
      { y: value && !disabled ? -4 : 0 },
      {
        type: "tween",
        duration: disabled ? 0 : 220,
        ease: "easeOut",
      },
    ),
  );
  onScopeDispose(release);
  return {
    surface,
    events: {
      pointerenter: (event: PointerEvent) => {
        if (event.pointerType !== "touch") hovered.value = true;
      },
      pointerleave: () => {
        hovered.value = false;
      },
      focusin: () => {
        focused.value = true;
      },
      focusout: () => {
        focused.value = false;
      },
    },
  };
}
