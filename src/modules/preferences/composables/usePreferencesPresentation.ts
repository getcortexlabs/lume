import { watch } from "vue";
import { useHead } from "#app";
import { useMavisTheme } from "@getcortexlabs/mavis-web";
import { lumeTheme } from "../../../app/theme";
import { useAccessibleTheme } from "./useAccessibleTheme";
import { usePreferences } from "./usePreferences";
export function usePreferencesPresentation() {
  const preferences = usePreferences();
  const theme = useAccessibleTheme(lumeTheme);
  const mavis = useMavisTheme();
  watch(theme, (value) => mavis.setTheme(value), { immediate: true });
  useHead(() => ({
    htmlAttrs: {
      "data-text-size": preferences.state.value.textSize,
      "data-contrast": preferences.state.value.contrast,
      "data-reduced-motion": preferences.reduced.value ? "true" : "false",
    },
  }));
}
