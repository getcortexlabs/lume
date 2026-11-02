import {
  readCaseSearch,
  caseSearchQuery,
} from "../../cases/presentation/search-state";
import { cityOptions } from "../../cases/presentation/choices";

export interface SavedSearch {
  id: string;
  name: string;
  query: Record<string, string>;
}
export interface Preferences {
  version: 1;
  region: string;
  textSize: "standard" | "large";
  contrast: "standard" | "high";
  motion: "system" | "reduced";
  searches: SavedSearch[];
}
export const preferenceKey = "lume:preferences:v1";
export function defaultPreferences(): Preferences {
  return {
    version: 1,
    region: "",
    textSize: "standard",
    contrast: "standard",
    motion: "system",
    searches: [],
  };
}
export function publicSearchQuery(input: unknown): Record<string, string> {
  const raw =
    input && typeof input === "object" && !Array.isArray(input) ? input : {};
  const strings = Object.fromEntries(
    Object.entries(raw).filter(
      ([, value]) => typeof value === "string" && value.length <= 200,
    ),
  );
  return caseSearchQuery({ ...readCaseSearch(strings), page: "1" }) as Record<
    string,
    string
  >;
}
export function parsePreferences(input: unknown): Preferences {
  if (!input || typeof input !== "object" || Array.isArray(input))
    throw new Error("Invalid preferences");
  const value = input as Record<string, unknown>;
  if (value.version !== 1) throw new Error("Unsupported preferences version");
  const defaults = defaultPreferences();
  return {
    ...defaults,
    region: cityOptions.some((option) => option.value === value.region)
      ? String(value.region)
      : "",
    textSize: value.textSize === "large" ? "large" : "standard",
    contrast: value.contrast === "high" ? "high" : "standard",
    motion: value.motion === "reduced" ? "reduced" : "system",
    searches: Array.isArray(value.searches)
      ? value.searches
          .slice(0, 10)
          .flatMap((entry) => {
            if (
              !entry ||
              typeof entry !== "object" ||
              typeof entry.id !== "string" ||
              !/^[a-zA-Z0-9-]{1,64}$/.test(entry.id) ||
              typeof entry.name !== "string" ||
              !entry.name.trim()
            )
              return [];
            return [
              {
                id: entry.id,
                name: entry.name.trim().slice(0, 60),
                query: publicSearchQuery(entry.query),
              },
            ];
          })
          .filter(
            (entry, index, all) =>
              all.findIndex((other) => other.id === entry.id) === index,
          )
      : [],
  };
}
