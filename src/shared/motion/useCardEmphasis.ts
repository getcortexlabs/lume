import { computed, markRaw, onScopeDispose, ref, watch } from "vue";
import {
  createMotionSurface,
  type MotionSurface,
} from "@getcortexlabs/mavis-core/experimental";

/** Hover and keyboard focus share one presentation with Mavis press feedback. */
export function useCardEmphasis() {
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
  watch(active, (value) =>
    motion?.animate(
      { y: value ? -4 : 0 },
      {
        type: "tween",
        duration: 220,
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
