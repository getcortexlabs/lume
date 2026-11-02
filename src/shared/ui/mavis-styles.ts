import type { CSSProperties } from "vue";
import type { TextVariant, Palette } from "@getcortexlabs/mavis-web";

/** Public Mavis style overrides bridge responsive CSS with theme tokens.
 * Mavis alpha.6 supplies public tokens; these helpers express Lume editorial overrides.
 * No Mavis internals or DOM nodes are patched.
 */
export function textStyle(
  variant: TextVariant = "body",
  tone: keyof Palette = "text",
): CSSProperties {
  return {
    margin: undefined,
    whiteSpace: "var(--copy-wrap, normal)" as CSSProperties["whiteSpace"],
    "--m-text-font-size": `var(--copy-size, var(--m-type-${variant}-font-size))`,
    "--m-text-font-weight": `var(--copy-weight, var(--m-type-${variant}-font-weight))`,
    "--m-text-letter-spacing": `var(--copy-tracking, var(--m-type-${variant}-letter-spacing))`,
    "--m-text-line-height": `var(--copy-leading, var(--m-type-${variant}-line-height))`,
    color:
      variant === "caption" && tone === "text"
        ? "var(--copy-color, inherit)"
        : `var(--copy-color, var(--m-color-${tone}))`,
    textAlign: "var(--copy-align, left)" as CSSProperties["textAlign"],
  };
}

export function flowStyle(direction: "row" | "column" = "row"): CSSProperties {
  return {
    gap: "var(--flow-gap, 0px)",
    flexDirection:
      `var(--flow-direction, ${direction})` as CSSProperties["flexDirection"],
    alignItems: `var(--flow-align, ${direction === "row" ? "center" : "stretch"})`,
    justifyContent: "var(--flow-justify, flex-start)",
    flexWrap: "var(--flow-wrap, nowrap)" as CSSProperties["flexWrap"],
  };
}

export const cardStyle: CSSProperties = {
  padding: "var(--card-padding, 0px)",
  backgroundColor: "var(--card-surface, var(--m-color-surface))",
  border: "var(--card-border, 1px solid var(--m-color-border))",
  borderRadius: "var(--card-radius, var(--m-radius-md))",
};
