import { emptyDraft, type CaseDraft } from "../domain/draft";
export interface DraftStore {
  createId(): string;
  read(): CaseDraft[];
  write(drafts: CaseDraft[]): void;
}
export const DRAFT_STORAGE_KEY = "lume:demo-drafts:v1";
/** Access is lazy: called only by client-side intake workflows, never SSR. */
export function createBrowserDraftStore(
  storage: () => Storage,
  key = DRAFT_STORAGE_KEY,
): DraftStore {
  return {
    createId: () => `draft-${crypto.randomUUID()}`,
    read() {
      try {
        const raw = storage().getItem(key);
        if (!raw) return [];
        const parsed: unknown = JSON.parse(raw);
        if (
          !Array.isArray(parsed) ||
          !parsed.every(
            (draft) =>
              draft &&
              typeof draft.id === "string" &&
              /^draft-(?:\d+|[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})$/.test(
                draft.id,
              ) &&
              Number.isSafeInteger(draft.revision) &&
              draft.revision > 0 &&
              typeof draft.updatedAt === "string" &&
              Number.isFinite(Date.parse(draft.updatedAt)) &&
              draft.input &&
              Object.entries(emptyDraft()).every(
                ([key, value]) => typeof draft.input[key] === typeof value,
              ),
          ) ||
          new Set(parsed.map((d) => d.id)).size !== parsed.length
        )
          throw new Error();
        // Reconstruct the allowlisted shape instead of trusting browser storage.
        return parsed.map((d) => ({
          id: d.id,
          revision: d.revision,
          updatedAt: d.updatedAt,
          input: Object.fromEntries(
            Object.keys(emptyDraft()).map((key) => [key, d.input[key]]),
          ) as CaseDraft["input"],
        }));
      } catch {
        throw new Error(
          "Não foi possível ler os rascunhos locais. Os dados guardados não foram substituídos.",
        );
      }
    },
    write(drafts) {
      try {
        storage().setItem(key, JSON.stringify(drafts));
      } catch {
        throw new Error(
          "Não foi possível salvar neste navegador. Mantenha esta página aberta e tente novamente.",
        );
      }
    },
  };
}
