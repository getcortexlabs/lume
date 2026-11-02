import type { DraftStore } from "../../intake/data/browser-draft-store";
import { withIdempotency } from "./idempotent-repository";
import { paginateCases, RepositoryError } from "../domain/api";
import { validateDraft, type CaseDraft } from "../../intake/domain/draft";
import { createFixtures } from "./fixtures";
import {
  matchesFilters,
  type CaseRepository,
  type PublicCase,
  type ReviewCase,
} from "../domain/case";
// Explicit public projection: internal evidence and decisions never leak to public views.
function publicSnapshot(c: ReviewCase): PublicCase {
  const {
    id,
    name,
    age,
    city,
    neighborhood,
    missingSince,
    reviewedAt,
    description,
    clothing,
    initials,
    color,
    source,
    revision,
  } = c;
  return {
    id,
    name,
    age,
    city,
    neighborhood,
    missingSince,
    reviewedAt,
    description,
    clothing,
    initials,
    color,
    source,
    revision,
  };
}
function recordVersion(
  c: ReviewCase,
  reason: string,
  at = new Date().toISOString(),
) {
  (c.versions ??= []).push({
    revision: c.revision,
    at,
    actor: "Revisor Lume · demonstração",
    reason,
    status: c.status,
    fields: publicSnapshot(c),
  });
}
export function createMockCaseRepository(
  draftStore?: DraftStore,
  fixtures: ReviewCase[] = createFixtures(),
): CaseRepository {
  const records = structuredClone(fixtures);
  records.forEach((c) =>
    recordVersion(c, "Versão inicial do exemplo fictício.", c.reviewedAt),
  );
  let drafts: CaseDraft[] = [];
  function readDrafts() {
    if (draftStore) drafts = draftStore.read();
    draftSequence = Math.max(
      draftSequence,
      ...drafts.map((d) => Number(d.id.slice(6))).filter(Number.isFinite),
      0,
    );
  }
  function commitDrafts(next: CaseDraft[]) {
    draftStore?.write(next);
    drafts = next;
  }
  let draftSequence = 0;
  const listeners = new Set<() => void>();
  const repository: CaseRepository = {
    async listDrafts() {
      readDrafts();
      return structuredClone(drafts);
    },
    async deleteDraft(id, expectedRevision) {
      readDrafts();
      const draft = drafts.find((d) => d.id === id);
      if (!draft)
        throw new RepositoryError("not_found", "Rascunho não encontrado.");
      if (draft.revision !== expectedRevision)
        throw new RepositoryError(
          "conflict",
          "Este rascunho mudou. Atualize a lista antes de excluir.",
        );
      commitDrafts(drafts.filter((d) => d.id !== id));
      listeners.forEach((l) => l());
    },
    async duplicateDraft(id, expectedRevision) {
      readDrafts();
      const draft = drafts.find((d) => d.id === id);
      if (!draft)
        throw new RepositoryError("not_found", "Rascunho não encontrado.");
      if (draft.revision !== expectedRevision)
        throw new RepositoryError(
          "conflict",
          "Este rascunho mudou. Atualize a lista antes de duplicar.",
        );
      return repository.saveDraft(null, { ...draft.input, authorized: false });
    },
    async getDraft(id) {
      readDrafts();
      return structuredClone(drafts.find((d) => d.id === id) ?? null);
    },
    async saveDraft(id, input, expectedRevision) {
      readDrafts();
      const next = structuredClone(drafts);
      let draft = next.find((d) => d.id === id);
      if (id && !draft)
        throw new RepositoryError("not_found", "Rascunho não encontrado.");
      if (draft && draft.revision !== expectedRevision)
        throw new RepositoryError(
          "conflict",
          "Este rascunho mudou. Reabra antes de salvar.",
        );
      if (!draft) {
        draft = {
          id: draftStore?.createId() ?? `draft-${draftSequence + 1}`,
          input: structuredClone(input),
          revision: 0,
          updatedAt: "",
        };
        next.unshift(draft);
      }
      draft.input = structuredClone(input);
      draft.revision++;
      draft.updatedAt = new Date().toISOString();
      commitDrafts(next);
      if (!draftStore) draftSequence++;
      listeners.forEach((l) => l());
      return structuredClone(draft);
    },
    async submitDraft(id, expectedRevision) {
      readDrafts();
      const draft = drafts.find((d) => d.id === id);
      if (!draft)
        throw new RepositoryError("not_found", "Rascunho não encontrado.");
      if (draft.revision !== expectedRevision)
        throw new RepositoryError(
          "conflict",
          "Este rascunho mudou. Reabra antes de enviar.",
        );
      const issues = validateDraft(draft.input);
      if (issues.length)
        throw new RepositoryError("validation", issues.join(" "));
      const input = draft.input,
        caseId = `case-${draft.id}`;
      commitDrafts(drafts.filter((d) => d.id !== id));
      records.unshift({
        ...input,
        id: caseId,
        age: Number(input.age),
        initials: input.name
          .trim()
          .split(/\s+/)
          .slice(0, 2)
          .map((n) => n[0])
          .join("")
          .toUpperCase(),
        color: "sage",
        revision: 1,
        reviewedAt: new Date().toISOString(),
        status: "in_review",
        history: [
          {
            action: "Cadastro enviado para revisão",
            at: new Date().toISOString(),
            reason:
              "Autorização simulada dos campos públicos registrada. Origem e evidências aguardam revisão humana.",
          },
        ],
      });

      recordVersion(records[0]!, "Cadastro fictício recebido para revisão.");
      listeners.forEach((l) => l());
      return caseId;
    },
    async searchPublic(query) {
      return paginateCases(
        records
          .filter((c) => c.status === "published" && matchesFilters(c, query))
          .map(publicSnapshot),
        query,
      );
    },
    async listPublic(filters = {}) {
      return records
        .filter((c) => c.status === "published" && matchesFilters(c, filters))
        .map(publicSnapshot);
    },
    async getPublicDetail(id) {
      const c = records.find((c) => c.id === id);
      if (c?.status === "published")
        return { state: "published", record: publicSnapshot(c) };
      return {
        state: c?.status === "withdrawn" ? "withdrawn" : "unavailable",
        record: null,
      };
    },
    async getPublic(id) {
      const c = records.find((c) => c.id === id && c.status === "published");
      return c ? publicSnapshot(c) : null;
    },
    async resolveSuggestion(
      id,
      suggestionId,
      value,
      quote,
      reason,
      expectedRevision,
    ) {
      const c = records.find((c) => c.id === id);
      if (!c || c.status !== "in_review")
        throw new RepositoryError(
          "validation",
          "Somente registros em revisão podem ser corrigidos.",
        );
      if (c.revision !== expectedRevision)
        throw new RepositoryError(
          "conflict",
          "Este registro mudou. Reabra a revisão antes de continuar.",
        );
      const suggestion = c.suggestions?.find((s) => s.id === suggestionId);
      if (!suggestion || suggestion.resolution)
        throw new RepositoryError("validation", "Sugestão não disponível.");
      if (
        !value.trim() ||
        !quote.trim() ||
        !c.evidence.includes(quote) ||
        !quote.includes(value.trim()) ||
        !reason.trim()
      )
        throw new RepositoryError(
          "validation",
          "Informe valor, trecho existente na fonte e justificativa. O trecho deve sustentar o valor.",
        );
      if (
        suggestion.field === "city" &&
        !["São Paulo", "Suzano", "Guarulhos"].includes(value)
      )
        throw new RepositoryError("validation", "Município fora do piloto.");
      c[suggestion.field] = value.trim();
      suggestion.resolution =
        value === suggestion.value ? "accepted" : "corrected";
      c.revision++;
      c.history.unshift({
        action:
          suggestion.resolution === "accepted"
            ? "Sugestão aceita pelo revisor"
            : "Campo corrigido pelo revisor",
        at: new Date().toISOString(),
        reason: `${reason.trim()} • Evidência: ${quote}`,
      });
      recordVersion(c, reason.trim());
      listeners.forEach((l) => l());
    },
    async listReview() {
      return structuredClone(records);
    },
    async decide(id, status, reason, expectedRevision) {
      const c = records.find((c) => c.id === id);
      if (!c)
        throw new RepositoryError("not_found", "Registro não encontrado.");
      if (c.revision !== expectedRevision)
        throw new RepositoryError(
          "conflict",
          "Este registro mudou. Reabra a revisão antes de continuar.",
        );
      if (!reason.trim())
        throw new RepositoryError("validation", "Informe o motivo da decisão.");
      if (c.status === "withdrawn" && status === "published")
        throw new RepositoryError(
          "validation",
          "Este aviso foi retirado. Uma nova autorização é necessária para republicar.",
        );
      if (
        status === "published" &&
        c.suggestions?.some((s) => s.conflict && !s.resolution)
      )
        throw new RepositoryError(
          "validation",
          "Resolva as divergências antes de publicar.",
        );
      const updating = c.status === "published" && status === "published";
      c.status = status;
      c.revision++;
      c.reviewedAt = new Date().toISOString();
      c.history.unshift({
        action:
          status === "published"
            ? updating
              ? "Divulgação revalidada"
              : "Publicação aprovada"
            : "Divulgação retirada",
        at: c.reviewedAt,
        reason: reason.trim(),
      });
      recordVersion(c, reason.trim(), c.reviewedAt);
      listeners.forEach((listener) => listener());
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
  return withIdempotency(repository);
}
