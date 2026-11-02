import type {
  OperationsRepository,
  SourceHealth,
} from "../../operations/domain/operations";
export interface SourceInput {
  name: string;
  url: string;
  owner: string;
  frequencyHours: number;
  enabled: boolean;
}
export interface SourceImport {
  externalId: string;
  caseId: string;
  receivedAt: string;
  result: "imported" | "duplicate" | "conflict";
  summary: string;
}
export interface ManagedSource
  extends Omit<SourceHealth, "enabled" | "owner">, SourceInput {
  revision: number;
  lastSuccessAt: string | null;
  lastError: string | null;
  imports: SourceImport[];
}
export interface SourcesRepository extends OperationsRepository {
  listSources(): Promise<ManagedSource[]>;
  saveSource(
    id: string | null,
    input: SourceInput,
    expectedRevision?: number,
  ): Promise<ManagedSource>;
  checkSource(id: string): Promise<void>;
  subscribe(listener: () => void): () => void;
}
export const emptySource = (): SourceInput => ({
  name: "",
  url: "https://example.com/notices",
  owner: "",
  frequencyHours: 24,
  enabled: true,
});
export function validateSource(input: SourceInput): string[] {
  const issues: string[] = [];
  if (!input.name.trim()) issues.push("Informe o nome da fonte fictícia.");
  if (!input.owner.trim()) issues.push("Defina quem acompanha esta fonte.");
  try {
    const url = new URL(input.url);
    if (url.protocol !== "https:" || url.username || url.password || url.hash)
      throw new Error();
  } catch {
    issues.push("Informe uma URL HTTPS sem credenciais ou fragmento.");
  }
  if (
    !Number.isInteger(input.frequencyHours) ||
    input.frequencyHours < 1 ||
    input.frequencyHours > 168
  )
    issues.push("A frequência deve ser entre 1 e 168 horas.");
  return issues;
}
