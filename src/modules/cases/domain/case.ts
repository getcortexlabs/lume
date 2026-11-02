import type { PublicCaseQuery, Page, MutationContext } from "./api";
import type { FieldSuggestion } from "../../review/domain/assistance";
import type { CaseDraft, DraftInput } from "../../intake/domain/draft";
export type PublicationStatus = "published" | "in_review" | "withdrawn";
export interface PublicCase {
  id: string;
  name: string;
  age: number;
  city: string;
  neighborhood: string;
  missingSince: string;
  reviewedAt: string;
  description: string;
  clothing: string;
  initials: string;
  color: string;
  source: string;
  revision: number;
}
export interface CaseVersion {
  revision: number;
  at: string;
  actor: string;
  reason: string;
  status: PublicationStatus;
  fields: PublicCase;
}
export interface ReviewCase extends PublicCase {
  versions?: CaseVersion[];
  status: PublicationStatus;
  evidence: string;
  suggestions?: FieldSuggestion[];
  history: { action: string; at: string; reason: string }[];
}
export type PublicCaseDetail =
  | { state: "published"; record: PublicCase }
  | { state: "withdrawn" | "unavailable"; record: null };

export interface CaseFilters {
  dateField?: "missing" | "reviewed";
  from?: string;
  to?: string;
  query?: string;
  city?: string;
  age?: string;
}
export interface CaseRepository {
  listDrafts(): Promise<CaseDraft[]>;
  deleteDraft(
    id: string,
    expectedRevision: number,
    context?: MutationContext,
  ): Promise<void>;
  duplicateDraft(
    id: string,
    expectedRevision: number,
    context?: MutationContext,
  ): Promise<CaseDraft>;
  getDraft(id: string): Promise<CaseDraft | null>;
  saveDraft(
    id: string | null,
    input: DraftInput,
    expectedRevision?: number,
    context?: MutationContext,
  ): Promise<CaseDraft>;
  submitDraft(
    id: string,
    expectedRevision: number,
    context?: MutationContext,
  ): Promise<string>;
  searchPublic(query: PublicCaseQuery): Promise<Page<PublicCase>>;
  listPublic(filters?: CaseFilters): Promise<PublicCase[]>;
  getPublicDetail(id: string): Promise<PublicCaseDetail>;
  getPublic(id: string): Promise<PublicCase | null>;
  resolveSuggestion(
    id: string,
    suggestionId: string,
    value: string,
    quote: string,
    reason: string,
    expectedRevision: number,
    context?: MutationContext,
  ): Promise<void>;
  listReview(): Promise<ReviewCase[]>;
  decide(
    id: string,
    status: "published" | "withdrawn",
    reason: string,
    expectedRevision: number,
    context?: MutationContext,
  ): Promise<void>;
  subscribe(listener: () => void): () => void;
}
export const normalize = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
export function matchesFilters(record: PublicCase, filters: CaseFilters) {
  const date = (
    filters.dateField === "reviewed" ? record.reviewedAt : record.missingSince
  ).slice(0, 10);
  return (
    (!filters.from || date >= filters.from) &&
    (!filters.to || date <= filters.to) &&
    (!filters.query ||
      normalize(`${record.name} ${record.city}`).includes(
        normalize(filters.query),
      )) &&
    (!filters.city || record.city === filters.city) &&
    (!filters.age ||
      (filters.age === "60+" ? record.age >= 60 : record.age < 60))
  );
}
export const formatDate = (value: string) =>
  new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(value));
