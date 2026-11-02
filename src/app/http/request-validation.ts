import { RepositoryError } from "../../modules/cases/domain/api";
import { emptyDraft, type DraftInput } from "../../modules/intake/domain/draft";
import type { SourceInput } from "../../modules/sources/domain/source";
export function object(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new RepositoryError("validation", "Objeto JSON inválido.");
  return value as Record<string, unknown>;
}
export function draftInput(value: unknown): DraftInput {
  const input = object(value),
    empty = emptyDraft();
  if (
    Object.keys(input).some((k) => !(k in empty)) ||
    Object.entries(empty).some(
      ([key, initial]) => typeof input[key] !== typeof initial,
    )
  )
    throw new RepositoryError("validation", "Campos do rascunho inválidos.");
  return { ...input } as unknown as DraftInput;
}
export function sourceInput(value: unknown): SourceInput {
  const input = object(value);
  if (
    ["name", "url", "owner"].some((k) => typeof input[k] !== "string") ||
    typeof input.frequencyHours !== "number" ||
    typeof input.enabled !== "boolean"
  )
    throw new RepositoryError("validation", "Campos da fonte inválidos.");
  return {
    name: input.name as string,
    url: input.url as string,
    owner: input.owner as string,
    frequencyHours: input.frequencyHours,
    enabled: input.enabled,
  };
}
