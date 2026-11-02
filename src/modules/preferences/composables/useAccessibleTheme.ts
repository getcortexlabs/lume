import { computed } from "vue";
import { defineTheme, type MavisTheme } from "@getcortexlabs/mavis-web";
import { usePreferences } from "./usePreferences";
export function useAccessibleTheme(base: MavisTheme) {
  const preferences = usePreferences();
  return computed(() => {
    const { contrast, textSize } = preferences.state.value;
    const large = textSize === "large",
      high = contrast === "high";
    if (!large && !high && !preferences.reduced.value) return base;
    const dark = base.appearance === "dark";
    return defineTheme(
      {
        name: `${base.name}-accessible`,
        ...(high
          ? {
              colors: dark
                ? { text: "#ffffff", muted: "#f2f5ea", border: "#c7ee8e" }
                : {
                    text: "#10271b",
                    muted: "#263b2b",
                    border: "#526047",
                    danger: "#8c2020",
                  },
            }
          : {}),
        ...(large
          ? {
              typography: {
                body: { fontSize: 18 },
                caption: { fontSize: 16 },
                overline: { fontSize: 12 },
              },
              control: {
                sm: { fontSize: 16 },
                md: { fontSize: 18 },
                lg: { fontSize: 18 },
              },
              components: { input: { fontSize: 18 } },
            }
          : {}),
        ...(preferences.reduced.value
          ? {
              motion: {
                pressScale: 1,
                pressDuration: 0,
                releaseDuration: 0,
                releaseBounce: 0,
                enterDuration: 0,
                exitDuration: 0,
                enterOffset: 0,
              },
            }
          : {}),
      },
      base,
    );
  });
}
