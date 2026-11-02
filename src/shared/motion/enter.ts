import { onScopeDispose, watch, type ObjectDirective } from "vue";
import {
  createWebRuntime,
  type WebRuntime,
  type WebViewportOptions,
} from "@rafaelaugusto/jolt/web";
import { createViewportEnterDirective } from "@rafaelaugusto/jolt/web/vue";
import { motionRecipe } from "@getcortexlabs/mavis-core";
import { useMavisTheme } from "@getcortexlabs/mavis-web";
import { usePreferences } from "../../modules/preferences/composables/usePreferences";

/** The official directive owns entrances; this adapter configures its app preference. */
export function useEntrance(): ObjectDirective<
  HTMLElement,
  WebViewportOptions | undefined
> {
  const { theme } = useMavisTheme();
  const { reduced } = usePreferences();
  let runtime: WebRuntime | undefined;
  let directive: ReturnType<typeof createViewportEnterDirective> | undefined;
  watch(reduced, (value) =>
    runtime?.configure({ reducedMotion: value ? "always" : "user" }),
  );
  onScopeDispose(() => runtime?.dispose());
  return {
    mounted(el, binding, vnode, previous) {
      runtime ??= createWebRuntime(el.ownerDocument, {
        reducedMotion: reduced.value ? "always" : "user",
      });
      directive ??= createViewportEnterDirective({
        runtime,
        viewport: {
          ...motionRecipe(theme.value, "enter"),
          threshold: 0.12,
          once: true,
        },
      });
      directive.mounted?.(el, binding, vnode, previous);
    },
    updated: (el, binding, vnode, previous) =>
      directive?.updated?.(el, binding, vnode, previous),
    beforeUnmount: (el, binding, vnode, previous) =>
      directive?.beforeUnmount?.(el, binding, vnode, previous),
    getSSRProps: () => ({}),
  };
}
