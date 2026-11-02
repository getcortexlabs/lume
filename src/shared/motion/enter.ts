import { createViewportEnterDirective } from "@rafaelaugusto/jolt/web/vue";
import { motionRecipe } from "@getcortexlabs/mavis-core";
import { useMavisTheme } from "@getcortexlabs/mavis-web";
/** Per-component directive: Jolt owns DOM attachment, observation and disposal. */
export function useEntrance() {
  const { theme } = useMavisTheme();
  return createViewportEnterDirective({
    config: { reducedMotion: "user" },
    viewport: {
      ...motionRecipe(theme.value, "enter"),
      threshold: 0.12,
      once: true,
    },
  });
}
