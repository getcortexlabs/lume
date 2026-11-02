import { inject } from "vue";
import { preferencesKey } from "../data/browser-preferences";
export function usePreferences() {
  const preferences = inject(preferencesKey);
  if (!preferences)
    throw new Error("Preferences must be provided per application");
  return preferences;
}
