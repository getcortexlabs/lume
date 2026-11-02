import type { LocationQuery, LocationQueryRaw } from "vue-router";
import type { PublicCase } from "../domain/case";
import { ageOptions, cityOptions } from "./choices";

export const orderOptions = [
  { value: "reviewed", label: "Revisados recentemente" },
  { value: "missing", label: "Desaparecimentos mais recentes" },
  { value: "name", label: "Nome (A–Z)" },
] as const;
export type SearchField =
  | "search"
  | "city"
  | "age"
  | "sort"
  | "dateField"
  | "from"
  | "to"
  | "page"
  | "pageSize";
export type CaseSearchState = Record<SearchField, string>;
export interface ActiveCaseFilter {
  key: Exclude<SearchField, "sort" | "dateField" | "page" | "pageSize">;
  label: string;
  removeLabel: string;
}

function validDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    !Number.isNaN(Date.parse(value)) &&
    new Date(value).toISOString().slice(0, 10) === value
    ? value
    : "";
}

/** Only known public search fields cross from the results URL to a detail URL. */
export function readCaseSearch(query: LocationQuery): CaseSearchState {
  const value = (key: SearchField) =>
    typeof query[key] === "string" ? query[key] : "";
  const city = value("city"),
    age = value("age"),
    order = value("sort");
  return {
    page:
      /^\d+$/.test(value("page")) && Number(value("page")) > 0
        ? value("page")
        : "1",
    pageSize: ["2", "4", "12"].includes(value("pageSize"))
      ? value("pageSize")
      : "12",
    dateField: value("dateField") === "reviewed" ? "reviewed" : "missing",
    from: validDate(value("from")),
    to: validDate(value("to")),
    search: value("search"),
    city: cityOptions.some((option) => option.value === city) ? city : "",
    age: ageOptions.some((option) => option.value === age) ? age : "",
    sort: orderOptions.some((option) => option.value === order)
      ? order
      : "reviewed",
  };
}

export function caseSearchQuery(state: CaseSearchState): LocationQueryRaw {
  return Object.fromEntries(
    Object.entries(state).filter(
      ([key, value]) =>
        value &&
        !(key === "sort" && value === "reviewed") &&
        !(key === "dateField" && value === "missing") &&
        !(key === "page" && value === "1") &&
        !(key === "pageSize" && value === "12"),
    ),
  );
}

export function activeCaseFilters(state: CaseSearchState): ActiveCaseFilter[] {
  const result: ActiveCaseFilter[] = [];
  if (state.search)
    result.push({
      key: "search",
      label: `Busca: ${state.search}`,
      removeLabel: "Remover busca por nome ou cidade",
    });
  if (state.city)
    result.push({
      key: "city",
      label: state.city,
      removeLabel: "Remover filtro de cidade",
    });
  if (state.age)
    result.push({
      key: "age",
      label: String(
        ageOptions.find((option) => option.value === state.age)?.label,
      ),
      removeLabel: "Remover filtro de faixa etária",
    });
  const period = state.dateField === "reviewed" ? "Revisão" : "Desaparecimento";
  for (const key of ["from", "to"] as const) {
    if (state[key])
      result.push({
        key,
        label: `${period} ${key === "from" ? "a partir de" : "até"} ${state[key].split("-").reverse().join("/")}`,
        removeLabel: `Remover data ${key === "from" ? "inicial" : "final"}`,
      });
  }
  return result;
}

export function orderPublicCases(records: PublicCase[], order: string) {
  return [...records].sort((a, b) => {
    const byName = a.name.localeCompare(b.name, "pt-BR");
    if (order === "name") return byName || a.id.localeCompare(b.id);
    const key = order === "missing" ? "missingSince" : "reviewedAt";
    return (
      new Date(b[key]).getTime() - new Date(a[key]).getTime() ||
      byName ||
      a.id.localeCompare(b.id)
    );
  });
}
