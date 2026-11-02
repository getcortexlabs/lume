import type { CaseFilters, PublicCase } from "./case";
export type ErrorCode =
  "unavailable" | "forbidden" | "conflict" | "not_found" | "validation";
export class RepositoryError extends Error {
  constructor(
    public readonly code: ErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "RepositoryError";
  }
}
export interface PublicCaseQuery extends CaseFilters {
  sort?: "reviewed" | "missing" | "name";
  page?: number;
  pageSize?: number;
}
export interface Page<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}
export function paginateCases(
  records: PublicCase[],
  query: PublicCaseQuery,
): Page<PublicCase> {
  const items = [...records].sort((a, b) => {
    const names =
      a.name.localeCompare(b.name, "pt-BR") || a.id.localeCompare(b.id);
    if (query.sort === "name") return names;
    const field = query.sort === "missing" ? "missingSince" : "reviewedAt";
    return Date.parse(b[field]) - Date.parse(a[field]) || names;
  });
  const pageSize = Math.min(48, Math.max(1, Math.trunc(query.pageSize || 12)));
  const page = Math.min(
    Math.max(1, Math.ceil(items.length / pageSize)),
    Math.max(1, Math.trunc(query.page || 1)),
  );
  return {
    items: items.slice((page - 1) * pageSize, page * pageSize),
    total: items.length,
    page,
    pageSize,
  };
}

export interface MutationContext {
  idempotencyKey: string;
}
